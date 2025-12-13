import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      loginUser(res.data.user, res.data.token);

      if (res.data.user.role === "system_admin") navigate("/admin");
      if (res.data.user.role === "store_owner") navigate("/owner");
      if (res.data.user.role === "normal_user") navigate("/user");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-neutral-950 p-6">
      <form
        className="w-full max-w-sm space-y-6 bg-neutral-900/80 border border-white/5 shadow-sm shadow-black/40 p-6 rounded-lg transition-all duration-200 ease-out"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-bold text-white leading-snug">
          Sign in to your account
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200 ease-out"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200 ease-out"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          Login
        </button>

        <p className="text-center text-sm text-white/70">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-white hover:underline transition-colors"
          >
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
