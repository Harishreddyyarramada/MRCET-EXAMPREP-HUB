import { useState } from "react";
import { FileText, CheckCircle, XCircle, Eye, Trash2, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import GlassCard from "@/components/GlassCard";

interface Paper {
  id: string;
  subject_name: string;
  subject_code: string;
  branch: string;
  semester: number;
  year: string;
  exam_type: string;
  status: string;
  file_name: string;
  file_url: string;
  download_count: number;
  created_at: string;
  uploaded_by: string;
  academic_year: string;
}

interface AdminPapersProps {
  papers: Paper[];
}

const AdminPapers = ({ papers }: AdminPapersProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-papers"] });
    queryClient.invalidateQueries({ queryKey: ["admin-paper-stats"] });
    queryClient.invalidateQueries({ queryKey: ["faculty-all-papers"] });
    queryClient.invalidateQueries({ queryKey: ["faculty-paper-stats"] });
  };

  const approvePaper = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("papers").update({ status: "approved" as any, reviewed_by: user!.id }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Paper approved" }); invalidate(); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const rejectPaper = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("papers").update({ status: "rejected" as any, reviewed_by: user!.id, review_note: "Rejected by reviewer" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Paper rejected" }); invalidate(); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deletePaper = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("papers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Paper deleted" }); invalidate(); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = papers.filter((p) => {
    const matchesSearch = p.subject_name.toLowerCase().includes(search.toLowerCase()) ||
      p.subject_code.toLowerCase().includes(search.toLowerCase()) ||
      p.file_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">Approved</Badge>;
    if (status === "rejected") return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Rejected</Badge>;
    return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search papers..." className="pl-10 bg-secondary/30 border-border/50 h-11 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-secondary/30 border-border/50 h-11 rounded-xl w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground font-medium">{filtered.length} paper{filtered.length !== 1 ? "s" : ""}</p>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <GlassCard hover={false} className="text-center py-12">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No papers found</p>
          </GlassCard>
        ) : (
          filtered.map((paper, i) => (
            <GlassCard key={paper.id} delay={i * 0.02} className="py-4 group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-primary/8 group-hover:bg-primary/12 transition-colors">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-foreground text-sm truncate">{paper.subject_name}</p>
                    {statusBadge(paper.status)}
                    <Badge variant="secondary" className="text-xs">{paper.exam_type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {paper.subject_code} • {paper.branch} • Sem {paper.semester} • {paper.year} • {paper.academic_year}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    📄 {paper.file_name} • <Download className="h-3 w-3 inline" /> {paper.download_count}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-border/50 rounded-lg" asChild>
                    <a href={paper.file_url} target="_blank" rel="noopener noreferrer"><Eye className="h-3.5 w-3.5" /></a>
                  </Button>
                  {paper.status === "pending" && (
                    <>
                      <Button size="sm" className="bg-emerald-500 text-white h-8 w-8 p-0 rounded-lg hover:bg-emerald-600"
                        onClick={() => approvePaper.mutate(paper.id)}>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" className="bg-destructive text-destructive-foreground h-8 w-8 p-0 rounded-lg hover:bg-destructive/90"
                        onClick={() => rejectPaper.mutate(paper.id)}>
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive h-8 w-8 p-0 rounded-lg">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Paper</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{paper.subject_name}" ({paper.file_name})? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deletePaper.mutate(paper.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPapers;
