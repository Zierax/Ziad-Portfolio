import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { RouteMeta } from "./seo/useRouteMeta";
import ZyoAssistant from "./components/ZyoAssistant";

// Route-level splitting: each page loads on demand instead of bloating the
// initial bundle (was a single 521 KB chunk). Shell stays eager.
const Boot = lazy(() => import("./pages/Boot"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Challenge = lazy(() => import("./pages/Challenge"));
const Landing = lazy(() => import("./pages/Landing"));
const AcademicPortfolio = lazy(() => import("./pages/AcademicPortfolio"));

import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ZyoAssistant />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteMeta />
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-[#020403] font-mono text-sm tracking-[0.2em] text-terminal-green">
                LOADING<span className="animate-pulse">_</span>
              </div>
            }
          >
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/boot" element={<Boot />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/academic" element={<AcademicPortfolio />} />
            <Route path="/challenge" element={<Challenge />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
