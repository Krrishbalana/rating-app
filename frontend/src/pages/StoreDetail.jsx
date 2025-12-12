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

  if (!store) return <div className="p-6">Loading...</div>;

  const total = store.rating_count || 0;
  const breakdown = store.rating_breakdown || {};

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="bg-white p-6 shadow rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{store.name}</h1>
            <p className="text-gray-600">{store.address}</p>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold text-yellow-500">
              {Number(store.average_rating).toFixed(1)}
            </div>
            <p className="text-gray-500">{total} reviews</p>
          </div>
        </div>
      </div>

      {/* BREAKDOWN + REVIEW FORM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT: Rating Breakdown */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="font-semibold mb-4">Rating Breakdown</h2>

          {[5, 4, 3, 2, 1].map((s) => (
            <RatingBar
              key={s}
              stars={s}
              count={breakdown[s] || 0}
              total={total}
            />
          ))}
        </div>

        {/* RIGHT: Add / Edit Review */}
        <div className="md:col-span-2 bg-white p-6 shadow rounded-lg">
          <h2 className="font-semibold mb-3">
            {editing ? "Edit Review" : "Write a Review"}
          </h2>

          {!user ? (
            <p className="text-gray-600">Please login to leave a review.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <StarInput
                value={form.rating}
                onChange={(r) => setForm({ ...form, rating: r })}
              />

              <textarea
                className="w-full border p-3 rounded-lg"
                rows="4"
                placeholder="Write your review here..."
                required
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
              />

              <div className="flex gap-2">
                <button className="bg-green-600 text-white px-4 py-2 rounded">
                  {editing ? "Save Changes" : "Submit Review"}
                </button>

                {editing && (
                  <button
                    type="button"
                    className="border px-4 py-2 rounded"
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
          <p className="text-gray-500 bg-white p-4 rounded shadow">
            No reviews yet.
          </p>
        ) : (
          ratings.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{r.user_name}</p>
                  <StarsDisplay value={r.rating} />
                </div>

                {user && user.id === r.user_id && (
                  <div className="flex gap-3 text-sm">
                    <button
                      className="text-blue-600"
                      onClick={() => handleEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-2 text-gray-800">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
