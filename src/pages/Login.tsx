import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentForm, setStudentForm] = useState({ email: "", password: "" });
  const [facultyForm, setFacultyForm] = useState({ email: "", password: "" });
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleStudentLogin = async () => {
    const { email, password } = studentForm;
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLoadingMessage("Signing in...");
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      setLoadingMessage("Loading dashboard...");
      toast({ title: "Welcome back!", description: "Login successful" });
      navigate("/dashboard");
      setLoading(false);
    }
  };

  const [loadingMessage, setLoadingMessage] = useState("Signing in...");

  const handleFacultyLogin = async () => {
    const { email, password } = facultyForm;
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLoadingMessage("Signing in...");

    // Sign in directly with supabase (not context) to avoid premature UI update
    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return;
    }

    setLoadingMessage("Verifying faculty access...");

    const userId = signInData.user?.id;
    if (!userId) {
      await supabase.auth.signOut();
      setLoading(false);
      toast({ title: "Login failed", description: "Could not verify user", variant: "destructive" });
      return;
    }

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const userRoles = roles?.map((r) => r.role) || [];
    const isFaculty = userRoles.includes("faculty");

    if (!isFaculty) {
      await supabase.auth.signOut();
      setLoading(false);
      toast({ title: "Access denied", description: "This login is for faculty only. Students please use the Student tab. Admins please use the Admin login.", variant: "destructive" });
      return;
    }

    setLoadingMessage("Preparing dashboard...");
    toast({ title: "Welcome back!", description: "Faculty login successful" });
    navigate("/faculty");
    setLoading(false);
  };

  const PasswordToggle = () => (
    <button type="button" className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)}>
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <Layout>
      <LoadingOverlay visible={loading} message={loadingMessage} />
      <div className="min-h-[90vh] flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[25%] left-[30%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[25%] right-[25%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="premium-card rounded-3xl p-8 sm:p-10 w-full max-w-md relative border-glow"
        >
          <div className="text-center mb-8">
            <div className="relative inline-block mb-5">
              <div className="p-4 rounded-2xl gradient-bg shadow-lg shadow-primary/25">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-2xl gradient-bg blur-xl opacity-30" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-foreground tracking-tight">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Sign in to MRCET ExamPrep Hub</p>
          </div>

          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 rounded-xl p-1 h-11">
              <TabsTrigger value="student" className="font-semibold rounded-lg text-sm data-[state=active]:shadow-md">
                <GraduationCap className="h-4 w-4 mr-1.5" /> Student
              </TabsTrigger>
              <TabsTrigger value="faculty" className="font-semibold rounded-lg text-sm data-[state=active]:shadow-md">
                <Shield className="h-4 w-4 mr-1.5" /> Faculty
              </TabsTrigger>
            </TabsList>

            {/* Student Login */}
            <TabsContent value="student" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="s-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input id="s-email" type="email" placeholder="student@mrcet.ac.in" className="pl-11 bg-secondary/30 border-border/50 h-12 rounded-xl"
                    value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-pass" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input id="s-pass" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-11 pr-11 bg-secondary/30 border-border/50 h-12 rounded-xl"
                    value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} />
                  <PasswordToggle />
                </div>
              </div>
              <Button disabled={loading} onClick={handleStudentLogin} className="w-full gradient-bg text-primary-foreground glow-effect shimmer-btn h-12 rounded-xl font-semibold mt-2">
                {loading ? "Signing in..." : "Sign In as Student"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Create Account - only for students */}
              <div className="mt-6 pt-4 border-t border-border/30 text-center">
                <p className="text-xs text-muted-foreground mb-3">New student?</p>
                <Link to="/signup">
                  <Button variant="outline" className="w-full rounded-xl h-11 border-border/50 font-semibold">
                    <Sparkles className="mr-2 h-4 w-4 text-primary" /> Create Student Account
                  </Button>
                </Link>
              </div>
            </TabsContent>

            {/* Faculty Login */}
            <TabsContent value="faculty" className="space-y-4">
              <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 mb-2">
                <p className="text-xs text-muted-foreground text-center">
                  <Shield className="h-3.5 w-3.5 inline mr-1 text-accent" />
                  Faculty accounts are created by the admin. Contact your administrator if you don't have an account.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Faculty Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input id="f-email" type="email" placeholder="faculty@mrcet.ac.in" className="pl-11 bg-secondary/30 border-border/50 h-12 rounded-xl"
                    value={facultyForm.email} onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-pass" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input id="f-pass" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-11 pr-11 bg-secondary/30 border-border/50 h-12 rounded-xl"
                    value={facultyForm.password} onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })} />
                  <PasswordToggle />
                </div>
              </div>
              <Button disabled={loading} onClick={handleFacultyLogin} className="w-full gradient-bg text-primary-foreground glow-effect shimmer-btn h-12 rounded-xl font-semibold mt-2">
                {loading ? "Verifying..." : "Sign In as Faculty"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Login;
