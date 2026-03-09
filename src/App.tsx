import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";
import { isSupabaseConfigured, missingSupabaseEnvVars } from "@/integrations/supabase/client";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Signup = lazy(() => import("./pages/Signup"));
const Papers = lazy(() => import("./pages/Papers"));
const Upload = lazy(() => import("./pages/Upload"));
const AISearch = lazy(() => import("./pages/AISearch"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FacultyDashboard = lazy(() => import("./pages/FacultyDashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {!isSupabaseConfigured && (
            <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-2 text-sm text-destructive text-center">
              Supabase is not configured. Missing: {missingSupabaseEnvVars.join(", ")}.
              Set these in your `.env` file.
            </div>
          )}
          <BrowserRouter>
            <Suspense fallback={<LoadingOverlay visible={true} message="Loading..." />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/papers" element={<Papers />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/ai-search" element={<AISearch />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/faculty" element={
                  <ProtectedRoute requiredRole="faculty">
                    <FacultyDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
