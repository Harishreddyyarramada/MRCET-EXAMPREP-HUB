import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Download, Bookmark, Eye, FileText, SlidersHorizontal, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getCachedQuery, setCachedQuery } from "@/lib/queryPersister";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";

const Papers = () => {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [branchFilter, setBranchFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cacheKey = `papers-${branchFilter}-${yearFilter}-${semFilter}-${examFilter}`;

  const { data: papers = [], isLoading } = useQuery({
    queryKey: ["papers", branchFilter, yearFilter, semFilter, examFilter],
    queryFn: async () => {
      let query = supabase.from("papers").select("*").eq("status", "approved");
      if (branchFilter) query = query.eq("branch", branchFilter);
      if (yearFilter) query = query.eq("year", yearFilter);
      if (semFilter) query = query.eq("semester", parseInt(semFilter));
      if (examFilter) query = query.eq("exam_type", examFilter as any);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      const result = data || [];
      setCachedQuery(cacheKey, result);
      return result;
    },
    placeholderData: () => getCachedQuery(cacheKey) as any,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["bookmarks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("bookmarks").select("paper_id").eq("user_id", user!.id);
      return data?.map((b) => b.paper_id) || [];
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (paperId: string) => {
      if (!user) throw new Error("Login required");
      if (bookmarks.includes(paperId)) {
        await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("paper_id", paperId);
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, paper_id: paperId });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookmarks"] }),
  });

  const handleDownload = async (paper: typeof papers[0]) => {
    try {
      const response = await fetch(paper.file_url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = paper.file_name || `${paper.subject_name}_${paper.exam_type}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Safely increment download count via RPC
      await supabase.rpc("increment_download_count", { paper_id: paper.id });
      queryClient.invalidateQueries({ queryKey: ["papers"] });
      toast({ title: "Download started", description: paper.file_name });
    } catch {
      toast({ title: "Download failed", description: "Could not download the file.", variant: "destructive" });
    }
  };

  const filtered = papers.filter((p) =>
    p.subject_name.toLowerCase().includes(search.toLowerCase()) ||
    p.subject_code.toLowerCase().includes(search.toLowerCase())
  );

  const diffColor = (d: string | null) => {
    if (d === "Easy") return "bg-success/10 text-success border-success/20";
    if (d === "Medium") return "bg-warning/10 text-warning border-warning/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  const hasActiveFilters = branchFilter || yearFilter || semFilter || examFilter;
  const clearFilters = () => { setBranchFilter(""); setYearFilter(""); setSemFilter(""); setExamFilter(""); };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl gradient-bg shadow-lg shadow-primary/20">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                Question <span className="gradient-text">Papers</span>
              </h1>
              <p className="text-sm text-muted-foreground">Browse and download previous year question papers</p>
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8 mb-8">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by subject, code, or topic..." className="pl-11 bg-secondary/30 border-border/50 h-12 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" className={`border-border/50 rounded-xl h-12 px-5 font-medium ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
              {hasActiveFilters && <span className="ml-2 w-2 h-2 rounded-full gradient-bg" />}
            </Button>
          </div>

          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              className="premium-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Filter Papers</span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground rounded-lg" onClick={clearFilters}>
                    <X className="h-3 w-3 mr-1" /> Clear all
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="bg-secondary/30 rounded-xl h-11"><SelectValue placeholder="Branch" /></SelectTrigger>
                  <SelectContent>{["CSE","IT","ECE","EEE","MECH","CIVIL"].map(b=><SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="bg-secondary/30 rounded-xl h-11"><SelectValue placeholder="Year" /></SelectTrigger>
                  <SelectContent>{["1st Year","2nd Year","3rd Year","4th Year"].map(y=><SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={semFilter} onValueChange={setSemFilter}>
                  <SelectTrigger className="bg-secondary/30 rounded-xl h-11"><SelectValue placeholder="Semester" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sem-1</SelectItem>
                    <SelectItem value="2">Sem-2</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={examFilter} onValueChange={setExamFilter}>
                  <SelectTrigger className="bg-secondary/30 rounded-xl h-11"><SelectValue placeholder="Exam Type" /></SelectTrigger>
                  <SelectContent>{["Mid-1","Mid-2","Sem","Supply"].map(e=><SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="premium-card rounded-2xl p-6 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-secondary/50 mb-4" />
                <div className="h-5 w-3/4 rounded-lg bg-secondary/50 mb-2" />
                <div className="h-4 w-1/2 rounded-lg bg-secondary/50" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="inline-flex p-4 rounded-2xl bg-primary/8 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-display font-bold text-foreground mb-2">No papers found</p>
            <p className="text-sm text-muted-foreground">Be the first to upload a paper for this filter!</p>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-5 font-medium">{filtered.length} paper{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((paper, i) => (
                <GlassCard key={paper.id} delay={i * 0.03} variant="premium" className="flex flex-col group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/8 group-hover:bg-primary/12 transition-colors">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    {paper.difficulty && <Badge variant="outline" className={`${diffColor(paper.difficulty)} rounded-lg text-xs font-semibold`}>{paper.difficulty}</Badge>}
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-1 tracking-tight">{paper.subject_name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{paper.subject_code} • {paper.branch} • Sem {paper.semester}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs rounded-lg font-semibold">{paper.year}</Badge>
                    <Badge variant="secondary" className="text-xs rounded-lg font-semibold">{paper.exam_type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto mb-4">
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {paper.download_count}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 gradient-bg text-primary-foreground text-xs rounded-xl font-semibold shimmer-btn"
                      onClick={() => handleDownload(paper)}>
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                    <Button size="sm" variant="outline" className="border-border/50 rounded-xl" asChild>
                      <a href={paper.file_url} target="_blank" rel="noopener noreferrer"><Eye className="h-3 w-3" /></a>
                    </Button>
                    {user && (
                      <Button size="sm" variant="outline"
                        className={`border-border/50 rounded-xl ${bookmarks.includes(paper.id) ? "text-primary bg-primary/10 border-primary/20" : ""}`}
                        onClick={() => bookmarkMutation.mutate(paper.id)}>
                        <Bookmark className={`h-3 w-3 ${bookmarks.includes(paper.id) ? "fill-current" : ""}`} />
                      </Button>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Papers;
