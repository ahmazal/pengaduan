import { Navigate } from "react-router-dom";

export default function PrivateRoutes({ children, Role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (Role && userRole !== Role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
