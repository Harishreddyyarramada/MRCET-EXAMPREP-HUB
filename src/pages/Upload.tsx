import { useState } from "react";
import { motion } from "framer-motion";
import { Upload as UploadIcon, FileText, Image, Archive, X, CheckCircle, CloudUpload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import type { Database } from "@/integrations/supabase/types";

type ExamType = Database["public"]["Enums"]["exam_type"];

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subjectName: "", regulation: "", branch: "", year: "", semester: "", examType: "", academicYear: "" });
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateForm = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (!user) { toast({ title: "Please login", description: "You need to be logged in to upload", variant: "destructive" }); navigate("/login"); return; }
    if (files.length === 0) { toast({ title: "No files", description: "Please select files to upload", variant: "destructive" }); return; }
    if (!form.subjectName || !form.regulation || !form.branch || !form.semester || !form.examType || !form.academicYear || !form.year) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" }); return;
    }

    setLoading(true);
    try {
      for (const file of files) {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from("papers").upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("papers").getPublicUrl(filePath);

        const { error: insertError } = await supabase.from("papers").insert({
          uploaded_by: user.id,
          subject_name: form.subjectName,
          subject_code: form.regulation,
          branch: form.branch,
          year: form.year || "2024",
          semester: parseInt(form.semester),
          exam_type: form.examType as ExamType,
          academic_year: form.academicYear,
          file_url: publicUrl,
          file_name: file.name,
        });
        if (insertError) throw insertError;
      }

      toast({ title: "Upload successful!", description: "Your paper is pending faculty approval." });
      setFiles([]);
      setForm({ subjectName: "", regulation: "", branch: "", year: "", semester: "", examType: "", academicYear: "" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-secondary/30 border-border/50 h-12 rounded-xl";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl gradient-bg shadow-lg shadow-primary/20">
              <CloudUpload className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                Upload <span className="gradient-text">Papers</span>
              </h1>
              <p className="text-sm text-muted-foreground">Share question papers with your fellow students</p>
            </div>
          </div>
        </motion.div>

        {!user && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mb-6 p-5 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <p className="font-display font-bold text-foreground">Sign in to upload papers</p>
              <p className="text-sm text-muted-foreground">You need an account to share question papers with the community.</p>
            </div>
            <Button onClick={() => navigate("/login")} className="gradient-bg text-primary-foreground rounded-xl font-semibold shrink-0">
              Sign In to Upload
            </Button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`premium-card rounded-3xl p-8 space-y-6 border-glow ${!user ? "opacity-60 pointer-events-none select-none" : ""}`}>

          {/* Drop Zone */}
          <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border/50 hover:border-primary/30"
            }`}>
            <div className="inline-flex p-4 rounded-2xl bg-primary/8 mb-4">
              <UploadIcon className="h-8 w-8 text-primary" />
            </div>
            <p className="text-foreground font-display font-bold text-lg mb-1">Drop files here or click to browse</p>
            <p className="text-xs text-muted-foreground mb-5">PDF, Images, ZIP • Max 20MB per file</p>
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.zip" className="hidden" id="file-input"
              onChange={(e) => e.target.files && setFiles([...files, ...Array.from(e.target.files)])} />
            <label htmlFor="file-input">
              <Button variant="outline" className="border-primary/20 text-primary cursor-pointer rounded-xl font-semibold hover:bg-primary/5" asChild>
                <span><Sparkles className="h-4 w-4 mr-2" /> Choose Files</span>
              </Button>
            </label>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/30 border border-border/30 group">
                  {file.type.includes("pdf") ? <FileText className="h-4 w-4 text-primary flex-shrink-0" /> :
                   file.type.includes("image") ? <Image className="h-4 w-4 text-accent flex-shrink-0" /> :
                   <Archive className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  <span className="text-sm text-foreground flex-1 truncate font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  <button onClick={() => removeFile(i)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Form */}
          {/* Subject & Regulation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject *</Label>
              <Select value={form.subjectName} onValueChange={(v) => updateForm("subjectName", v)}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>
                  {[
                    "Operating Systems","Java","Python","DBMS","Computer Networks",
                    "Data Structures","Design & Analysis of Algorithms","Software Engineering",
                    "Computer Organization","Digital Logic Design","Discrete Mathematics",
                    "Theory of Computation","Compiler Design","Artificial Intelligence",
                    "Machine Learning","Web Technologies","Cloud Computing","Cyber Security",
                    "Internet of Things","Big Data Analytics","Mobile Application Development",
                    "Embedded Systems","Microprocessors","VLSI Design","Control Systems",
                    "Signals & Systems","Electronic Devices & Circuits","Engineering Mathematics - I",
                    "Engineering Mathematics - II","Engineering Mathematics - III",
                    "Engineering Physics","Engineering Chemistry","English",
                    "Environmental Science","Probability & Statistics","Linear Algebra",
                    "Numerical Methods","Object Oriented Programming","Unix Programming",
                    "Cryptography & Network Security"
                  ].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Regulation *</Label>
              <Select value={form.regulation} onValueChange={(v) => updateForm("regulation", v)}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Select Regulation" /></SelectTrigger>
                <SelectContent>
                  {["R22","R19","R18"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Branch, Year, Semester */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Branch *</Label>
              <Select value={form.branch} onValueChange={(v) => updateForm("branch", v)}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["CSE","IT","ECE","EEE","MECH","CIVIL"].map(b=><SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year *</Label>
              <Select value={form.year} onValueChange={(v) => updateForm("year", v)}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["1st Year","2nd Year","3rd Year","4th Year"].map(y=><SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Semester *</Label>
              <Select value={form.semester} onValueChange={(v) => updateForm("semester", v)}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Sem-1</SelectItem>
                  <SelectItem value="2">Sem-2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exam Type & Academic Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Exam Type *</Label>
              <Select value={form.examType} onValueChange={(v) => updateForm("examType", v)}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Mid-1","Mid-2","Sem","Supply"].map(e=><SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Academic Year *</Label>
              <Select value={form.academicYear} onValueChange={(v) => updateForm("academicYear", v)}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["2023-24","2024-25","2025-26"].map(ay=><SelectItem key={ay} value={ay}>{ay}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">Papers will be reviewed by faculty before appearing publicly. Quality uploads are approved faster.</p>
          </div>

          <Button disabled={loading} onClick={handleUpload} className="w-full gradient-bg text-primary-foreground glow-effect shimmer-btn h-13 rounded-xl font-semibold text-base">
            <UploadIcon className="mr-2 h-5 w-5" /> {loading ? "Uploading..." : "Upload Paper"}
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Upload;
