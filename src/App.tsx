
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PageTransition } from "@/components/layout/PageTransition";
import Auth from "./pages/Auth";
import ValidateIdea from "./pages/ValidateIdea";
import Processing from "./pages/Processing";
import Results from "./pages/Results";
import SavedReports from "./pages/SavedReports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageTransition>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ValidateIdea />} />
              <Route path="/processing" element={<Processing />} />
              <Route path="/results" element={<Results />} />
              <Route path="/saved-reports" element={<SavedReports />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
