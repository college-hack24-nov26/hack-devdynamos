import { Shield, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-xl"
      style={{ boxShadow: "var(--shadow-navbar)" }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">
              Land Verification Portal
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Government of India
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-3">
            <div className="gradient-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-primary-foreground">
              RS
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                Rahul Singh
              </p>
              <p className="text-[10px] text-muted-foreground">
                Revenue Officer
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
