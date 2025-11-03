// Products.jsx
import React, { useEffect, useState } from "react";
import "../styles/Products.css"; // keep general layout + cards + charts + tables

import Nav from "../staticComponents/NavBar";
import Header from "../staticComponents/Header";

const STORAGE_KEY = "ims_products_v1";

function readProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function Products() {
  const [products, setProducts] = useState(readProducts);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (!imageFile) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  function resetForm() {
    setName("");
    setDesc("");
    setQty("");
    setImageFile(null);
    setPreview(null);
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter product name");
    const initialQty = Number(qty);
    if (!Number.isFinite(initialQty) || initialQty < 0) return alert("Enter valid quantity");
    const newProduct = {
      id: Date.now(),
      name: name.trim(),
      description: desc.trim(),
      qty: initialQty,
      createdAt: new Date().toISOString(),
      image: preview || null // store base64 preview; small apps OK
    };
    setProducts((p) => [newProduct, ...p]);
    resetForm();
  }

  function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    setProducts((p) => p.filter((x) => x.id !== id));
  }

  function changeQty(id, delta) {
    setProducts((p) =>
      p.map((it) => (it.id === id ? { ...it, qty: Math.max(0, Number(it.qty) + delta) } : it))
    );
  }

  function handleEdit(id) {
    const it = products.find((p) => p.id === id);
    if (!it) return;
    const newName = prompt("Product name", it.name);
    if (newName === null) return;
    const newDesc = prompt("Description", it.description);
    if (newDesc === null) return;
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, name: newName, description: newDesc } : x)));
  }

  const filtered = products.filter(
    (p) =>
      query.trim() === "" ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="app-shell">
      <Nav />
      <div className="main-area">
        <Header />

        <div className="products-page container">
          <div className="products-top">
            <h2>Products</h2>
            <div className="products-actions">
              <input
                type="search"
                placeholder="Search product or description"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="products-search"
              />
            </div>
          </div>

          <div className="products-grid">
            {/* Left: Add Product Form */}
            <div className="product-form-card">
              <h3 className="pf-title">Add New Product</h3>
              <form className="product-form" onSubmit={handleAdd}>
                <label className="pf-label">Product name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="pf-input" />

                <label className="pf-label">Description</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="pf-textarea" rows={3} />

                <label className="pf-label">Quantity</label>
                <input
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="pf-input"
                  type="number"
                  min="0"
                />

                <label className="pf-label">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="pf-file"
                />
                {preview && (
                  <div className="pf-preview">
                    <img src={preview} alt="preview" />
                  </div>
                )}

                <div className="pf-actions">
                  <button type="submit" className="btn-primary">Add product</button>
                  <button type="button" onClick={resetForm} className="btn-outline">Reset</button>
                </div>
              </form>
            </div>

            {/* Right: Product list */}
            <div className="product-list-card">
              <h3 className="pl-title">Your products</h3>

              {filtered.length === 0 ? (
                <div className="empty">No products yet. Add one using the form.</div>
              ) : (
                <div className="products-table-wrap">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Product</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => (
                        <tr key={p.id}>
                          <td className="pt-photo">
                            {p.image ? <img src={p.image} alt={p.name} /> : <div className="photo-placeholder">No photo</div>}
                          </td>
                          <td className="pt-name">{p.name}</td>
                          <td className="pt-desc">{p.description}</td>
                          <td className="pt-qty">
                            <div className="qty-wrap">
                              <button className="qty-btn" onClick={() => changeQty(p.id, -1)}>-</button>
                              <span className="qty-value">{p.qty}</span>
                              <button className="qty-btn" onClick={() => changeQty(p.id, +1)}>+</button>
                            </div>
                          </td>
                          <td className="pt-actions">
                            <button className="btn-sm" onClick={() => handleEdit(p.id)}>Edit</button>
                            <button className="btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
