import { motion } from "framer-motion";
import { Shield, ArrowRight, Brain, MapPinned, FileCheck, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Brain,
    title: "AI Land Identification",
    description: "Advanced machine learning algorithms analyze satellite imagery to identify and verify land boundaries with precision.",
  },
  {
    icon: MapPinned,
    title: "Boundary Coordinate Matching",
    description: "GPS coordinate matching system cross-references submitted boundaries with government survey records in real-time.",
  },
  {
    icon: FileCheck,
    title: "Document Verification & Approval",
    description: "Digital document processing pipeline with automated validation checks and streamlined officer approval workflow.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute inset-0 gradient-glow" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-[10%] h-72 w-72 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-[10%] h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      {/* Hero */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25">
            <Shield className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Government of India — Digital Land Records
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-3xl text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-tight"
        >
          Government Land{" "}
          <span className="text-gradient">Verification</span>{" "}
          Portal
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-4 text-lg sm:text-xl font-medium text-muted-foreground"
        >
          Digital Land Ownership & Boundary Verification System
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-3 max-w-xl text-sm text-muted-foreground/80 leading-relaxed"
        >
          A secure, centralized platform for government officers to verify land ownership records, validate boundary coordinates, and process verification requests efficiently.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="gradient-primary group flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Enter Officer Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-8 py-3.5 text-sm font-semibold text-secondary-foreground transition-all hover:bg-secondary active:scale-[0.98]"
          >
            View System Overview
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 animate-float"
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground/50" />
        </motion.div>
      </div>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 pb-24 pt-12">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              System Capabilities
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Powered by modern technology for accurate land verification
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="glass-card-hover p-8 text-center"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
