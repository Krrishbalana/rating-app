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
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-white leading-snug">
        Discover Stores
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((s) => (
          <Link
            key={s.id}
            to={`/stores/${s.id}`}
            className="group bg-neutral-900/80 border border-white/5 p-6 rounded-lg shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-base font-bold text-white leading-snug">
                {s.name}
              </h2>
              <div className="text-sm font-semibold text-white">
                ⭐ {Number(s.average_rating || 0).toFixed(1)}
              </div>
            </div>

            <p className="text-sm text-white/70 mt-1">{s.address}</p>
            <p className="text-xs text-white/40 mt-2">
              {s.rating_count || 0} reviews
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
