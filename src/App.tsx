import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/RequireAuth";
import { DataBootstrap } from "@/components/DataBootstrap";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Practice from "./pages/Practice.tsx";
import DailyPlan from "./pages/DailyPlan.tsx";
import AICoach from "./pages/AICoach.tsx";
import MistakeBank from "./pages/MistakeBank.tsx";
import Analytics from "./pages/Analytics.tsx";
import TestSession from "./pages/TestSession.tsx";
import Auth from "./pages/Auth.tsx";
import Profile from "./pages/Profile.tsx";
import Boxes from "./pages/Boxes.tsx";
import Store from "./pages/Store.tsx";
import CoachArticle from "./pages/CoachArticle.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DataBootstrap />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
            <Route path="/practice" element={<RequireAuth><Practice /></RequireAuth>} />
            <Route path="/plan" element={<RequireAuth><DailyPlan /></RequireAuth>} />
            <Route path="/coach" element={<RequireAuth><AICoach /></RequireAuth>} />
            <Route path="/coach/:slug" element={<RequireAuth><CoachArticle /></RequireAuth>} />
            <Route path="/mistakes" element={<RequireAuth><MistakeBank /></RequireAuth>} />
            <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/boxes" element={<RequireAuth><Boxes /></RequireAuth>} />
            <Route path="/store" element={<RequireAuth><Store /></RequireAuth>} />
            <Route path="/test/:mode" element={<RequireAuth><TestSession /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
