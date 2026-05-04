import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader text="Loading..." /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "doctor" ? "/doctor" : "/patient"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
