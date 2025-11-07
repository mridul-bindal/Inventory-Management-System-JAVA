// Orders.jsx
import React, { useEffect, useState } from "react";
import "../styles/Orders.css"; // keep general layout + cards + tables

import Nav from "../staticComponents/NavBar";
import Header from "../staticComponents/Header";
import { fetchOrders, createOrder, updateOrder, deleteOrder, changeOrderQty } from "../api/orders";
import { fetchProducts } from "../api/products";

const STORAGE_KEY = "ims_orders_v1";

const defaultOrders = [
  { id: "#7676", date: "06/30/2022", customer: "Ramesh Chaudhary", channel: "Store name", destination: "Lalitpur", items: 3, costPer: 250, payment: "Cash", status: "Completed" },
  { id: "#7677", date: "07/01/2022", customer: "Sunita Sharma", channel: "Online", destination: "Kathmandu", items: 2, costPer: 150, payment: "NEFT", status: "Pending" },
  { id: "#7678", date: "07/02/2022", customer: "Amit Kumar", channel: "Retail", destination: "Pokhara", items: 5, costPer: 120, payment: "RTGS", status: "Completed" },
];

function readOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultOrders;
  } catch {
    return defaultOrders;
  }
}

function generateOrderId() {
  // simple auto id: ORD-<time>
  return `ORD-${Date.now().toString().slice(-6)}`;
}

