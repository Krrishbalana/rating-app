import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

/**
 * Admin Dashboard
 * - Fancy tabs (Users | Stores | Stats)
 * - Users tab first (search, sorting, add user, view modal, update role, delete)
 * - Stores tab (admin stores view, search, sorting, delete, details modal)
 * - Stats tab (3 cards)
 *
 * Endpoints used (already created earlier):
 * GET  /admin/stats
 * GET  /admin/users
 * POST /admin/users/create
 * PUT  /admin/users/:id/role
 * DELETE /admin/users/:id
 * GET  /admin/users/:id/details
 *
 * GET  /admin/stores  (added in adminController)
 * DELETE /stores/:id  (existing store delete allowed for admin)
 * GET  /stores/:id
 */

function SortIcon({ column, sortColumn, sortDirection }) {
  // HeroIcons-style chevrons using SVG
  if (sortColumn !== column) {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        className="inline-block opacity-50"
      >
        <path d="M7 14l5-5 5 5H7z" fill="currentColor" />
      </svg>
    );
  }
  if (sortDirection === "asc") {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        className="inline-block text-blue-600"
      >
        <path d="M7 14l5-5 5 5H7z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      className="inline-block text-blue-600"
    >
      <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
    </svg>
  );
}

export default function AdminDashboard() {
  const { user, logoutUser } = useContext(AuthContext);

  // CREATE STORE MODAL STATE
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });
  const [storeOwners, setStoreOwners] = useState([]);

  useEffect(() => {
    fetchStoreOwners();
  }, []);

  const fetchStoreOwners = async () => {
    try {
      const res = await api.get("/admin/users");
      const owners = res.data.filter((u) => u.role === "store_owner");
      setStoreOwners(owners);
    } catch (err) {
      console.error("fetchStoreOwners error:", err);
    }
  };

  // Tabs: 'users' | 'stores' | 'stats'
  const [activeTab, setActiveTab] = useState("users");

  // Stats
  const [stats, setStats] = useState({
    total_users: 0,
    total_stores: 0,
    total_ratings: 0,
  });

  // USERS state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userSortColumn, setUserSortColumn] = useState("id");
  const [userSortDirection, setUserSortDirection] = useState("asc");

  // Add user modal
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "normal_user",
  });

  // Selected user modal (details)
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // STORES state (admin view)
  const [stores, setStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState("");
  const [storeSortColumn, setStoreSortColumn] = useState("id");
  const [storeSortDirection, setStoreSortDirection] = useState("asc");
  const [selectedStoreDetails, setSelectedStoreDetails] = useState(null);
  const [showStoreModal, setShowStoreModal] = useState(false);

  // load initial
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([fetchStats(), fetchUsers(), fetchAdminStores()]);
  };

  // ------- STATS -------
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("fetchStats:", err);
    }
  };
  const handleCreateStore = async (e) => {
    e.preventDefault();

    try {
      await api.post("/stores/admin-create", storeForm);

      setStoreForm({
        name: "",
        email: "",
        address: "",
        owner_id: "",
      });

      setShowCreateStore(false);
      await fetchAdminStores();
      await fetchStats();

      alert("Store created successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create store");
    }
  };

  // ------- USERS -------
  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("fetchUsers:", err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/users/create", createForm);
      setCreateForm({
        name: "",
        email: "",
        address: "",
        password: "",
        role: "normal_user",
      });
      setShowCreateUser(false);
      await fetchUsers();
      await fetchStats();
      alert("User created");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers();
      alert("Role updated");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchUsers();
      await fetchStats();
      alert("User deleted");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const openUserDetails = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}/details`);
      setSelectedUserDetails(res.data);
      setShowUserModal(true);
    } catch (err) {
      console.error("openUserDetails:", err);
      alert("Failed to load user details");
    }
  };

  // filter + sort users
  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.role, u.address || ""]
      .join(" ")
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let A = a[userSortColumn];
    let B = b[userSortColumn];

    if (A == null) A = "";
    if (B == null) B = "";

    if (typeof A === "string") A = A.toLowerCase();
    if (typeof B === "string") B = B.toLowerCase();

    if (A < B) return userSortDirection === "asc" ? -1 : 1;
    if (A > B) return userSortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const toggleUserSort = (col) => {
    if (userSortColumn === col) {
      setUserSortDirection(userSortDirection === "asc" ? "desc" : "asc");
    } else {
      setUserSortColumn(col);
      setUserSortDirection("asc");
    }
  };

  // ------- STORES -------
  const fetchAdminStores = async () => {
    try {
      const res = await api.get("/admin/stores");
      setStores(res.data || []);
    } catch (err) {
      console.error("fetchAdminStores:", err);
    }
  };

  const deleteStore = async (storeId) => {
    if (!confirm("Delete this store?")) return;
    try {
      await api.delete(`/stores/${storeId}`);
      await fetchAdminStores();
      await fetchStats();
      alert("Store deleted");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete store");
    }
  };

  const openStoreDetails = async (storeId) => {
    try {
      const res = await api.get(`/stores/${storeId}`);
      setSelectedStoreDetails(res.data);
      setShowStoreModal(true);
    } catch (err) {
      console.error("openStoreDetails:", err);
      alert("Failed to load store details");
    }
  };

  const filteredStores = stores.filter((s) =>
    [s.name, s.email, s.address, s.owner_name, s.owner_email]
      .join(" ")
      .toLowerCase()
      .includes(storeSearch.toLowerCase())
  );

  const sortedStores = [...filteredStores].sort((a, b) => {
    let A = a[storeSortColumn];
    let B = b[storeSortColumn];

    if (A == null) A = "";
    if (B == null) B = "";

    if (typeof A === "string") A = A.toLowerCase();
    if (typeof B === "string") B = B.toLowerCase();

    if (A < B) return storeSortDirection === "asc" ? -1 : 1;
    if (A > B) return storeSortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const toggleStoreSort = (col) => {
    if (storeSortColumn === col) {
      setStoreSortDirection(storeSortDirection === "asc" ? "desc" : "asc");
    } else {
      setStoreSortColumn(col);
      setStoreSortDirection("asc");
    }
  };

  // ---------- UI small helpers ----------
  const renderSortIcon = (col, currentCol, currentDir) => (
    <span className="ml-1 inline-block">
      <SortIcon
        column={col}
        sortColumn={currentCol}
        sortDirection={currentDir}
      />
    </span>
  );

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white leading-snug">
          Admin Panel
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              logoutUser();
            }}
            className="rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-red-400 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-400/40"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Fancy Tabs */}
      <div className="flex gap-6 border-b border-white/10 mb-6">
        {["users", "stores", "stats"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={
              "pb-3 px-2 -mb-px text-sm font-medium transition-all duration-200 ease-out " +
              (activeTab === t
                ? "text-white border-b-2 border-primary"
                : "text-white/40 hover:text-white")
            }
          >
            {t === "users" ? "Users" : t === "stores" ? "Stores" : "Stats"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {/* ========== USERS TAB ========== */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Actions row */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setShowCreateUser(true)}
                className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-primary/40"
              >
                + Add User
              </button>

              <div className="w-96">
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search name, email, role or address..."
                  className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-neutral-900/80 border border-white/5 rounded-lg shadow-sm shadow-black/40 overflow-x-auto">
              <table className="w-full text-left text-sm text-white">
                <thead className="bg-neutral-800 text-white/70">
                  <tr>
                    <th
                      className="p-3 cursor-pointer"
                      onClick={() => toggleUserSort("id")}
                    >
                      <div className="flex items-center">
                        ID{" "}
                        {renderSortIcon(
                          "id",
                          userSortColumn,
                          userSortDirection
                        )}
                      </div>
                    </th>
                    <th
                      className="p-3 cursor-pointer"
                      onClick={() => toggleUserSort("name")}
                    >
                      <div className="flex items-center">
                        Name{" "}
                        {renderSortIcon(
                          "name",
                          userSortColumn,
                          userSortDirection
                        )}
                      </div>
                    </th>
                    <th
                      className="p-3 cursor-pointer"
                      onClick={() => toggleUserSort("email")}
                    >
                      <div className="flex items-center">
                        Email{" "}
                        {renderSortIcon(
                          "email",
                          userSortColumn,
                          userSortDirection
                        )}
                      </div>
                    </th>
                    <th
                      className="p-3 cursor-pointer"
                      onClick={() => toggleUserSort("role")}
                    >
                      <div className="flex items-center">
                        Role{" "}
                        {renderSortIcon(
                          "role",
                          userSortColumn,
                          userSortDirection
                        )}
                      </div>
                    </th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedUsers.map((u) => (
                    <tr key={u.id} className="border-t border-white/5">
                      <td className="p-3">{u.id}</td>
                      <td className="p-3">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          disabled={u.id === user?.id}
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                          className={`rounded-lg bg-neutral-800 border border-white/10 px-2 py-2 text-sm text-white focus:ring-2 focus:ring-primary/40 ${
                            u.id === user?.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <option value="normal_user">Normal User</option>
                          <option value="store_owner">Store Owner</option>
                          <option value="system_admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => openUserDetails(u.id)}
                          className="rounded-lg bg-primary px-3 py-2 text-sm text-white transition-all hover:scale-[1.02]"
                        >
                          View
                        </button>

                        <button
                          disabled={u.id === user?.id}
                          onClick={() => deleteUser(u.id)}
                          className={`rounded-lg px-3 py-2 text-sm text-white transition-all ${
                            u.id === user?.id
                              ? "bg-neutral-700 cursor-not-allowed"
                              : "bg-red-500 hover:scale-[1.02]"
                          }`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {sortedUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-white/40">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== STORES TAB ========== */}
        {activeTab === "stores" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setShowCreateStore(true)}
                className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02]"
              >
                + Add Store
              </button>

              <div className="w-96">
                <input
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  placeholder="Search stores by name, owner or address..."
                  className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="bg-neutral-900/80 border border-white/5 rounded-lg shadow-sm shadow-black/40 overflow-x-auto">
              <table className="w-full text-left text-sm text-white">
                <thead className="bg-neutral-800 text-white/70">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Store</th>
                    <th className="p-3">Owner</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedStores.map((s) => (
                    <tr key={s.id} className="border-t border-white/5">
                      <td className="p-3">{s.id}</td>
                      <td className="p-3">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-white/40">{s.address}</div>
                        <div className="text-xs text-white/40">{s.email}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{s.owner_name}</div>
                        <div className="text-xs text-white/40">
                          {s.owner_email}
                        </div>
                      </td>
                      <td className="p-3">
                        ⭐ {Number(s.avg_rating || 0).toFixed(1)}
                        <div className="text-xs text-white/40">
                          {s.rating_count} reviews
                        </div>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => openStoreDetails(s.id)}
                          className="rounded-lg bg-primary px-3 py-2 text-sm text-white"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteStore(s.id)}
                          className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {sortedStores.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-white/40">
                        No stores found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== STATS TAB ========== */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              ["Total Users", stats.total_users],
              ["Total Stores", stats.total_stores],
              ["Total Ratings", stats.total_ratings],
            ].map(([label, value]) => (
              <div
                key={label}
                className="bg-neutral-900/80 border border-white/5 p-6 rounded-lg shadow-sm shadow-black/40 text-center"
              >
                <p className="text-sm text-white/40">{label}</p>
                <div className="text-3xl font-bold text-white">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== USER DETAILS MODAL ========== */}
      {showUserModal && selectedUserDetails && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-neutral-900/90 border border-white/5 shadow-sm shadow-black/40 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-white leading-snug">
                {selectedUserDetails.user.name}
              </h2>
              <button
                className="text-white/40 hover:text-white transition-colors"
                onClick={() => setShowUserModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-white/70">
                <span className="text-white font-medium">Email:</span>{" "}
                {selectedUserDetails.user.email}
              </p>
              <p className="text-white/70">
                <span className="text-white font-medium">Role:</span>{" "}
                {selectedUserDetails.user.role}
              </p>
              <p className="text-white/70">
                <span className="text-white font-medium">Address:</span>{" "}
                {selectedUserDetails.user.address}
              </p>
            </div>

            {selectedUserDetails.stores &&
              selectedUserDetails.stores.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">Owned Stores</h3>
                  <div className="space-y-2">
                    {selectedUserDetails.stores.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-lg bg-neutral-800 border border-white/10 p-3"
                      >
                        <div className="text-sm font-medium text-white">
                          {s.name}
                        </div>
                        <div className="text-xs text-white/40">
                          ⭐ {s.avg_rating} ({s.rating_count})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {selectedUserDetails.ratings &&
              selectedUserDetails.ratings.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">User Ratings</h3>
                  <div className="space-y-2">
                    {selectedUserDetails.ratings.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg bg-neutral-800 border border-white/10 p-3"
                      >
                        <div className="text-sm font-medium text-white">
                          {r.store_name}
                        </div>
                        <div className="text-xs text-white/70">
                          ⭐ {r.rating}
                        </div>
                        <div className="text-xs text-white/40">{r.comment}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowUserModal(false)}
                className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-out hover:bg-neutral-600 active:scale-[0.98] focus:ring-2 focus:ring-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== CREATE USER MODAL ========== */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-neutral-900/90 border border-white/5 shadow-sm shadow-black/40 p-6 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white leading-snug">
                Create New User
              </h2>
              <button
                onClick={() => setShowCreateUser(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />

              <input
                type="text"
                placeholder="Address"
                value={createForm.address}
                onChange={(e) =>
                  setCreateForm({ ...createForm, address: e.target.value })
                }
                className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />

              <input
                type="password"
                placeholder="Password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />

              <select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({ ...createForm, role: e.target.value })
                }
                className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              >
                <option value="normal_user">Normal User</option>
                <option value="store_owner">Store Owner</option>
                <option value="system_admin">Admin</option>
              </select>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-out hover:bg-neutral-600 active:scale-[0.98]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-primary/40"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== CREATE STORE MODAL ========== */}
      {showCreateStore && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-neutral-900/90 border border-white/5 shadow-sm shadow-black/40 p-6 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white leading-snug">
                Create New Store
              </h2>
              <button
                onClick={() => setShowCreateStore(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-4">
              <input
                type="text"
                placeholder="Store Name"
                value={storeForm.name}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, name: e.target.value })
                }
                className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />

              <input
                type="email"
                placeholder="Store Email"
                value={storeForm.email}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, email: e.target.value })
                }
                className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />

              <input
                type="text"
                placeholder="Store Address"
                value={storeForm.address}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, address: e.target.value })
                }
                className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />

              {/* Store Owner Select */}
              <select
                value={storeForm.owner_id}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, owner_id: e.target.value })
                }
                className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              >
                <option value="">Select Store Owner</option>
                {storeOwners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.email})
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateStore(false)}
                  className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-out hover:bg-neutral-600 active:scale-[0.98]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm shadow-black/40 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-primary/40"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== STORE DETAILS MODAL ========== */}
      {showStoreModal && selectedStoreDetails && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-neutral-900/90 border border-white/5 shadow-sm shadow-black/40 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-white leading-snug">
                {selectedStoreDetails.name}
              </h2>
              <button
                className="text-white/40 hover:text-white transition-colors"
                onClick={() => setShowStoreModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-white/70">
                <span className="text-white font-medium">Email:</span>{" "}
                {selectedStoreDetails.email}
              </p>
              <p className="text-white/70">
                <span className="text-white font-medium">Address:</span>{" "}
                {selectedStoreDetails.address}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">Ratings</h3>

              <div className="space-y-1 text-sm">
                <div className="text-white">
                  ⭐ {selectedStoreDetails.average_rating}
                </div>
                <div className="text-white/40">
                  {selectedStoreDetails.rating_count} reviews
                </div>
              </div>

              {/* breakdown if available */}
              {selectedStoreDetails.rating_breakdown && (
                <div className="mt-3 grid grid-cols-1 gap-1">
                  {Object.entries(selectedStoreDetails.rating_breakdown).map(
                    ([r, c]) => (
                      <div
                        key={r}
                        className="flex justify-between text-sm text-white/70"
                      >
                        <div>{r} star</div>
                        <div>{c}</div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowStoreModal(false)}
                className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-out hover:bg-neutral-600 active:scale-[0.98] focus:ring-2 focus:ring-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
