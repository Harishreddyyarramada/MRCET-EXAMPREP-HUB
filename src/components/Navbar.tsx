import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap, Search, Moon, Sun, User, LogOut, Sparkles } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import SearchDialog from "@/components/SearchDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, hasRole } = useAuth();

  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return true;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDark = () => setDark((prev) => !prev);

  const getDashboardLink = () => {
    if (!user) return [];
    if (hasRole("admin")) return [{ to: "/admin", label: "Admin Panel" }];
    if (hasRole("faculty")) return [{ to: "/faculty", label: "Faculty Panel" }];
    return [{ to: "/dashboard", label: "Dashboard" }];
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/papers", label: "Papers" },
    { to: "/ai-search", label: "AI Search", icon: Sparkles },
    { to: "/upload", label: "Upload" },
    ...getDashboardLink(),
  ];

  const isActive = (path: string) => location.pathname === path;
  const profileSummary = [profile?.roll_number, profile?.branch, profile?.year]
    .filter(Boolean)
    .join(" • ");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? "glass-card border-b border-border/30 shadow-lg shadow-background/50" 
        : "bg-transparent border-b border-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="p-2 rounded-xl gradient-bg shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-xl gradient-bg blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
            <span className="font-display text-lg font-bold gradient-text tracking-tight">
              MRCET ExamPrep
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(link.to)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {'icon' in link && link.icon && <link.icon className="h-3.5 w-3.5" />}
                  {link.label}
                </span>
                {isActive(link.to) && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-xl h-9 w-9" onClick={() => setSearchOpen(true)} title="Search (⌘K)">
              <Search className="h-4 w-4" />
            </Button>
            {user && <NotificationBell />}
            <Button variant="ghost" size="icon" onClick={toggleDark} className="text-muted-foreground hover:text-foreground rounded-xl h-9 w-9">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="w-px h-6 bg-border/50 mx-1" />
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors cursor-pointer">
                  <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">
                      {(profile?.full_name || user.email || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm text-foreground font-medium">{profile?.full_name || user.email}</span>
                    {profileSummary && <span className="text-xs text-muted-foreground">{profileSummary}</span>}
                  </div>
                </Link>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive rounded-xl h-9" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm" className="gradient-bg text-primary-foreground border-0 glow-effect shimmer-btn rounded-xl font-semibold h-9 px-5">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden rounded-xl" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:hidden glass-card border-t border-border/30 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.to) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}>
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 pt-3 mt-2 border-t border-border/30">
                <Button variant="ghost" size="icon" onClick={toggleDark} className="rounded-xl">
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                {user ? (
                  <Button className="flex-1 rounded-xl" variant="outline" onClick={handleSignOut}>Logout</Button>
                ) : (
                  <Link to="/login" className="flex-1">
                    <Button className="w-full gradient-bg text-primary-foreground rounded-xl font-semibold">Sign In</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  );
};

export default Navbar;