export default function Orders() {
  // data
  const [orders, setOrders] = useState(readOrders);
  // search + filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  // loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // new-order form state
  const [formOpen, setFormOpen] = useState(false);
  const [orderId, setOrderId] = useState(generateOrderId());
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  const [customer, setCustomer] = useState("");
  const [channel, setChannel] = useState("Store name");
  const [destination, setDestination] = useState("");
  const [productId, setProductId] = useState("");
  const [productNameInput, setProductNameInput] = useState("");
  const [items, setItems] = useState(1);
  const [costPer, setCostPer] = useState(0);
  const [payment, setPayment] = useState("Cash");
  const [status, setStatus] = useState("Pending");
  const [maxQuantity, setMaxQuantity] = useState(null);
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState([]);

  // Load orders and products from API on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const ordersData = await fetchOrders({ q: "", status: "All", payment: "All" });
        setOrders(ordersData);
        
        // Load products for validation
        const productsData = await fetchProducts("");
        setProducts(productsData);
      } catch (err) {
        setError(err.message);
        // Fallback to localStorage if API fails
        setOrders(readOrders());
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // persist to localStorage when orders change (for offline fallback)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // reset form
  function resetForm() {
    setOrderId(generateOrderId());
    setDate(new Date().toISOString().slice(0, 10));
    setCustomer("");
    setChannel("Store name");
    setDestination("");
    setProductId("");
    setProductNameInput("");
    setItems(1);
    setCostPer(0);
    setPayment("Cash");
    setStatus("Pending");
    setMaxQuantity(null);
    setProductName("");
  }

  // Handle product name input change - search and auto-fill product ID
  function handleProductNameInputChange(value) {
    setProductNameInput(value);
    
    if (!value || !value.trim()) {
      // Clear product ID and validation if name is cleared
      setProductId("");
      setMaxQuantity(null);
      setProductName("");
      return;
    }

    // Search for product by name (case-insensitive)
    const product = products.find(p => 
      p.name && p.name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    
    if (product) {
      // Product found - auto-fill product ID and set validation info
      setProductId(product.productId || "");
      setMaxQuantity(product.qty || 0);
      setProductName(product.name || "");
      
      // If current items exceed max, adjust it
      if (items > (product.qty || 0)) {
        setItems(product.qty || 0);
        alert(`Maximum available quantity is ${product.qty}. Quantity adjusted.`);
      }
    } else {
      // Product not found - clear product ID but keep name input
      // User can manually enter product ID
      setProductId("");
      setMaxQuantity(null);
      setProductName("");
    }
  }

  // Handle product ID input change (just update state, don't validate yet)
  function handleProductIdInputChange(value) {
    setProductId(value);
    // Clear validation info when user is typing
    if (!value || !value.trim()) {
      setMaxQuantity(null);
      setProductName("");
    }
  }

  // Validate product ID when user leaves the field (onBlur)
  function handleProductIdBlur() {
    const value = productId.trim();
    
    if (!value) {
      setMaxQuantity(null);
      setProductName("");
      return;
    }

    try {
      // Check if product exists in the products list
      const product = products.find(p => p.productId && p.productId.trim().toLowerCase() === value.toLowerCase());
      
      if (!product) {
        alert(`Product with ID "${value}" is not present in the database. Please add the product first.`);
        setProductId("");
        setMaxQuantity(null);
        setProductName("");
        setProductNameInput("");
        return;
      }

      // Product exists, set max quantity and product name
      setMaxQuantity(product.qty || 0);
      setProductName(product.name || "");
      setProductNameInput(product.name || "");
      
      // If current items exceed max, adjust it
      if (items > (product.qty || 0)) {
        setItems(product.qty || 0);
        alert(`Maximum available quantity is ${product.qty}. Quantity adjusted.`);
      }
    } catch (err) {
      console.error("Error validating product:", err);
      alert("Error validating product. Please try again.");
    }
  }

  // add order
  async function handleAddOrder(e) {
    e.preventDefault();
    if (!customer.trim()) return alert("Please enter customer name");
    if (!destination.trim()) return alert("Please enter destination");
    if (!productId.trim()) return alert("Please enter Product ID");
    
    // Validate product exists
    const product = products.find(p => p.productId && p.productId.trim().toLowerCase() === productId.trim().toLowerCase());
    if (!product) {
      alert(`Product with ID "${productId}" is not present in the database. Please add the product first.`);
      return;
    }

    // Validate quantity
    const orderQty = Number(items) || 0;
    if (orderQty <= 0) {
      alert("Please enter a valid quantity (greater than 0)");
      return;
    }
    if (orderQty > (product.qty || 0)) {
      alert(`Insufficient quantity. Maximum available: ${product.qty}`);
      return;
    }

    const per = Number(costPer) || 0;
    const newOrder = {
      id: orderId || generateOrderId(),
      date: (date && date.includes("-")) ? (() => {
        // convert yyyy-mm-dd to mm/dd/yyyy for consistency with sample dataset
        const [y, m, d] = date.split("-");
        return `${m}/${d}/${y}`;
      })() : date,
      customer: customer.trim(),
      channel,
      destination: destination.trim(),
      productId: productId.trim(),
      items: orderQty,
      costPer: per,
      payment,
      status,
    };
    try {
      await createOrder(newOrder);
      // Reload products to get updated quantities
      const updatedProducts = await fetchProducts("");
      setProducts(updatedProducts);
      setOrders(prev => [newOrder, ...prev]);
      resetForm();
      setFormOpen(false);
    } catch (err) {
      alert("Failed to create order: " + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this order?")) return;
    try {
      await deleteOrder(id);
      // Reload orders and products after deletion
      const ordersData = await fetchOrders({ q: "", status: "All", payment: "All" });
      setOrders(ordersData);
      const updatedProducts = await fetchProducts("");
      setProducts(updatedProducts);
    } catch (err) {
      alert("Failed to delete order: " + err.message);
    }
  }

  async function handleEdit(id) {
    const o = orders.find(x => x.id === id || x._id === id);
    if (!o) {
      alert("Order not found");
      return;
    }
    
    // Use MongoDB _id if available, otherwise use orderCode/id
    const orderIdToUpdate = o._id || id;
    
    const newCustomer = prompt("Customer name", o.customer || "");
    if (newCustomer === null) return;
    if (!newCustomer.trim()) {
      alert("Customer name cannot be empty");
      return;
    }
    
    const newDestination = prompt("Destination", o.destination || "");
    if (newDestination === null) return;
    if (!newDestination.trim()) {
      alert("Destination cannot be empty");
      return;
    }
    
    const newPayment = prompt("Payment (Cash/NEFT/RTGS/UPI)", o.payment || "Cash") || o.payment || "Cash";
    const newStatus = prompt("Status (Pending/Completed)", o.status || "Pending") || o.status || "Pending";
    
    const newCostPer = prompt("Cost per piece (numeric)", String(o.costPer || 0));
    if (newCostPer === null) return;
    const costPerNum = Number(newCostPer);
    if (!Number.isFinite(costPerNum) || costPerNum < 0) {
      alert("Enter valid cost per piece");
      return;
    }
    
    // Ensure we have productId - it's critical for order updates
    const productIdToUse = o.productId;
    if (!productIdToUse) {
      alert("Cannot update order: Product ID is missing. Please delete and recreate the order.");
      return;
    }
    
    // Create updated order object with all required fields
    const updatedOrder = { 
      customer: newCustomer.trim(), 
      destination: newDestination.trim(), 
      channel: o.channel || "Store name",
      payment: newPayment, 
      status: newStatus, 
      costPer: costPerNum,
      items: o.items || 1, // Preserve quantity
      productId: productIdToUse, // Critical: must preserve productId
      productName: o.productName || null
    };
    
    try {
      await updateOrder(orderIdToUpdate, updatedOrder);
      // Reload orders to get fresh data from backend
      const ordersData = await fetchOrders({ q: "", status: "All", payment: "All" });
      setOrders(ordersData);
      // Also reload products to reflect any quantity changes
      const updatedProducts = await fetchProducts("");
      setProducts(updatedProducts);
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order: " + (err.message || "Unknown error. Check console for details."));
    }
  }

  async function changeItems(id, delta) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const newItems = Math.max(0, Number(order.items) + Number(delta));
    const orderIdToUpdate = order._id || id;
    try {
      // backend expects item index and delta (change amount). The frontend stores only
      // a total items count (items); most demo orders use a single item entry, so
      // we send index 0 and the delta to increment/decrement quantity on server.
      await changeOrderQty(orderIdToUpdate, 0, delta);
      // Reload orders to get updated data including profit
      const ordersData = await fetchOrders({ q: "", status: "All", payment: "All" });
      setOrders(ordersData);
      // Reload products to reflect quantity changes in products section
      const updatedProducts = await fetchProducts("");
      setProducts(updatedProducts);
    } catch (err) {
      alert("Failed to update quantity: " + err.message);
      // Reload products even on error to ensure sync
      try {
        const updatedProducts = await fetchProducts("");
        setProducts(updatedProducts);
      } catch (e) {
        console.error("Failed to reload products:", e);
      }
    }
  }

  // filtered list
  const filtered = orders.filter(o => {
    const qLower = q.trim().toLowerCase();
    const matchesQ = qLower === "" || (o.id && o.id.toLowerCase().includes(qLower)) || (o.customer && o.customer.toLowerCase().includes(qLower));
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    const matchesPayment = paymentFilter === "All" || o.payment === paymentFilter;
    return matchesQ && matchesStatus && matchesPayment;
  });

  // CSV export helper (includes costPer and total)
  function exportCSV() {
    const csv = [
      ["Order ID","Date","Customer","Channel","Destination","Items","CostPer","Total","Payment","Status"],
      ...orders.map(o => {
        const per = Number(o.costPer) || 0;
        const total = (Number(o.items) || 0) * per;
        return [o.id,o.date,o.customer,o.channel,o.destination,o.items,per,total,o.payment,o.status];
      })
    ].map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // CSV import must expect costPer column (col index 6) and total (ignored)
  async function importCSVFile(file) {
    if (!file) return;
    const text = await file.text();
    const rows = text.split(/\r?\n/).filter(Boolean).slice(1);
    const imported = rows.map(r => {
      const cols = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g,"").trim());
      return {
        id: cols[0] || generateOrderId(),
        date: cols[1] || "",
        customer: cols[2] || "",
        channel: cols[3] || "",
        destination: cols[4] || "",
        items: Number(cols[5]) || 0,
        costPer: Number(cols[6]) || 0,
        payment: cols[8] || "Cash",
        status: cols[9] || "Pending",
      };
    });
    setOrders(prev => [...imported.filter(Boolean), ...prev]);
  }

  return (
    <div className="app-shell">
      <Nav />
      <div className="main-area">
        <Header />

        <div className="orders-page container">
          <div className="orders-top">
            <h2>Orders</h2>

            <div className="orders-actions">
              <button className="btn-outline" onClick={exportCSV}>Export to excel</button>

              <button className="btn-outline" onClick={() => {
                // quick import: open file input
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".csv,text/csv";
                input.onchange = async (ev) => {
                  const file = ev.target.files?.[0];
                  if (!file) return;
                  await importCSVFile(file);
                };
                input.click();
              }}>Import Orders</button>

              <button className="btn-primary" onClick={() => { setFormOpen(s => !s); if (!formOpen) resetForm(); }}>{formOpen ? "Close" : "+ New Orders"}</button>
            </div>
          </div>

          {/* NEW ORDER FORM (toggle) */}
          {formOpen && (
            <div className="new-order-card" style={{ marginBottom: 18, background: "#fff", padding: 16, borderRadius: 8, border: "1px solid rgba(15,23,42,0.04)" }}>
              <form onSubmit={handleAddOrder} className="new-order-form" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                <div>
                  <label className="input-label">Order ID</label>
                  <input className="input-field" value={orderId} onChange={e => setOrderId(e.target.value)} />
                </div>

                <div>
                  <label className="input-label">Date</label>
                  <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>

                <div>
                  <label className="input-label">Customer</label>
                  <input className="input-field" value={customer} onChange={e => setCustomer(e.target.value)} />
                </div>

                <div>
                  <label className="input-label">Sales channel</label>
                  <select className="input-field" value={channel} onChange={e => setChannel(e.target.value)}>
                    <option>Store name</option>
                    <option>Online</option>
                    <option>Wholesale</option>
                    <option>Retail</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Destination</label>
                  <input className="input-field" value={destination} onChange={e => setDestination(e.target.value)} />
                </div>

                <div>
                  <label className="input-label">Product Name</label>
                  <input 
                    className="input-field" 
                    value={productNameInput} 
                    onChange={e => handleProductNameInputChange(e.target.value)}
                    placeholder="Enter product name to auto-fill ID"
                    list="product-names"
                  />
                  <datalist id="product-names">
                    {products.map(p => (
                      <option key={p.id} value={p.name} />
                    ))}
                  </datalist>
                  {productName && (
                    <small style={{ color: "#10b981", fontSize: "12px", display: "block", marginTop: "4px" }}>
                      ✓ Product found: {productName}
                    </small>
                  )}
                </div>

                <div>
                  <label className="input-label">Product ID *</label>
                  <input 
                    className="input-field" 
                    value={productId} 
                    onChange={e => handleProductIdInputChange(e.target.value)}
                    onBlur={handleProductIdBlur}
                    placeholder="e.g., PROD-001 (auto-filled if name matches)"
                    required
                    style={{ 
                      backgroundColor: productId ? "#f0f9ff" : "white",
                      borderColor: productId ? "#3b82f6" : undefined
                    }}
                  />
                  {maxQuantity !== null && (
                    <small style={{ color: "#6366f1", fontSize: "12px", display: "block", marginTop: "4px" }}>
                      Max available: {maxQuantity}
                    </small>
                  )}
                </div>

                <div>
                  <label className="input-label">Quantity *</label>
                  <input 
                    className="input-field" 
                    type="number" 
                    min="1" 
                    max={maxQuantity !== null ? maxQuantity : undefined}
                    value={items} 
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (maxQuantity !== null && val > maxQuantity) {
                        alert(`Maximum quantity is ${maxQuantity}`);
                        setItems(maxQuantity);
                      } else {
                        setItems(e.target.value);
                      }
                    }}
                    required
                    disabled={!productId || maxQuantity === null}
                  />
                  {maxQuantity !== null && (
                    <small style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                      {items > maxQuantity ? `Cannot exceed ${maxQuantity}` : ""}
                    </small>
                  )}
                </div>

                <div>
                  <label className="input-label">Cost per piece</label>
                  <input className="input-field" type="number" min="0" step="0.01" value={costPer} onChange={e => setCostPer(e.target.value)} />
                </div>

                <div>
                  <label className="input-label">Payment</label>
                  <select className="input-field" value={payment} onChange={e => setPayment(e.target.value)}>
                    <option>Cash</option>
                    <option>NEFT</option>
                    <option>RTGS</option>
                    <option>UPI</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Status</label>
                  <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <button className="btn-primary" type="submit">Add Order</button>
                  <button type="button" className="btn-outline" onClick={() => { resetForm(); setFormOpen(false); }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="orders-controls" style={{ marginBottom: 12 }}>
            <div className="search-wrap">
              <input
                type="search"
                placeholder="Search order ID or customer"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="filters">
              <div className="filter-item">
                <label>Sales</label>
                <select>
                  <option>All</option>
                  <option>Store</option>
                  <option>Online</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All</option>
                  <option>Pending</option>
                  <option>Completed</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Payment</label>
                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                  <option>All</option>
                  <option>Cash</option>
                  <option>NEFT</option>
                  <option>RTGS</option>
                  <option>UPI</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Filter</label>
                <button className="btn-filter">▾</button>
              </div>
            </div>
          </div>

          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Sales channel</th>
                  <th>Destination</th>
                  <th>Items</th>
                  <th>Cost/pc</th>
                  <th>Total</th>
                  <th>Net Profit</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr className="no-results">
                    <td colSpan="13">No orders found</td>
                  </tr>
                ) : (
                  filtered.map((o, i) => {
                    const per = Number(o.costPer) || 0;
                    const total = (Number(o.items) || 0) * per;
                    const profit = Number(o.profit) || 0;
                    return (
                      <tr key={o.id + i}>
                        <td><input type="checkbox" /></td>
                        <td>{o.id}</td>
                        <td>{o.date}</td>
                        <td>{o.customer}</td>
                        <td>{o.channel}</td>
                        <td>{o.destination}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button className="qty-btn" onClick={() => changeItems(o.id, -1)}>-</button>
                            <span>{o.items}</span>
                            <button className="qty-btn" onClick={() => changeItems(o.id, +1)}>+</button>
                          </div>
                        </td>
                        <td>{per.toFixed(2)}</td>
                        <td>{total.toFixed(2)}</td>
                        <td className="ot-profit" style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          ${o.profit ? Number(o.profit).toFixed(2) : (
                            o.totalAmount ? (Number(o.totalAmount) * 0.3).toFixed(2) : '0.00'
                          )}
                        </td>
                        <td>{o.payment}</td>
                        <td>
                          <span className={`status-badge status-${(o.status || "").toLowerCase()}`}>{o.status}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn-sm" onClick={() => handleEdit(o._id || o.id)}>Edit</button>
                            <button className="btn-danger" onClick={() => handleDelete(o._id || o.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
