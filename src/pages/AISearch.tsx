import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Send, Sparkles, FileText, Lightbulb, TrendingUp, Wand2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";

const suggestions = [
  "Show all OS questions about Deadlock",
  "DBMS questions from 2022 External",
  "Most repeated topics in Data Structures",
  "Important questions for CN Mid-2",
];

const mockResults = [
  { subject: "Operating Systems", question: "Explain the conditions for deadlock. How can deadlock be prevented?", year: "2023", type: "External", frequency: 5 },
  { subject: "Operating Systems", question: "Describe the Banker's Algorithm for deadlock avoidance with an example.", year: "2022", type: "Mid-2", frequency: 4 },
  { subject: "Operating Systems", question: "Differentiate between deadlock prevention and deadlock avoidance.", year: "2022", type: "External", frequency: 3 },
];

const AISearch = () => {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (query.trim()) setSearched(true);
  };

  return (
    <Layout >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/8 border border-accent/15 text-accent text-xs font-semibold mb-5 backdrop-blur-sm"
          >
            <Wand2 className="h-3.5 w-3.5" /> Powered by AI
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold mb-4 tracking-tight">
            Smart Paper <span className="gradient-text">Search</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">Ask questions in natural language and find relevant papers instantly</p>
        </motion.div>

        {/* Search Box */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="premium-card rounded-2xl p-2 mb-8 border-glow">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-primary ml-4 flex-shrink-0" />
            <Input
              placeholder="Ask anything about question papers..."
              className="border-0 bg-transparent focus-visible:ring-0 text-base h-12"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button className="gradient-bg text-primary-foreground glow-effect rounded-xl h-10 px-5 font-semibold flex-shrink-0" onClick={handleSearch}>
              <Send className="h-4 w-4 mr-1.5" /> Search
            </Button>
          </div>
        </motion.div>

        {/* Suggestions */}
        {!searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="space-y-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((s) => (
                <button key={s} onClick={() => { setQuery(s); setSearched(true); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-300 bg-secondary/20 backdrop-blur-sm">
                  <MessageSquare className="h-3 w-3 inline mr-1.5 opacity-50" />{s}
                </button>
              ))}
            </div>

            {/* How it works */}
            <div className="grid sm:grid-cols-3 gap-4 mt-12">
              {[
                { icon: Brain, title: "Natural Language", desc: "Ask questions like you would ask a friend" },
                { icon: TrendingUp, title: "Pattern Analysis", desc: "AI identifies frequently repeated topics" },
                { icon: Sparkles, title: "Smart Results", desc: "Get ranked results with confidence scores" },
              ].map((item, i) => (
                <GlassCard key={item.title} delay={0.3 + i * 0.08} variant="subtle" className="text-center py-8">
                  <div className="inline-flex p-3 rounded-2xl bg-primary/8 mb-3">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-sm mb-1 tracking-tight">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {searched && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="premium-card rounded-2xl p-6 mb-6 border-glow">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <Lightbulb className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-display font-bold text-foreground mb-1.5">AI Analysis</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Found 3 relevant questions about <span className="text-primary font-semibold">Deadlock</span> in Operating Systems.
                    This topic has appeared in <span className="text-accent font-semibold">85% of previous exams</span> and is highly likely to appear again.
                  </p>
                </div>
              </div>
            </div>

            {mockResults.map((r, i) => (
              <GlassCard key={i} delay={i * 0.05} variant="premium" className="group">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-primary/8 group-hover:bg-primary/12 transition-colors flex-shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-1.5 leading-relaxed">{r.question}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <span>{r.subject}</span>
                      <span className="text-border">•</span>
                      <span>{r.year}</span>
                      <span className="text-border">•</span>
                      <span>{r.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/8 px-3 py-1.5 rounded-lg flex-shrink-0">
                    <TrendingUp className="h-3 w-3" /> {r.frequency}x
                  </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default AISearch;
