import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { lazy, Suspense } from "react";
import NotFound from "./pages/NotFound.tsx";
import { RegionProvider } from "@/context/RegionContext";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ForestMap = lazy(() => import("./pages/ForestMap"));
const Weather = lazy(() => import("./pages/Weather"));
const Claims = lazy(() => import("./pages/Claims"));
const AIAdvisor = lazy(() => import("./pages/AIAdvisor"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Bhuvan = lazy(() => import("./pages/Bhuvan"));

const queryClient = new QueryClient();

const App = () => (
  <RegionProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <header className="h-12 flex items-center border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                  <SidebarTrigger className="ml-2" />
                  <span className="ml-3 text-sm font-medium text-muted-foreground">VanCC — Forest Carbon Credit Intelligence</span>
                </header>
                <main className="flex-1 overflow-auto">
                  <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-pulse text-muted-foreground">Loading...</div></div>}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/map" element={<ForestMap />} />
                      <Route path="/weather" element={<Weather />} />
                      <Route path="/claims" element={<Claims />} />
                      <Route path="/ai-advisor" element={<AIAdvisor />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/bhuvan" element={<Bhuvan />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </RegionProvider>
);

export default App;
