import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Practice from "./pages/Practice.tsx";
import DailyPlan from "./pages/DailyPlan.tsx";
import AICoach from "./pages/AICoach.tsx";
import MistakeBank from "./pages/MistakeBank.tsx";
import Analytics from "./pages/Analytics.tsx";
import TestSession from "./pages/TestSession.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/plan" element={<DailyPlan />} />
          <Route path="/coach" element={<AICoach />} />
          <Route path="/mistakes" element={<MistakeBank />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/test/:mode" element={<TestSession />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
