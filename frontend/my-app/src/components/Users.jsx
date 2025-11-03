// Users.jsx
import React, { useEffect, useMemo, useState } from "react";
import Nav from "../staticComponents/NavBar";
import Header from "../staticComponents/Header";
import "../styles/Users.css";

const STORAGE_KEY = "ims_users_v1";

function readUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function Users() {
  const [users, setUsers] = useState(readUsers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // add-user form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("User"); // Admin, Manager, User
  const [status, setStatus] = useState("Active"); // Active, Suspended
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (!photoFile) { setPhotoPreview(null); return; }
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(photoFile);
  }, [photoFile]);

  function resetForm() {
    setName("");
    setEmail("");
    setRole("User");
    setStatus("Active");
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Enter name");
    if (!email.trim()) return alert("Enter email");
    const newUser = {
      id: `U-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: email.trim(),
      role,
      status,
      photo: photoPreview || null,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [newUser, ...prev]);
    resetForm();
  }

  function handleDelete(id) {
    if (!confirm("Delete user?")) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  function handleEdit(id) {
    const u = users.find(x => x.id === id);
    if (!u) return;
    const newName = prompt("Name", u.name);
    if (newName === null) return;
    const newEmail = prompt("Email", u.email);
    if (newEmail === null) return;
    const newRole = prompt("Role (Admin/Manager/User)", u.role) || u.role;
    const newStatus = prompt("Status (Active/Suspended)", u.status) || u.status;
    setUsers(prev => prev.map(x => x.id === id ? { ...x, name: newName, email: newEmail, role: newRole, status: newStatus } : x));
  }

  function toggleStatus(id) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u));
  }

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = query.trim().toLowerCase();
      const matchQ = q === "" || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === "All" || u.role === roleFilter;
      return matchQ && matchRole;
    });
  }, [users, query, roleFilter]);

  // counts
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "Active").length;

  return (
    <div className="app-shell">
      <Nav />
      <div className="main-area">
        <Header />

        <div className="users-page container">
          <div className="users-top">
            <h2>Users</h2>
            <div className="users-meta">
              <div className="stat small-card">
                <div className="stat-value">{totalUsers}</div>
                <div className="stat-label">Total users</div>
              </div>
              <div className="stat small-card">
                <div className="stat-value">{activeUsers}</div>
                <div className="stat-label">Active users</div>
              </div>
            </div>
          </div>

          <div className="users-grid">
            {/* Left - Add User */}
            <div className="user-form-card">
              <h3>Add new user</h3>
              <form className="user-form" onSubmit={handleAdd}>
                <label className="uf-label">Name</label>
                <input className="uf-input" value={name} onChange={(e) => setName(e.target.value)} />

                <label className="uf-label">Email</label>
                <input className="uf-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />

                <label className="uf-label">Role</label>
                <select className="uf-input" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>User</option>
                </select>

                <label className="uf-label">Status</label>
                <select className="uf-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option>Active</option>
                  <option>Suspended</option>
                </select>

                <label className="uf-label">Photo</label>
                <input className="uf-file" type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                {photoPreview && <div className="uf-preview"><img src={photoPreview} alt="preview" /></div>}

                <div className="uf-actions">
                  <button className="btn-primary" type="submit">Add user</button>
                  <button type="button" className="btn-outline" onClick={resetForm}>Reset</button>
                </div>
              </form>
            </div>

            {/* Right - User list */}
            <div className="user-list-card">
              <div className="list-top">
                <input className="users-search" placeholder="Search name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
                <select className="users-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option>All</option>
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>User</option>
                </select>
              </div>

              <div className="users-table-wrap">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr className="no-results"><td colSpan="7">No users found</td></tr>
                    ) : (
                      filtered.map(u => (
                        <tr key={u.id}>
                          <td className="u-photo">{u.photo ? <img src={u.photo} alt={u.name} /> : <div className="photo-placeholder">No</div>}</td>
                          <td className="u-name">{u.name}</td>
                          <td className="u-email">{u.email}</td>
                          <td className="u-role">{u.role}</td>
                          <td className="u-status">
                            <button className={`status-pill ${u.status === "Active" ? "active" : "suspended"}`} onClick={() => toggleStatus(u.id)}>
                              {u.status}
                            </button>
                          </td>
                          <td className="u-joined">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="u-actions">
                            <button className="btn-sm" onClick={() => handleEdit(u.id)}>Edit</button>
                            <button className="btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
