import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  variant?: "default" | "premium" | "subtle";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hover = true, delay = 0, variant = "default" }, ref) => {
    const baseClasses = variant === "premium" 
      ? "premium-card p-6" 
      : variant === "subtle"
      ? "rounded-2xl bg-secondary/30 border border-border/50 p-6 transition-all duration-300"
      : "glass-card rounded-2xl p-6 transition-all duration-300";

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={hover ? { y: -6, transition: { duration: 0.3 } } : undefined}
        className={cn(baseClasses, className)}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
