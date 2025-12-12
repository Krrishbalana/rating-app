import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StoreOwnerDashboard from "./pages/owner/StoreOwnerDashboard";
import UserDashboard from "./pages/user/UserDashboard";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      {/* Navbar shows only when user is logged in */}
      <Navbar />

      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------- PROTECTED ROUTES ---------- */}

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="system_admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Store Owner Dashboard */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute role="store_owner">
              <StoreOwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Normal User Dashboard */}
        <Route
          path="/user"
          element={
            <ProtectedRoute role="normal_user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
