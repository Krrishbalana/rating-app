import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import StoreOwnerDashboard from "./pages/owner/StoreOwnerDashboard";
import UserDashboard from "./pages/user/UserDashboard";

import StoreList from "./pages/StoreList";
import StoreDetail from "./pages/StoreDetail";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------------- PUBLIC ROUTES ---------------- */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Stores listing (public) */}
        <Route path="/stores" element={<StoreList />} />

        {/* Store detail page (public, but review needs login) */}
        <Route path="/stores/:id" element={<StoreDetail />} />

        {/* ---------------- PROTECTED ROUTES ---------------- */}

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="system_admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* STORE OWNER DASHBOARD */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute role="store_owner">
              <StoreOwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* NORMAL USER DASHBOARD */}
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
