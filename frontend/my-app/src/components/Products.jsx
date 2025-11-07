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
  const [productId, setProductId] = useState("");
  const [buyingCost, setBuyingCost] = useState("");
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
          // Ensure data is an array
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        if (mounted) {
          setError(err.message || "Failed to load products. Please check if the backend is running.");
          setProducts([]); // Clear products on error
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadProducts();
    return () => {
      mounted = false;
    };
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
    setProductId("");
    setBuyingCost("");
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ---------- API actions ----------

  // ---------- UI actions ----------
  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter product name");
    if (!productId.trim()) return alert("Please enter product ID");
    const initialQty = Number(qty === "" ? 0 : qty);
    if (!Number.isFinite(initialQty) || initialQty < 0) return alert("Enter valid quantity");
    const cost = Number(buyingCost === "" ? 0 : buyingCost);
    if (!Number.isFinite(cost) || cost < 0) return alert("Enter valid buying cost");

    const optimisticProduct = {
      id: `temp-${Date.now()}`,
      name: name.trim(),
      productId: productId.trim(),
      description: desc.trim(),
      qty: initialQty,
      buyingCost: cost,
      image: preview || null,
      createdAt: new Date().toISOString()
    };

    setProducts((p) => [optimisticProduct, ...p]);
    resetForm();

    try {
      const created = await createProduct({
        name: optimisticProduct.name,
        productId: optimisticProduct.productId,
        description: optimisticProduct.description,
        qty: initialQty,
        buyingCost: cost,
        imageFile
      });
      // Replace optimistic product with real one from server
      if (created && created.id) {
        setProducts((p) => [created, ...p.filter((x) => x.id !== optimisticProduct.id)]);
      } else {
        // If response is invalid, remove optimistic and refetch
        setProducts((p) => p.filter((x) => x.id !== optimisticProduct.id));
        const data = await fetchProducts(query);
        setProducts(Array.isArray(data) ? data : []);
      }
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

          {error && (
            <div className="error-message" style={{
              color: 'red',
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: '#fff3f3',
              border: '1px solid #ffcdd2',
              borderRadius: '4px'
            }}>
              Error: {error}
            </div>
          )}

          <div className="products-grid">
            {/* Left: Add Product Form */}
            <div className="product-form-card">
              <h3 className="pf-title">Add New Product</h3>
              <form className="product-form" onSubmit={handleAdd}>
                <label className="pf-label">Product ID *</label>
                <input 
                  value={productId} 
                  onChange={(e) => setProductId(e.target.value)} 
                  className="pf-input" 
                  placeholder="e.g., PROD-001"
                  required
                />

                <label className="pf-label">Product name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="pf-input" required />

                <label className="pf-label">Description</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="pf-textarea" rows={3} />

                <label className="pf-label">Quantity *</label>
                <input
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="pf-input"
                  type="number"
                  min="0"
                  required
                />

                <label className="pf-label">Buying Cost *</label>
                <input
                  value={buyingCost}
                  onChange={(e) => setBuyingCost(e.target.value)}
                  className="pf-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
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
                        <th>Product ID</th>
                        <th>Product</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Buying Cost</th>
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
                          <td className="pt-productId">{p.productId || "N/A"}</td>
                          <td className="pt-name">{p.name}</td>
                          <td className="pt-desc">{p.description}</td>
                          <td className="pt-qty">
                            <div className="qty-wrap">
                              <button className="qty-btn" onClick={() => changeQty(p.id, -1)}>-</button>
                              <span className="qty-value">{p.qty}</span>
                              <button className="qty-btn" onClick={() => changeQty(p.id, +1)}>+</button>
                            </div>
                          </td>
                          <td className="pt-buyingCost">${p.buyingCost ? parseFloat(p.buyingCost).toFixed(2) : "0.00"}</td>
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
