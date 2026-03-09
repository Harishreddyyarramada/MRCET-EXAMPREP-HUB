import { useState } from "react";
import { Users, UserPlus, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import GlassCard from "@/components/GlassCard";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  branch: string | null;
  year: string | null;
}

interface Role {
  user_id: string;
  role: string;
}

interface AdminFacultyProps {
  profiles: Profile[];
  roles: Role[];
}

const AdminFaculty = ({ profiles, roles }: AdminFacultyProps) => {
  const [newFacultyEmail, setNewFacultyEmail] = useState("");
  const [newFacultyPassword, setNewFacultyPassword] = useState("");
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newFacultyBranch, setNewFacultyBranch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const facultyUserIds = roles.filter((r) => r.role === "faculty").map((r) => r.user_id);
  const facultyProfiles = profiles.filter((p) => facultyUserIds.includes(p.user_id));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
    queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
  };

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "faculty");
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Faculty role removed" }); invalidate(); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const createFacultyMutation = useMutation({
    mutationFn: async () => {
      if (!newFacultyEmail || !newFacultyPassword || !newFacultyName) throw new Error("Fill all required fields");
      const { data, error } = await supabase.functions.invoke("create-faculty", {
        body: {
          email: newFacultyEmail,
          password: newFacultyPassword,
          full_name: newFacultyName,
          branch: newFacultyBranch || null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast({ title: "Faculty created!", description: `${newFacultyEmail} has been added as faculty.` });
      setNewFacultyEmail(""); setNewFacultyPassword(""); setNewFacultyName(""); setNewFacultyBranch("");
      invalidate();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      {/* Create new faculty */}
      <GlassCard hover={false}>
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" /> Add New Faculty
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Create a new account with faculty role</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name *</Label>
            <Input placeholder="Dr. John Doe" className="bg-secondary/30 border-border/50 h-10 rounded-xl text-sm"
              value={newFacultyName} onChange={(e) => setNewFacultyName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email *</Label>
            <Input type="email" placeholder="faculty@mrcet.com" className="bg-secondary/30 border-border/50 h-10 rounded-xl text-sm"
              value={newFacultyEmail} onChange={(e) => setNewFacultyEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password *</Label>
            <Input type="password" placeholder="Min 6 characters" className="bg-secondary/30 border-border/50 h-10 rounded-xl text-sm"
              value={newFacultyPassword} onChange={(e) => setNewFacultyPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Branch</Label>
            <Select value={newFacultyBranch} onValueChange={setNewFacultyBranch}>
              <SelectTrigger className="bg-secondary/30 border-border/50 h-10 rounded-xl"><SelectValue placeholder="Select branch" /></SelectTrigger>
              <SelectContent>{["CSE","IT","ECE","EEE","MECH","CIVIL"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={() => createFacultyMutation.mutate()} disabled={createFacultyMutation.isPending}
          className="w-full gradient-bg text-primary-foreground text-sm h-10 rounded-xl font-semibold mt-4">
          <Mail className="h-4 w-4 mr-2" /> {createFacultyMutation.isPending ? "Creating..." : "Create Faculty Account"}
        </Button>
      </GlassCard>

      {/* Current Faculty */}
      <div>
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Current Faculty ({facultyProfiles.length})
        </h3>
        {facultyProfiles.length === 0 ? (
          <GlassCard hover={false} className="text-center py-8">
            <p className="text-muted-foreground text-sm">No faculty members yet</p>
          </GlassCard>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {facultyProfiles.map((f, i) => (
              <GlassCard key={f.user_id} delay={i * 0.03} className="flex items-center gap-4 py-4">
                <div className="p-2.5 rounded-lg bg-accent/10">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{f.full_name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{f.email} {f.branch ? `• ${f.branch}` : ""}</p>
                </div>
                <Badge variant="secondary" className="text-xs">Faculty</Badge>
                <Button size="sm" variant="outline" className="border-destructive/30 text-destructive text-xs rounded-lg"
                  onClick={() => removeMutation.mutate(f.user_id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Remove
                </Button>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFaculty;
