import React, { useEffect, useState, useRef } from "react";
import "../styles/Products.css";
import Nav from "../staticComponents/NavBar";
import Header from "../staticComponents/Header";
import { fetchProducts, createProduct, updateProduct, deleteProduct, changeProductQuantity } from "../api/products";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [query, setQuery] = useState("");
  const fileInputRef = useRef(null);

  // fetch products from API
  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts(query);
        if (mounted) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadProducts();
    return () => (mounted = false);
  }, [query]);

  // preview image when user selects a file
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ---------- API actions ----------

  // ---------- UI actions ----------
  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter product name");
    const initialQty = Number(qty === "" ? 0 : qty);
    if (!Number.isFinite(initialQty) || initialQty < 0) return alert("Enter valid quantity");

    const optimisticProduct = {
      id: `temp-${Date.now()}`,
      name: name.trim(),
      description: desc.trim(),
      qty: initialQty,
      image: preview || null,
      createdAt: new Date().toISOString()
    };

    setProducts((p) => [optimisticProduct, ...p]);
    resetForm();

    try {
      const created = await createProduct({
        name: optimisticProduct.name,
        description: optimisticProduct.description,
        qty: initialQty,
        imageFile
      });
      setProducts((p) => [created, ...p.filter((x) => x.id !== optimisticProduct.id)]);
    } catch (err) {
      setProducts((p) => p.filter((x) => x.id !== optimisticProduct.id));
      alert("Failed to create product: " + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    const prev = products;
    setProducts((p) => p.filter((x) => x.id !== id));
    try {
      await deleteProduct(id);
    } catch (err) {
      setProducts(prev);
      alert("Failed to delete product: " + err.message);
    }
  }

  async function changeQty(id, delta) {
    const prev = products;
    setProducts((p) => p.map((it) => (it.id === id ? { ...it, qty: Math.max(0, Number(it.qty) + delta) } : it)));
    try {
      const updated = await changeProductQuantity(id, delta);
      setProducts((p) => p.map((it) => (it.id === id ? updated : it)));
    } catch (err) {
      setProducts(prev);
      alert("Failed to change quantity: " + err.message);
    }
  }

  async function handleEdit(id) {
    const it = products.find((p) => p.id === id);
    if (!it) return;
    const newName = prompt("Product name", it.name);
    if (newName === null) return;
    const newDesc = prompt("Description", it.description);
    if (newDesc === null) return;

    const prev = products;
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, name: newName, description: newDesc } : x)));

    try {
      const updated = await updateProduct(id, { name: newName, description: newDesc });
      setProducts((p) => p.map((x) => (x.id === id ? updated : x)));
    } catch (err) {
      setProducts(prev);
      alert("Failed to update product: " + err.message);
    }
  }

  // file change handler for form input
  function onFileChange(e) {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
  }

  const filtered = products.filter(
    (p) =>
      query.trim() === "" ||
      (p.name && p.name.toLowerCase().includes(query.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
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
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
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
              <h3 className="pl-title">Your products {loading ? "(loading...)" : ""}</h3>

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
                            {p.imageBase64 || p.image ? (
                              <img src={p.imageBase64 || p.image} alt={p.name} />
                            ) : (
                              <div className="photo-placeholder">No photo</div>
                            )}
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
