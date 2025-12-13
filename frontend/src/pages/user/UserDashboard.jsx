import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const { logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await api.get("/stores");
      setStores(res.data);
    } catch (error) {
      console.log("Error fetching stores", error);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-6 space-y-6">
      {/* HEADER + LOGOUT */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white leading-snug">
          User Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-red-400 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-400/40"
        >
          Logout
        </button>
      </div>

      <h2 className="text-lg font-bold text-white leading-snug">All Stores</h2>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((s) => (
          <div
            key={s.id}
            className="bg-neutral-900/80 border border-white/5 p-6 rounded-lg shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
          >
            <h3 className="text-base font-bold text-white mb-1 leading-snug">
              {s.name}
            </h3>

            <p className="text-sm text-white/70 mb-1">
              <span className="font-medium text-white">Email:</span> {s.email}
            </p>

            <p className="text-sm text-white/70 mb-3">
              <span className="font-medium text-white">Address:</span>{" "}
              {s.address}
            </p>

            <div className="text-sm font-semibold text-white mb-4">
              ⭐ {Number(s.average_rating || 0).toFixed(1)}{" "}
              <span className="text-white/40">
                ({s.rating_count || 0} reviews)
              </span>
            </div>

            <button
              onClick={() => navigate(`/stores/${s.id}`)}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              View Details
            </button>
          </div>
        ))}

        {stores.length === 0 && (
          <p className="text-sm text-white/40 text-center col-span-full mt-6">
            No stores available yet.
          </p>
        )}
      </div>
    </div>
  );
}
