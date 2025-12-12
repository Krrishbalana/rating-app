import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.log("Error loading users:", error);
      toast.error("Failed to load users");
    }
    setLoading(false);
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      toast.success("Role updated");
      fetchUsers();
    } catch (error) {
      console.log("Role update error:", error);
      toast.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      console.log("Delete error:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
          Admin Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium shadow"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Manage Users
        </h2>

        {/* LOADING STATE */}
        {loading && (
          <p className="text-center text-gray-600 py-6">Loading users...</p>
        )}

        {/* USERS TABLE */}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm border-b">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.length > 0 ? (
                  users.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-b hover:bg-gray-100 transition`}
                    >
                      <td className="p-4">{u.id}</td>
                      <td className="p-4">{u.name}</td>
                      <td className="p-4">{u.email}</td>

                      {/* ROLE DROPDOWN */}
                      <td className="p-4">
                        <select
                          className="border p-2 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-400"
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value)
                          }
                        >
                          <option value="normal_user">Normal User</option>
                          <option value="store_owner">Store Owner</option>
                          <option value="system_admin">System Admin</option>
                        </select>
                      </td>

                      {/* DELETE BUTTON */}
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-6 text-gray-500 italic"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
