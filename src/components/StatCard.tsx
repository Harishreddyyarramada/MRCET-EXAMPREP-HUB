import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  delay?: number;
  accentColor?: string;
}

const StatCard = ({ icon: Icon, label, value, trend, delay = 0, accentColor }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="premium-card p-5 group cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${accentColor || 'gradient-bg'} shadow-lg shadow-primary/10 group-hover:shadow-primary/20 transition-shadow duration-300`}>
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
    </motion.div>
  );
};

export default StatCard;
