import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Map, UserCheck, BarChart3, Bell, Menu, X, User } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

const navItems = [
  { path: "/", label: "Home", icon: Flame },
  { path: "/map", label: "Heat Map", icon: Map },
  { path: "/risk-checker", label: "Risk Checker", icon: UserCheck },
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/alerts", label: "Alerts", icon: Bell },
  { path: "/profile", label: "Profile", icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5">
              <img src={logo} alt="HeatShield Logo" className="h-14 md:h-16 w-auto object-contain" />
            </div>
            <span className="font-display font-bold text-lg gradient-heat-text">HeatShield</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
            <div className="ml-4 flex items-center gap-2 border-l pl-4 border-border/50">
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Login</Link>
              <Link to="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">Get Started</Link>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl"
          >
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${active ? "text-primary bg-primary/10" : "text-muted-foreground"
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </nav>

      <main className="pt-16">{children}</main>
    </div>
  );
}
