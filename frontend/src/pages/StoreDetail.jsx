import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import StarsDisplay from "../components/StarsDisplay";
import StarInput from "../components/StarInput";
import RatingBar from "../components/RatingBar";

export default function StoreDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchStore();
    fetchRatings();
  }, [id]);

  const fetchStore = async () => {
    try {
      const res = await api.get(`/stores/${id}`);
      setStore(res.data);
    } catch (err) {
      console.error("Error loading store", err);
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await api.get(`/ratings/store/${id}`);
      setRatings(res.data);
    } catch (err) {
      console.error("Error loading ratings", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.comment.trim()) {
      alert("Review comment is required");
      return;
    }

    try {
      if (editing) {
        await api.put(`/ratings/${editing}`, {
          rating: form.rating,
          comment: form.comment,
        });
        setEditing(null);
      } else {
        await api.post("/ratings", {
          store_id: id,
          rating: form.rating,
          comment: form.comment,
        });
      }

      setForm({ rating: 5, comment: "" });
      fetchStore();
      fetchRatings();
    } catch (err) {
      console.error("Submit rating error", err);
      alert(err.response?.data?.message || "Failed to submit rating");
    }
  };

  const handleEdit = (review) => {
    setForm({ rating: review.rating, comment: review.comment });
    setEditing(review.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (ratingId) => {
    if (!confirm("Delete this review?")) return;

    try {
      await api.delete(`/ratings/${ratingId}`);
      fetchStore();
      fetchRatings();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  if (!store)
    return <div className="p-6 text-sm text-white/70">Loading...</div>;

  const total = store.rating_count || 0;
  const breakdown = store.rating_breakdown || {};

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="bg-neutral-900/80 border border-white/5 shadow-sm shadow-black/40 p-6 rounded-lg transition-all duration-200 ease-out">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white leading-snug">
              {store.name}
            </h1>
            <p className="text-sm text-white/70">{store.address}</p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {Number(store.average_rating).toFixed(1)}
            </div>
            <p className="text-sm text-white/40">{total} reviews</p>
          </div>
        </div>
      </div>

      {/* BREAKDOWN + REVIEW FORM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="bg-neutral-900/80 border border-white/5 shadow-sm shadow-black/40 p-6 rounded-lg transition-all duration-200 ease-out">
          <h2 className="text-lg font-bold text-white mb-4 leading-snug">
            Rating Breakdown
          </h2>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((s) => (
              <RatingBar
                key={s}
                stars={s}
                count={breakdown[s] || 0}
                total={total}
              />
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2 bg-neutral-900/80 border border-white/5 shadow-sm shadow-black/40 p-6 rounded-lg transition-all duration-200 ease-out">
          <h2 className="text-lg font-bold text-white mb-3 leading-snug">
            {editing ? "Edit Review" : "Write a Review"}
          </h2>

          {!user ? (
            <p className="text-sm text-white/70">
              Please login to leave a review.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <StarInput
                value={form.rating}
                onChange={(r) => setForm({ ...form, rating: r })}
              />

              <textarea
                className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200 ease-out"
                rows="4"
                placeholder="Write your review here..."
                required
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
              />

              <div className="flex gap-3">
                <button className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40">
                  {editing ? "Save Changes" : "Submit Review"}
                </button>

                {editing && (
                  <button
                    type="button"
                    className="rounded-lg border border-white/10 px-4 py-3 text-sm text-white/70 transition-all duration-200 ease-out hover:bg-white/5 active:scale-[0.98]"
                    onClick={() => {
                      setEditing(null);
                      setForm({ rating: 5, comment: "" });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {ratings.length === 0 ? (
          <p className="text-sm text-white/40 bg-neutral-900/80 border border-white/5 p-4 rounded-lg shadow-sm shadow-black/40">
            No reviews yet.
          </p>
        ) : (
          ratings.map((r) => (
            <div
              key={r.id}
              className="bg-neutral-900/80 border border-white/5 p-4 rounded-lg shadow-sm shadow-black/40 transition-all duration-200 ease-out"
            >
              <div className="flex justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">{r.user_name}</p>
                  <StarsDisplay value={r.rating} />
                </div>

                {user && user.id === r.user_id && (
                  <div className="flex gap-3 text-sm">
                    <button
                      className="text-white/70 hover:text-white transition-colors"
                      onClick={() => handleEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-400 hover:text-red-300 transition-colors"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-2 text-sm text-white/70">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
