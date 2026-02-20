import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Boot from "./pages/Boot";
import Portfolio from "./pages/Portfolio";
import Challenge from "./pages/Challenge";
import Landing from "./pages/Landing";
import AcademicPortfolio from "./pages/AcademicPortfolio";

import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Landing />} />
          <Route path="/boot" element={<Boot />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/academic" element={<AcademicPortfolio />} />
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
