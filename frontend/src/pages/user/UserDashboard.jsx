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
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      {/* HEADER + LOGOUT */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium shadow"
        >
          Logout
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mb-4">All Stores</h2>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((s) => (
          <div
            key={s.id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-200"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1">{s.name}</h3>

            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Email:</span> {s.email}
            </p>

            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Address:</span> {s.address}
            </p>

            <div className="text-yellow-600 font-semibold text-sm mb-4">
              ⭐ {Number(s.average_rating || 0).toFixed(1)}{" "}
              <span className="text-gray-500">
                ({s.rating_count || 0} reviews)
              </span>
            </div>

            <button
              onClick={() => navigate(`/stores/${s.id}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
            >
              View Details
            </button>
          </div>
        ))}

        {stores.length === 0 && (
          <p className="text-gray-600 text-center col-span-full mt-6">
            No stores available yet.
          </p>
        )}
      </div>
    </div>
  );
}
