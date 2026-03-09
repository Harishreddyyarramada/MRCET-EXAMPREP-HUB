import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, Sparkles } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PaperResult {
  id: string;
  subject_name: string;
  subject_code: string;
  branch: string;
  semester: number;
  exam_type: string;
  year: string;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PaperResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const searchPapers = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase
        .from("papers")
        .select("id, subject_name, subject_code, branch, semester, exam_type, year")
        .eq("status", "approved")
        .or(`subject_name.ilike.%${term}%,subject_code.ilike.%${term}%,branch.ilike.%${term}%`)
        .limit(10);
      setResults(data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchPapers(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchPapers]);

  const handleSelect = (paperId: string) => {
    onOpenChange(false);
    setQuery("");
    navigate(`/papers?highlight=${paperId}`);
  };

  const goToAISearch = () => {
    onOpenChange(false);
    navigate("/ai-search");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search papers by subject, code, or branch..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Searching..." : "No papers found. Try AI Search for smarter results."}
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Papers">
            {results.map((paper) => (
              <CommandItem
                key={paper.id}
                value={`${paper.subject_name} ${paper.subject_code}`}
                onSelect={() => handleSelect(paper.id)}
                className="flex items-center gap-3 py-3"
              >
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{paper.subject_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {paper.subject_code} · {paper.branch} · Sem {paper.semester}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {paper.exam_type}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={goToAISearch} className="flex items-center gap-3 py-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm">AI-Powered Search</span>
          </CommandItem>
          <CommandItem onSelect={() => { onOpenChange(false); navigate("/papers"); }} className="flex items-center gap-3 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Browse All Papers</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default SearchDialog;
