import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, GraduationCap, Building2, Calendar, Hash, Shield, UserCog, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigate, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import LoadingOverlay from "@/components/LoadingOverlay";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const Profile = () => {
  const { user, profile, roles, loading: authLoading, hasRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    roll_number: "",
    branch: "",
    year: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        roll_number: profile.roll_number || "",
        branch: profile.branch || "",
        year: profile.year || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = form.full_name.trim();
    if (!trimmedName) {
      toast({ title: "Error", description: "Full name is required", variant: "destructive" });
      return;
    }
    if (trimmedName.length > 100) {
      toast({ title: "Error", description: "Name must be less than 100 characters", variant: "destructive" });
      return;
    }
    if (form.roll_number && form.roll_number.length > 20) {
      toast({ title: "Error", description: "Roll number must be less than 20 characters", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: trimmedName,
        roll_number: form.roll_number.trim() || null,
        branch: form.branch || null,
        year: form.year || null,
      })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    }
  };

  const getRoleBadge = () => {
    if (hasRole("admin")) return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
    if (hasRole("faculty")) return <Badge className="bg-accent/10 text-accent border-accent/20"><UserCog className="h-3 w-3 mr-1" />Faculty</Badge>;
    return <Badge variant="secondary"><GraduationCap className="h-3 w-3 mr-1" />Student</Badge>;
  };

  const getBackPath = () => {
    if (hasRole("admin")) return "/admin";
    if (hasRole("faculty")) return "/faculty";
    return "/dashboard";
  };

  if (authLoading) return <Layout><LoadingOverlay visible={true} message="Loading profile..." /></Layout>;
  if (!user) return <Navigate to="/login" />;

  return (
    <Layout>
      <LoadingOverlay visible={saving} message="Saving changes..." />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Back button */}
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground rounded-xl" onClick={() => navigate(getBackPath())}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>

          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/25">
                <span className="text-3xl font-bold text-primary-foreground">
                  {(profile?.full_name || user.email || "U")[0].toUpperCase()}
                </span>
              </div>
              <div className="absolute inset-0 rounded-2xl gradient-bg blur-xl opacity-20" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-foreground tracking-tight">
              {profile?.full_name || "Your Profile"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            <div className="mt-3">{getRoleBadge()}</div>
          </div>

          {/* Profile Form */}
          <GlassCard hover={false} variant="premium" className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Full Name
              </Label>
              <Input
                placeholder="Your full name"
                className="bg-secondary/30 border-border/50 h-11 rounded-xl"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
              <Input
                value={user.email || ""}
                disabled
                className="bg-secondary/20 border-border/30 h-11 rounded-xl text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            {/* Student-specific fields */}
            {(hasRole("student") || (!hasRole("admin") && !hasRole("faculty"))) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" /> Roll Number
                </Label>
                <Input
                  placeholder="e.g. 22R11A0501"
                  className="bg-secondary/30 border-border/50 h-11 rounded-xl"
                  value={form.roll_number}
                  onChange={(e) => setForm({ ...form, roll_number: e.target.value })}
                  maxLength={20}
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Branch
                </Label>
                <Select value={form.branch} onValueChange={(v) => setForm({ ...form, branch: v })}>
                  <SelectTrigger className="bg-secondary/30 border-border/50 h-11 rounded-xl">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {(hasRole("student") || (!hasRole("admin") && !hasRole("faculty"))) && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Year
                  </Label>
                  <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })}>
                    <SelectTrigger className="bg-secondary/30 border-border/50 h-11 rounded-xl">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Account info */}
            <div className="pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gradient-bg text-primary-foreground glow-effect shimmer-btn h-11 rounded-xl font-semibold"
            >
              <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
