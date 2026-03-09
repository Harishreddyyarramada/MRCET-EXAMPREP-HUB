import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap } from "lucide-react";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay = ({ visible, message = "Please wait..." }: LoadingOverlayProps) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full gradient-bg blur-xl opacity-40 animate-pulse" style={{ width: 80, height: 80 }} />
            <div className="relative p-5 rounded-full gradient-bg shadow-lg shadow-primary/30">
              <GraduationCap className="h-8 w-8 text-primary-foreground animate-bounce" />
            </div>
            {/* Spinning ring */}
            <svg className="absolute -inset-3 animate-spin" style={{ animationDuration: "1.5s" }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="60 200" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{message}</p>
            <div className="flex gap-1 justify-center mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default LoadingOverlay;
