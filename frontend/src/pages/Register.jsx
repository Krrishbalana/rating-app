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
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <form
        className="bg-white p-6 rounded shadow-md w-96"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-semibold mb-4">Register</h1>

        <input
          type="text"
          placeholder="Full Name"
          className="border w-full mb-3 p-2 rounded"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          className="border w-full mb-3 p-2 rounded"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="border w-full mb-3 p-2 rounded"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <input
          type="text"
          placeholder="Address"
          className="border w-full mb-3 p-2 rounded"
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <select
          className="border w-full mb-3 p-2 rounded"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="normal_user">Normal User</option>
          <option value="store_owner">Store Owner</option>
          <option value="system_admin">System Admin</option>
        </select>

        <button className="bg-green-600 text-white w-full py-2 rounded">
          Register
        </button>

        {/* ---------- ADD THIS ---------- */}
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
