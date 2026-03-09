import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Signing in...");
  const [form, setForm] = useState({ email: "", password: "" });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    const { email, password } = form;
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLoadingMessage("Authenticating...");

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return;
    }

    setLoadingMessage("Verifying admin privileges...");

    const userId = signInData.user?.id;
    if (!userId) {
      await supabase.auth.signOut();
      setLoading(false);
      toast({ title: "Login failed", description: "Could not verify user", variant: "destructive" });
      return;
    }

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const userRoles = roles?.map((r) => r.role) || [];
    const isAdmin = userRoles.includes("admin");

    if (!isAdmin) {
      await supabase.auth.signOut();
      setLoading(false);
      toast({ title: "Access denied", description: "Only administrators can access this panel. If you're faculty, please use the main login page.", variant: "destructive" });
      return;
    }

    setLoadingMessage("Loading admin panel...");
    toast({ title: "Welcome, Admin!", description: "Full access granted" });
    navigate("/admin");
    setLoading(false);
  };

  return (
    <Layout>
      <LoadingOverlay visible={loading} message={loadingMessage} />
      <div className="min-h-[90vh] flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[25%] w-[500px] h-[500px] rounded-full bg-destructive/5 blur-[120px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="premium-card rounded-3xl p-8 sm:p-10 w-full max-w-md relative border-glow"
        >
          <div className="text-center mb-8">
            <div className="relative inline-block mb-5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-destructive to-destructive/70 shadow-lg shadow-destructive/25">
                <Crown className="h-7 w-7 text-destructive-foreground" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-destructive to-destructive/70 blur-xl opacity-30" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-foreground tracking-tight">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Restricted area — administrators only</p>
          </div>

          <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 mb-6">
            <p className="text-xs text-muted-foreground text-center">
              <Shield className="h-3.5 w-3.5 inline mr-1 text-destructive" />
              This login is exclusively for system administrators. Unauthorized access attempts are logged.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@mrcet.ac.in"
                  className="pl-11 bg-secondary/30 border-border/50 h-12 rounded-xl"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-pass" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-pass"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 bg-secondary/30 border-border/50 h-12 rounded-xl"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              disabled={loading}
              onClick={handleAdminLogin}
              className="w-full bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:from-destructive/90 hover:to-destructive/70 glow-effect shimmer-btn h-12 rounded-xl font-semibold mt-2"
            >
              {loading ? "Verifying..." : "Sign In as Admin"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground">
              Not an admin?{" "}
              <a href="/login" className="text-primary font-semibold hover:underline">
                Go to Student / Faculty login
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
