import { useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, BarChart3, PieChart, TrendingUp, Eye, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import StatCard from "@/components/StatCard";
import { useToast } from "@/hooks/use-toast";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const verificationShown = sessionStorage.getItem("verification-toast-shown");
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));
    const isSignupVerification = hashParams.get("type") === "signup";

    if (isSignupVerification && !verificationShown) {
      toast({
        title: "Email verified successfully",
        description: "Your account is verified and you are now logged in.",
      });
      sessionStorage.setItem("verification-toast-shown", "1");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [location.hash, toast]);

  const { data: approvedPapers = [] } = useQuery({
    queryKey: ["student-papers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("papers").select("*").eq("status", "approved").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: bookmarkCount = 0 } = useQuery({
    queryKey: ["student-bookmark-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase.from("bookmarks").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count || 0;
    },
  });

  if (authLoading) return <Layout><div className="flex items-center justify-center min-h-[80vh] text-muted-foreground">Loading...</div></Layout>;
  if (!user) return <Navigate to="/login" />;

  // Analytics
  const branchCounts = BRANCHES.map((branch) => ({
    branch,
    count: approvedPapers.filter((p) => p.branch === branch).length,
  })).sort((a, b) => b.count - a.count);
  const maxBranchCount = Math.max(...branchCounts.map((b) => b.count), 1);

  const examTypes = ["Mid-1", "Mid-2", "Sem", "Supply"] as const;
  const examTypeCounts = examTypes.map((type) => ({
    type,
    count: approvedPapers.filter((p) => p.exam_type === type).length,
  }));
  const maxExamCount = Math.max(...examTypeCounts.map((e) => e.count), 1);

  const topDownloaded = [...approvedPapers].sort((a, b) => b.download_count - a.download_count).slice(0, 5);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-lg font-bold text-primary-foreground">
                  {(profile?.full_name || "S")[0].toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success ring-2 ring-background" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                Welcome, <span className="gradient-text">{profile?.full_name || "Student"}</span>
              </h1>
              <p className="text-sm text-muted-foreground">Your exam preparation dashboard</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={FileText} label="Papers Available" value={String(approvedPapers.length)} delay={0} />
          <StatCard icon={Bookmark} label="Bookmarked" value={String(bookmarkCount)} delay={0.05} accentColor="bg-gradient-to-br from-purple-500 to-pink-500" />
          <StatCard icon={TrendingUp} label="Branches" value={String(BRANCHES.length)} delay={0.1} accentColor="bg-gradient-to-br from-accent to-accent/70" />
        </div>

        <Tabs defaultValue="papers" className="space-y-6">
          <TabsList className="premium-card border border-border/30 p-1.5 h-auto flex-wrap rounded-2xl">
            <TabsTrigger value="papers" className="text-xs sm:text-sm rounded-xl font-semibold"><FileText className="h-4 w-4 mr-1.5" /> Papers</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm rounded-xl font-semibold"><BarChart3 className="h-4 w-4 mr-1.5" /> Analytics</TabsTrigger>
          </TabsList>

          {/* Papers - Read Only */}
          <TabsContent value="papers" className="space-y-4">
            <p className="text-sm text-muted-foreground font-medium">{approvedPapers.length} approved paper{approvedPapers.length !== 1 ? "s" : ""}</p>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {approvedPapers.length === 0 ? (
                <GlassCard hover={false} variant="premium" className="text-center py-12">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No papers available yet</p>
                </GlassCard>
              ) : (
                approvedPapers.map((p, i) => (
                  <GlassCard key={p.id} delay={i * 0.02} variant="premium" className="py-4 group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-primary/8 group-hover:bg-primary/12 transition-colors">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm tracking-tight">{p.subject_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.subject_code} • {p.branch} • Sem {p.semester} • {p.exam_type} • {p.year}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="secondary" className="text-xs">{p.download_count} downloads</Badge>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-border/50 rounded-lg" asChild>
                          <a href={p.file_url} target="_blank" rel="noopener noreferrer"><Eye className="h-3.5 w-3.5" /></a>
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
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
                  <TrendingUp className="h-4 w-4 text-primary" /> Most Popular Papers
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
                          <p className="text-xs text-muted-foreground">{p.subject_code} • {p.branch} • {p.exam_type}</p>
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

export default Dashboard;
