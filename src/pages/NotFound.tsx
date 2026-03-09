import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background mesh-bg noise-overlay relative px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center"
      >
        <div className="inline-flex p-4 rounded-2xl bg-primary/8 mb-6">
          <AlertTriangle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-7xl font-display font-extrabold gradient-text mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8 font-medium">This page doesn't exist</p>
        <Link to="/">
          <Button className="gradient-bg text-primary-foreground glow-effect shimmer-btn rounded-2xl font-semibold h-12 px-8">
            <Home className="mr-2 h-4 w-4" /> Return Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
