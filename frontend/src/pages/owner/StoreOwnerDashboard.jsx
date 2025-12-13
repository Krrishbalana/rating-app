import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function StoreOwnerDashboard() {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
  });

  // ---------------------- FETCH OWNER STORES ----------------------
  useEffect(() => {
    if (user?.id) fetchMyStores();
  }, [user]);

  const fetchMyStores = async () => {
    try {
      const res = await api.get(`/stores/owner/${user.id}`);
      setStores(res.data);
    } catch (error) {
      console.log("Error fetching stores", error);
    }
  };

  // ---------------------- CREATE STORE ----------------------
  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      await api.post("/stores", {
        name: form.name,
        email: form.email,
        address: form.address,
      });

      setForm({ name: "", email: "", address: "" });
      fetchMyStores();
    } catch (error) {
      console.log("Error creating store", error);
      alert(error.response?.data?.message || "Failed to create store");
    }
  };

  // ---------------------- DELETE STORE ----------------------
  const handleDeleteStore = async (id) => {
    if (!confirm("Delete this store?")) return;

    try {
      await api.delete(`/stores/${id}`);
      fetchMyStores();
    } catch (error) {
      console.log("Delete failed", error);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  // ------------------------------------------------------------

  return (
    <div className="min-h-screen bg-neutral-950 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white leading-snug">
          Store Owner Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-red-400 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-400/40"
        >
          Logout
        </button>
      </div>

      {/* CREATE STORE */}
      <div className="bg-neutral-900/80 border border-white/5 p-6 rounded-lg shadow-sm shadow-black/40 transition-all duration-200 ease-out w-full max-w-2xl">
        <h2 className="text-lg font-bold text-white leading-snug mb-4">
          Create New Store
        </h2>

        <form onSubmit={handleCreateStore} className="space-y-4">
          <input
            type="text"
            placeholder="Store Name"
            value={form.name}
            className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200 ease-out"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            type="email"
            placeholder="Store Email"
            value={form.email}
            className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200 ease-out"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="text"
            placeholder="Store Address"
            value={form.address}
            className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200 ease-out"
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <button className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40">
            Create Store
          </button>
        </form>
      </div>

      {/* MY STORES LIST */}
      <h2 className="text-lg font-bold text-white leading-snug">My Stores</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((s) => (
          <div
            key={s.id}
            className="bg-neutral-900/80 border border-white/5 p-6 rounded-lg shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
          >
            <h3 className="text-base font-bold text-white mb-1 leading-snug">
              {s.name}
            </h3>

            <p className="text-sm text-white/70">
              <span className="font-medium text-white">Email:</span> {s.email}
            </p>

            <p className="text-sm text-white/70 mb-3">
              <span className="font-medium text-white">Address:</span>{" "}
              {s.address}
            </p>

            {/* Ratings */}
            <div className="text-sm font-semibold text-white mb-4">
              ⭐ {Number(s.average_rating || 0).toFixed(1)}{" "}
              <span className="text-white/40">
                ({s.rating_count || 0} reviews)
              </span>
            </div>

            <button
              onClick={() => handleDeleteStore(s.id)}
              className="w-full rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-red-400 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-400/40"
            >
              Delete Store
            </button>
          </div>
        ))}

        {stores.length === 0 && (
          <p className="text-sm text-white/40 text-center col-span-full mt-6">
            You haven't created any stores yet.
          </p>
        )}
      </div>
    </div>
  );
}
