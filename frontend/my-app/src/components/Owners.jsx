// Owners.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../staticComponents/NavBar";
import Header from "../staticComponents/Header";
import "../styles/Users.css"; // Reuse Users.css for styling
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee, getOwnerIncome } from "../api/employees";
import { isOwner } from "../utils/auth";

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount) return '$0';
  const num = typeof amount === 'object' && amount.$numberDecimal
    ? parseFloat(amount.$numberDecimal)
    : Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export default function Owners() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [ownerIncome, setOwnerIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  // Add employee form state
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [salary, setSalary] = useState("");
  const [position, setPosition] = useState("Staff");

  // Edit state
  const [editingId, setEditingId] = useState(null);

  // Check owner access on mount
  useEffect(() => {
    if (!isOwner()) {
      alert("Access denied: Only owner can access this section");
      navigate('/Dashboard');
      return;
    }
    // Only load data if user is owner
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [employeesData, incomeData] = await Promise.all([
        fetchEmployees(),
        getOwnerIncome()
      ]);
      setEmployees(employeesData);
      setOwnerIncome(incomeData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function resetForm() {
    setName("");
    setSalary("");
    setPosition("Staff");
    setEditingId(null);
    setFormOpen(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Enter employee name");
    if (!salary || Number(salary) <= 0) return alert("Enter valid salary");

    try {
      const employeeData = {
        name: name.trim(),
        salary: Number(salary),
        position: position || "Staff"
      };
      
      if (editingId) {
        await updateEmployee(editingId, employeeData);
      } else {
        await createEmployee(employeeData);
      }
      
      await loadData();
      resetForm();
    } catch (err) {
      alert("Failed to save employee: " + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this employee?")) return;
    try {
      await deleteEmployee(id);
      await loadData();
    } catch (err) {
      alert("Failed to delete employee: " + err.message);
    }
  }

  function handleEdit(employee) {
    setName(employee.name);
    setSalary(employee.salary?.toString() || "");
    setPosition(employee.position || "Staff");
    setEditingId(employee.id);
    setFormOpen(true);
  }

  const filtered = employees.filter(emp => {
    const q = query.trim().toLowerCase();
    return q === "" || 
           emp.name?.toLowerCase().includes(q) || 
           emp.position?.toLowerCase().includes(q);
  });

  const totalSalaries = employees.reduce((sum, emp) => {
    const sal = typeof emp.salary === 'object' && emp.salary.$numberDecimal
      ? parseFloat(emp.salary.$numberDecimal)
      : Number(emp.salary) || 0;
    return sum + sal;
  }, 0);

  // Don't render if not owner (will redirect in useEffect)
  if (!isOwner()) {
    return null;
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Nav />
        <div className="main-area">
          <Header />
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    // Check if error is access denied
    if (error.includes('Access denied') || error.includes('403')) {
      return (
        <div className="app-shell">
          <Nav />
          <div className="main-area">
            <Header />
            <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
              <h2>Access Denied</h2>
              <p>Only owner@gmail.com can access this section.</p>
              <button className="btn-primary" onClick={() => navigate('/Dashboard')}>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="app-shell">
        <Nav />
        <div className="main-area">
          <Header />
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Nav />
      <div className="main-area">
        <Header />

        <div className="users-page container">
          <div className="users-top">
            <h2>Owners</h2>
            <div className="users-meta">
              <div className="stat small-card">
                <div className="stat-value">{employees.length}</div>
                <div className="stat-label">Total Employees</div>
              </div>
              <div className="stat small-card">
                <div className="stat-value">{formatCurrency(totalSalaries)}</div>
                <div className="stat-label">Total Salaries</div>
              </div>
            </div>
          </div>

          {/* Owner Income Section */}
          {ownerIncome && (
            <div style={{ 
              background: '#fff', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              border: '1px solid rgba(15,23,42,0.04)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Owner Income</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Total Profit</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {formatCurrency(ownerIncome.totalProfit)}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Total Salaries</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                    {formatCurrency(ownerIncome.totalSalaries)}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#10b981', borderRadius: '6px', color: 'white' }}>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Owner Income</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {formatCurrency(ownerIncome.ownerIncome)}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                    (Profit - Salaries)
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="users-grid">
            {/* Left - Add Employee Form */}
            <div className="user-form-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>{editingId ? 'Edit Employee' : 'Add new employee'}</h3>
                {formOpen && (
                  <button className="btn-outline" onClick={resetForm} style={{ fontSize: '0.875rem' }}>
                    Cancel
                  </button>
                )}
              </div>
              
              {(!formOpen && !editingId) ? (
                <button className="btn-primary" onClick={() => setFormOpen(true)}>
                  + Add Employee
                </button>
              ) : (
                <form className="user-form" onSubmit={handleAdd}>
                  <label className="uf-label">Name *</label>
                  <input 
                    className="uf-input" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required
                  />

                  <label className="uf-label">Salary (Monthly) *</label>
                  <input 
                    className="uf-input" 
                    type="number" 
                    min="0" 
                    step="0.01"
                    value={salary} 
                    onChange={(e) => setSalary(e.target.value)} 
                    required
                  />

                  <label className="uf-label">Position</label>
                  <select 
                    className="uf-input" 
                    value={position} 
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option>Staff</option>
                    <option>Manager</option>
                    <option>Assistant</option>
                    <option>Other</option>
                  </select>

                  <div className="uf-actions">
                    <button className="btn-primary" type="submit">
                      {editingId ? 'Update' : 'Add'} Employee
                    </button>
                    <button type="button" className="btn-outline" onClick={resetForm}>
                      Reset
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right - Employee list */}
            <div className="user-list-card">
              <div className="list-top">
                <input 
                  className="users-search" 
                  placeholder="Search by name or position" 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                />
              </div>

              <div className="users-table-wrap">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Salary (Monthly)</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr className="no-results">
                        <td colSpan="5">No employees found</td>
                      </tr>
                    ) : (
                      filtered.map(emp => (
                        <tr key={emp.id}>
                          <td className="u-name">{emp.name}</td>
                          <td className="u-role">{emp.position || 'Staff'}</td>
                          <td className="u-email" style={{ fontWeight: 'bold', color: '#059669' }}>
                            {formatCurrency(emp.salary)}
                          </td>
                          <td className="u-joined">
                            {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="u-actions">
                            <button className="btn-sm" onClick={() => handleEdit(emp)}>Edit</button>
                            <button className="btn-danger" onClick={() => handleDelete(emp.id)}>Delete</button>
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

