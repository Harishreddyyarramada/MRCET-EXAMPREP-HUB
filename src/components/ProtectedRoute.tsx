import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingOverlay from "@/components/LoadingOverlay";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "faculty" | "student";
  redirectTo?: string;
}

const ProtectedRoute = ({ children, requiredRole, redirectTo = "/login" }: ProtectedRouteProps) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <LoadingOverlay visible={true} message="Loading..." />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    // Admin and faculty can access faculty routes
    if (requiredRole === "faculty" && hasRole("admin")) {
      return <>{children}</>;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
