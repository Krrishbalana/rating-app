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
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Store Owner Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium shadow"
        >
          Logout
        </button>
      </div>

      {/* CREATE STORE */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full max-w-2xl mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Create New Store
        </h2>

        <form onSubmit={handleCreateStore} className="space-y-4">
          <input
            type="text"
            placeholder="Store Name"
            value={form.name}
            className="border p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            type="email"
            placeholder="Store Email"
            value={form.email}
            className="border p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="text"
            placeholder="Store Address"
            value={form.address}
            className="border p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full font-medium">
            Create Store
          </button>
        </form>
      </div>

      {/* MY STORES LIST */}
      <h2 className="text-xl font-semibold text-gray-700 mb-4">My Stores</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((s) => (
          <div
            key={s.id}
            className="bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1">{s.name}</h3>

            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {s.email}
            </p>

            <p className="text-sm text-gray-600 mb-3">
              <strong>Address:</strong> {s.address}
            </p>

            {/* Ratings */}
            <div className="text-yellow-600 font-semibold text-sm mb-4">
              ⭐ {Number(s.average_rating || 0).toFixed(1)}{" "}
              <span className="text-gray-500">
                ({s.rating_count || 0} reviews)
              </span>
            </div>

            <button
              onClick={() => handleDeleteStore(s.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md w-full font-medium"
            >
              Delete Store
            </button>
          </div>
        ))}

        {stores.length === 0 && (
          <p className="text-gray-600 text-center col-span-full mt-6">
            You haven't created any stores yet.
          </p>
        )}
      </div>
    </div>
  );
}
