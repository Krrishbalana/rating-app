import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useContext(AuthContext);

  // ⭐ Wait until we load user from localStorage
  if (loading) return null; // or a loader UI

  // fallback: user restored from localStorage
  const storedUser = localStorage.getItem("user");
  const finalUser = user || (storedUser ? JSON.parse(storedUser) : null);

  // Not logged in
  if (!finalUser) return <Navigate to="/" replace />;

  // Role mismatch
  if (role && finalUser.role !== role) return <Navigate to="/" replace />;

  return children;
}
