import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Upload, Brain, BookOpen, Star, TrendingUp, Sparkles, ArrowRight, GraduationCap, Zap, Shield, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import { useAuth } from "@/context/AuthContext";

const features = [
  { icon: Search, title: "AI-Powered Search", desc: "Search papers using natural language. Find questions by topic, year, or concept.", color: "from-primary to-primary-glow" },
  { icon: Upload, title: "Upload & Share", desc: "Upload question papers with auto-OCR extraction. Faculty approval ensures quality.", color: "from-accent to-accent/70" },
  { icon: Brain, title: "Smart Predictions", desc: "AI analyzes patterns to predict important topics and frequently repeated questions.", color: "from-purple-500 to-pink-500" },
  { icon: BookOpen, title: "Vast Paper Library", desc: "Access thousands of previous year papers organized by branch, semester, and subject.", color: "from-emerald-500 to-teal-500" },
  { icon: Star, title: "Rate & Review", desc: "Rate papers by difficulty and usefulness to help fellow students prioritize.", color: "from-amber-500 to-orange-500" },
  { icon: TrendingUp, title: "Study Recommendations", desc: "Get personalized paper recommendations based on your branch, semester, and activity.", color: "from-cyan-500 to-blue-500" },
];

const stats = [
  { value: "100+", label: "Question Papers", icon: BookOpen },
  { value: "1500+", label: "Active Students", icon: Users },
  { value: "50+", label: "Subjects Covered", icon: Shield },
  { value: "95%", label: "Success Rate", icon: TrendingUp },
];

const branches = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const Index = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;

    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));
    const fromVerificationLink =
      hashParams.get("type") === "signup" ||
      (hashParams.has("access_token") && hashParams.has("refresh_token"));

    if (fromVerificationLink) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, location.hash, navigate]);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Ambient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[15%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary-glow/5 blur-[100px] animate-float" />
        </div>

        {/* Dot pattern */}
        <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-sm font-semibold mb-8 backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5" /> AI-Powered Exam Preparation
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-[4.5rem] font-display font-extrabold leading-[1.1] mb-6 tracking-tight"
            >
              Ace Your Exams with{" "}
              <span className="gradient-text">MRCET ExamPrep</span>{" "}
              Hub
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Access thousands of previous year question papers, get AI-powered predictions, 
              and study smarter with intelligent recommendations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gradient-bg text-primary-foreground glow-effect shimmer-btn text-base sm:text-lg px-8 sm:px-10 h-14 sm:h-16 rounded-2xl font-semibold tracking-wide">
                  <GraduationCap className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Create Account
                </Button>
              </Link>
              <Link to="/papers" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 h-14 sm:h-16 rounded-2xl border-border/50 hover:bg-secondary/50 font-semibold">
                  Browse Papers <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </Link>
            </motion.div>

            {/* Search Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-16 max-w-2xl mx-auto"
            >
              <div className="premium-card p-2 rounded-2xl">
                <div className="flex items-center gap-3 bg-secondary/40 rounded-xl px-5 py-4">
                  <Brain className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground text-sm text-left flex-1">Try: "Show all Operating Systems questions about Deadlock from 2022"</span>
                  <Button size="sm" className="gradient-bg text-primary-foreground rounded-xl glow-effect flex-shrink-0">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={item} className="text-center group">
                <div className="inline-flex p-3 rounded-2xl bg-primary/8 mb-3 group-hover:bg-primary/12 transition-colors duration-300">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl sm:text-4xl font-display font-extrabold gradient-text tracking-tight">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Features</span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold mt-3 mb-4 tracking-tight">
              Everything You Need to <span className="gradient-text">Excel</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Powered by AI and built for MRCET students.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={item}>
                <GlassCard variant="premium" className="h-full group">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${f.color} w-fit mb-5 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-foreground mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  <div className="mt-4 flex items-center text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Branches */}
      <section className="py-24 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Departments</span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold mt-3 mb-12 tracking-tight">
              All <span className="gradient-text">Branches</span> Covered
            </h2>
          </motion.div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            {branches.map((b) => (
              <motion.div key={b} variants={item} whileHover={{ scale: 1.05, y: -2 }}>
                <Link to={`/papers?branch=${b}`} className="premium-card rounded-2xl px-10 py-5 block group cursor-pointer">
                  <p className="font-display font-bold text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">{b}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 gradient-bg opacity-[0.07]" />
            <div className="absolute inset-0 dot-pattern opacity-20" />
            <div className="relative premium-card text-center py-16 px-8 rounded-3xl border-glow">
              <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold mb-4 tracking-tight">
                Start Preparing <span className="gradient-text">Smarter</span> Today
              </h2>
              <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg">
                Join thousands of MRCET students already using AI-powered exam preparation.
              </p>
              <Link to="/signup">
                <Button size="lg" className="gradient-bg text-primary-foreground glow-effect shimmer-btn rounded-2xl font-semibold px-10 h-20 text-lg">
                  Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg gradient-bg shadow-lg shadow-primary/20">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold gradient-text tracking-tight">MRCET ExamPrep Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 MRCET ExamPrep Hub. Built for students, by students.</p>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
