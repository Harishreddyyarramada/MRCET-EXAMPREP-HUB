import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: callingUser } } = await supabaseUser.auth.getUser();
    if (!callingUser) throw new Error("Unauthorized");

    const { data: adminCheck } = await supabaseUser.rpc("has_role", { _user_id: callingUser.id, _role: "admin" });
    if (!adminCheck) throw new Error("Only admins can create faculty accounts");

    const { email, password, full_name, branch } = await req.json();
    if (!email || !password || !full_name) throw new Error("Email, password, and name are required");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) throw createError;
    if (!newUser.user) throw new Error("Failed to create user");

    const userId = newUser.user.id;

    if (branch) {
      await supabaseAdmin.from("profiles").update({ branch, full_name }).eq("user_id", userId);
    }

    // Remove default student role assigned by trigger, then assign faculty role
    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId).eq("role", "student");
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "faculty" });
    if (roleError) throw roleError;

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
