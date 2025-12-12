import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function StoreList() {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const res = await api.get("/stores");
      setStores(res.data);
    } catch (err) {
      console.error("Failed to load stores", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Discover Stores</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((s) => (
          <Link
            key={s.id}
            to={`/stores/${s.id}`}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold">{s.name}</h2>
              <div className="text-yellow-600 font-bold">
                ⭐ {Number(s.average_rating || 0).toFixed(1)}
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-1">{s.address}</p>
            <p className="text-xs text-gray-500 mt-2">
              {s.rating_count || 0} reviews
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
