import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  // Not logged in → send to login page
  if (!user) return <Navigate to="/" />;

  // If a role is required, but user does not match role
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
}
