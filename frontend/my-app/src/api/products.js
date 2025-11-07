const API_BASE = 'http://localhost:8080/api/products';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const getJsonHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const getFormDataHeaders = () => {
  // Don't set Content-Type for FormData - browser will set it with boundary
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (res.status === 403 || res.status === 401) {
    const errorMsg = res.status === 403 ? 'Access forbidden - Please log in' : 'Unauthorized - Please log in';
    throw new Error(errorMsg);
  }
  
  const text = await res.text();
  let json = null;
  try { 
    json = text ? JSON.parse(text) : null; 
  } catch(e) { 
    console.error('Failed to parse response as JSON:', e, 'Response text:', text);
  }

  if (!res.ok) {
    const msg = json?.message || json?.error || text || res.statusText;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  
  if (json === null && text) {
    throw new Error('Invalid response format');
  }
  
  return json || [];
};


export const fetchProducts = async (query = '') => {
  try {
    const params = new URLSearchParams();
    if (query && query.trim() !== '') params.append('q', query.trim());
    const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    // If unauthorized, clear token and redirect to login
    if (error.message.includes('403') || error.message.includes('401') || error.message.includes('forbidden')) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    throw error;
  }
};

export const getProductById = async (id) => {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    headers: getJsonHeaders()
  });
  return handleResponse(response);
};


export const createProduct = async (productData) => {
  const formData = new FormData();
  formData.append('name', productData.name);
  if (productData.productId) formData.append('productId', productData.productId);
  if (productData.description) formData.append('description', productData.description);
  if (productData.qty !== undefined) formData.append('qty', String(productData.qty));
  if (productData.buyingCost !== undefined) formData.append('buyingCost', String(productData.buyingCost));
  if (productData.imageFile) formData.append('image', productData.imageFile);

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: getFormDataHeaders(),
    body: formData
  });
  return handleResponse(response);
};

export const updateProduct = async (id, productData) => {
  const formData = new FormData();
  if (productData.name !== undefined) formData.append('name', productData.name);
  if (productData.productId !== undefined) formData.append('productId', productData.productId);
  if (productData.description !== undefined) formData.append('description', productData.description);
  if (productData.qty !== undefined) formData.append('qty', String(productData.qty));
  if (productData.buyingCost !== undefined) formData.append('buyingCost', String(productData.buyingCost));
  if (productData.imageFile) formData.append('image', productData.imageFile);

  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: getFormDataHeaders(),
    body: formData
  });
  return handleResponse(response);
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: getJsonHeaders()
  });
  if (!response.ok) {
    const error = await handleResponse(response).catch(() => null);
    throw new Error(error?.message || 'Failed to delete product');
  }
};

export const changeProductQuantity = async (id, delta) => {
  const response = await fetch(`${API_BASE}/${id}/qty?delta=${delta}`, {
    method: 'PATCH',
    headers: getJsonHeaders()
  });
  return handleResponse(response);
};