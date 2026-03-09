import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Shield, Building2, BarChart3, FileText, CheckCircle, XCircle,
  AlertTriangle, TrendingUp, PieChart, UserCog
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import StatCard from "@/components/StatCard";
import AdminPapers from "@/components/admin/AdminPapers";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminFaculty from "@/components/admin/AdminFaculty";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];

const AdminPanel = () => {
  const { user, hasRole, loading: authLoading } = useAuth();

  // ── Queries ──
  const { data: allProfiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ["admin-roles"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("*");
      return data || [];
    },
  });

  const { data: allPapers = [] } = useQuery({
    queryKey: ["admin-papers"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("papers").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: paperStats } = useQuery({
    queryKey: ["admin-paper-stats"],
    enabled: !!user,
    queryFn: async () => {
      const { count: total } = await supabase.from("papers").select("*", { count: "exact", head: true });
      const { count: approved } = await supabase.from("papers").select("*", { count: "exact", head: true }).eq("status", "approved");
      const { count: pending } = await supabase.from("papers").select("*", { count: "exact", head: true }).eq("status", "pending");
      const { count: rejected } = await supabase.from("papers").select("*", { count: "exact", head: true }).eq("status", "rejected");
      const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const facultyCount = allRoles.filter(r => r.role === "faculty").length;
      return { total: total || 0, approved: approved || 0, pending: pending || 0, rejected: rejected || 0, users: userCount || 0, faculty: facultyCount };
    },
  });

  // ── Analytics ──
  const branchCounts = BRANCHES.map((branch) => ({
    branch,
    count: allPapers.filter((p) => p.branch === branch).length,
  })).sort((a, b) => b.count - a.count);
  const maxBranchCount = Math.max(...branchCounts.map((b) => b.count), 1);

  const examTypes = ["Mid-1", "Mid-2", "Sem", "Supply"] as const;
  const examTypeCounts = examTypes.map((type) => ({
    type,
    count: allPapers.filter((p) => p.exam_type === type).length,
  }));
  const maxExamCount = Math.max(...examTypeCounts.map((e) => e.count), 1);

  const topDownloaded = [...allPapers].sort((a, b) => b.download_count - a.download_count).slice(0, 5);

  if (authLoading) return <Layout><div className="flex items-center justify-center min-h-[80vh] text-muted-foreground">Loading...</div></Layout>;
  if (!user) return <Navigate to="/login" />;
  if (!hasRole("admin")) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <Shield className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-display font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm">You need admin privileges to access this panel.</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl gradient-bg shadow-lg shadow-primary/20">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                Admin <span className="gradient-text">Panel</span>
              </h1>
              <p className="text-sm text-muted-foreground">Manage papers, users, faculty, and analytics</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Users} label="Total Users" value={String(paperStats?.users || 0)} delay={0} />
          <StatCard icon={UserCog} label="Faculty" value={String(paperStats?.faculty || 0)} delay={0.05} accentColor="bg-gradient-to-br from-accent to-accent/70" />
          <StatCard icon={FileText} label="Total Papers" value={String(paperStats?.total || 0)} delay={0.1} />
          <StatCard icon={CheckCircle} label="Approved" value={String(paperStats?.approved || 0)} delay={0.15} accentColor="bg-gradient-to-br from-emerald-500 to-teal-500" />
          <StatCard icon={AlertTriangle} label="Pending" value={String(paperStats?.pending || 0)} delay={0.2} accentColor="bg-gradient-to-br from-amber-500 to-orange-500" />
          <StatCard icon={XCircle} label="Rejected" value={String(paperStats?.rejected || 0)} delay={0.25} accentColor="bg-gradient-to-br from-red-500 to-pink-500" />
        </div>

        <Tabs defaultValue="papers" className="space-y-6">
          <TabsList className="premium-card border border-border/30 p-1.5 h-auto flex-wrap rounded-2xl">
            <TabsTrigger value="papers" className="text-xs sm:text-sm rounded-xl font-semibold"><FileText className="h-4 w-4 mr-1.5" /> Papers</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm rounded-xl font-semibold"><Users className="h-4 w-4 mr-1.5" /> Users</TabsTrigger>
            <TabsTrigger value="faculty" className="text-xs sm:text-sm rounded-xl font-semibold"><UserCog className="h-4 w-4 mr-1.5" /> Faculty</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm rounded-xl font-semibold"><BarChart3 className="h-4 w-4 mr-1.5" /> Analytics</TabsTrigger>
          </TabsList>

          {/* Papers Management */}
          <TabsContent value="papers">
            <AdminPapers papers={allPapers} />
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <AdminUsers profiles={allProfiles} roles={allRoles} />
          </TabsContent>

          {/* Faculty Management */}
          <TabsContent value="faculty">
            <AdminFaculty profiles={allProfiles} roles={allRoles} />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <GlassCard hover={false}>
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" /> Papers by Branch
                </h3>
                <div className="space-y-3">
                  {branchCounts.map((b, i) => (
                    <div key={b.branch}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground font-medium">{b.branch}</span>
                        <span className="text-foreground font-semibold">{b.count} papers</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-secondary/50 overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${(b.count / maxBranchCount) * 100}%` }}
                          viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}
                          className="h-full rounded-full gradient-bg" />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard hover={false}>
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Papers by Exam Type
                </h3>
                <div className="space-y-3">
                  {examTypeCounts.map((e, i) => (
                    <div key={e.type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground font-medium">{e.type}</span>
                        <span className="text-foreground font-semibold">{e.count}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-secondary/50 overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${(e.count / maxExamCount) * 100}%` }}
                          viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}
                          className="h-full rounded-full bg-accent" />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard hover={false} className="lg:col-span-2">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Most Downloaded Papers
                </h3>
                {topDownloaded.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No papers yet</p>
                ) : (
                  <div className="space-y-2">
                    {topDownloaded.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                        <span className="text-xs font-bold text-primary w-6 text-center">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.subject_name}</p>
                          <p className="text-xs text-muted-foreground">{p.subject_code} • {p.branch} • {p.exam_type} • {p.year}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">{p.download_count} downloads</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPanel;
