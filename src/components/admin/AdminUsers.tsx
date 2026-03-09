import { useState } from "react";
import { Users, Search, Shield, GraduationCap, UserCog, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import GlassCard from "@/components/GlassCard";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  branch: string | null;
  year: string | null;
  roll_number: string | null;
  created_at: string;
}

interface Role {
  user_id: string;
  role: string;
}

interface AdminUsersProps {
  profiles: Profile[];
  roles: Role[];
}

const AdminUsers = ({ profiles, roles }: AdminUsersProps) => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = hasRole("admin");
  const isFaculty = hasRole("faculty");

  const getUserRoles = (userId: string) => roles.filter((r) => r.user_id === userId).map((r) => r.role);

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { user_id: userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast({ title: "User removed", description: "The user has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-paper-stats"] });
      queryClient.invalidateQueries({ queryKey: ["faculty-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["faculty-roles"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const filtered = profiles.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.roll_number && p.roll_number.toLowerCase().includes(search.toLowerCase()))
  );

  const roleBadge = (role: string) => {
    if (role === "admin") return <Badge key={role} className="bg-destructive/10 text-destructive border-destructive/20 text-xs"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
    if (role === "faculty") return <Badge key={role} className="bg-accent/10 text-accent border-accent/20 text-xs"><UserCog className="h-3 w-3 mr-1" />Faculty</Badge>;
    return <Badge key={role} variant="secondary" className="text-xs"><GraduationCap className="h-3 w-3 mr-1" />Student</Badge>;
  };

  const roleIcon = (userRoles: string[]) => {
    if (userRoles.includes("admin")) return "bg-destructive/10";
    if (userRoles.includes("faculty")) return "bg-accent/10";
    return "bg-primary/8";
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, or roll number..." className="pl-10 bg-secondary/30 border-border/50 h-11 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <p className="text-sm text-muted-foreground font-medium">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</p>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <GlassCard hover={false} className="text-center py-12">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No users found</p>
          </GlassCard>
        ) : (
          filtered.map((profile, i) => {
            const userRoles = getUserRoles(profile.user_id);
            const isAdminUser = userRoles.includes("admin");
            const canDelete = (isAdmin && !isAdminUser) || (isFaculty && !isAdminUser && !userRoles.includes("faculty"));
            return (
              <GlassCard key={profile.user_id} delay={i * 0.02} className="py-4 group">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${roleIcon(userRoles)} transition-colors`}>
                    <Users className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{profile.full_name || "Unnamed User"}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.email}
                      {profile.roll_number ? ` • ${profile.roll_number}` : ""}
                      {profile.branch ? ` • ${profile.branch}` : ""}
                      {profile.year ? ` • ${profile.year}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {userRoles.includes("admin") ? roleBadge("admin") : userRoles.includes("faculty") ? roleBadge("faculty") : roleBadge("student")}
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive/30 text-destructive text-xs rounded-lg h-8"
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete {profile.full_name || profile.email}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteUserMutation.mutate(profile.user_id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
