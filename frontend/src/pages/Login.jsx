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
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <form
        className="bg-white p-6 rounded shadow-md w-80"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-semibold mb-4">Login</h1>

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

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Login
        </button>

        {/* ADD THIS LINE BELOW FORM */}
        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
