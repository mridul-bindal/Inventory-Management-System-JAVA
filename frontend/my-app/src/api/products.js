const API_BASE = 'http://localhost:8080/api/products';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const fetchProducts = async (query = '') => {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  
  const response = await fetch(`${API_BASE}?${params}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const createProduct = async (productData) => {
  const formData = new FormData();
  formData.append('name', productData.name);
  if (productData.description) formData.append('description', productData.description);
  if (productData.qty !== undefined) formData.append('qty', String(productData.qty));
  if (productData.imageFile) formData.append('image', productData.imageFile);

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  });
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
};

export const updateProduct = async (id, productData) => {
  const formData = new FormData();
  if (productData.name !== undefined) formData.append('name', productData.name);
  if (productData.description !== undefined) formData.append('description', productData.description);
  if (productData.qty !== undefined) formData.append('qty', String(productData.qty));
  if (productData.imageFile) formData.append('image', productData.imageFile);

  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to delete product');
};

export const changeProductQuantity = async (id, delta) => {
  const response = await fetch(`${API_BASE}/${id}/qty?delta=${delta}`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to update quantity');
  return response.json();
};