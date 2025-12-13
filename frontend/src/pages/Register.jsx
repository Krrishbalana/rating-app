import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "normal_user",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      alert("Registration successful!");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-neutral-950 p-6">
      <form
        className="w-full max-w-md space-y-6 bg-neutral-900/80 border border-white/5 shadow-sm shadow-black/40 p-6 rounded-lg transition-all duration-200 ease-out"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-bold text-white leading-snug">
          Create your account
        </h1>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200 ease-out"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

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

        <input
          type="text"
          placeholder="Address"
          className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200 ease-out"
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <select
          className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200 ease-out"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="normal_user">Normal User</option>
          <option value="store_owner">Store Owner</option>
          <option value="system_admin">System Admin</option>
        </select>

        <button className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40">
          Register
        </button>

        <p className="text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-medium text-white hover:underline transition-colors"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
