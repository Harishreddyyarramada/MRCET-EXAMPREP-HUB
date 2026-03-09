import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, User, Hash, GitBranch, Calendar, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";

const Signup = () => {
  const initialForm = {
    name: "", email: "", rollNumber: "", branch: "", year: "", password: "", confirmPassword: "",
  };
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.branch || !form.year) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error, needsEmailVerification } = await signUp(form.email, form.password, {
      full_name: form.name,
      roll_number: form.rollNumber,
      branch: form.branch,
      year: form.year,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      setForm(initialForm);
      if (needsEmailVerification) {
        toast({
          title: "Verification email sent",
          description: "Click the email link to verify your account and you will be logged in automatically.",
        });
      } else {
        toast({ title: "Account created!", description: "You are now logged in." });
        navigate("/dashboard");
      }
    }
  };

  const inputClass = "bg-secondary/30 border-border/50 h-12 rounded-xl";

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[30%] left-[15%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="premium-card rounded-3xl p-8 sm:p-10 w-full max-w-lg relative border-glow"
        >
          <div className="text-center mb-8">
            <div className="relative inline-block mb-5">
              <div className="p-4 rounded-2xl gradient-bg shadow-lg shadow-primary/25">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-2xl gradient-bg blur-xl opacity-30" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-foreground tracking-tight">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Join MRCET ExamPrep Hub</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="John Doe" className={`pl-11 ${inputClass}`} value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roll Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="21R11A05A1" className={`pl-11 ${inputClass}`} value={form.rollNumber} onChange={(e) => update("rollNumber", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="student@mrcet.ac.in" className={`pl-11 ${inputClass}`} value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Branch *</Label>
                <Select value={form.branch} onValueChange={(v) => update("branch", v)}>
                  <SelectTrigger className={inputClass}>
                    <GitBranch className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"].map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year *</Label>
                <Select value={form.year} onValueChange={(v) => update("year", v)}>
                  <SelectTrigger className={inputClass}>
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" className={`pl-11 ${inputClass}`} value={form.password} onChange={(e) => update("password", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm *</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" className={`pl-11 ${inputClass}`} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Your papers will be reviewed by faculty before appearing publicly.</p>
            </div>

            <Button disabled={loading} onClick={handleSignup} className="w-full gradient-bg text-primary-foreground glow-effect shimmer-btn h-12 rounded-xl font-semibold mt-2">
              {loading ? "Creating account..." : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">Sign In</Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Signup;
