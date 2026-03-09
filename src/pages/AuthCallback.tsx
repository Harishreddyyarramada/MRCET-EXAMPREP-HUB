import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (!error) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    };

    handleAuth();
  }, []);

  return <div>Verifying your email...</div>;
};

export default AuthCallback;