
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth/AuthContext";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import VerificationSent from "./pages/auth/VerificationSent";
import NotFound from "./pages/NotFound";

// Dashboard pages
import Dashboard from "./pages/dashboard/Dashboard";
import NewQuoteForm from "./pages/dashboard/quotes/NewQuoteForm";
import Billing from "./pages/dashboard/settings/Billing";

// Auth route protection
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/verification-sent" element={<VerificationSent />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/quotes/new" element={<NewQuoteForm />} />
              <Route path="/dashboard/settings/billing" element={<Billing />} />
              
              {/* Placeholder routes for future implementation */}
              <Route path="/dashboard/customers" element={<Dashboard />} />
              <Route path="/dashboard/quotes" element={<Dashboard />} />
              <Route path="/dashboard/crm" element={<Dashboard />} />
              <Route path="/dashboard/settings" element={<Navigate to="/dashboard/settings/billing" />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
