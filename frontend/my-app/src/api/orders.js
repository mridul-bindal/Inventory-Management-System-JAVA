const API_BASE = 'http://localhost:8080/api/orders';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Helper to map backend Order to frontend format
const mapOrderFromBackend = (order) => {
  const items = order.items || [];
  const totalItems = order.itemsCount || 0;
  // Get unit price from first item if available, otherwise calculate from total
  const costPer = items.length > 0 && items[0].unitPrice 
    ? items[0].unitPrice 
    : (totalItems > 0 ? (order.totalAmount || 0) / totalItems : 0);
  const dateStr = order.date ? new Date(order.date).toLocaleDateString('en-US') : '';
  // Get profit from totalProfit (preferred) or from first item's profit
  const profit = order.totalProfit !== undefined && order.totalProfit !== null
    ? order.totalProfit 
    : (items.length > 0 && items[0].profit !== undefined && items[0].profit !== null 
        ? items[0].profit 
        : 0);
  return {
    id: order.orderCode || order.id,
    _id: order.id, // Store MongoDB ID for updates
    date: dateStr,
    customer: order.customerName || '',
    channel: order.channel || '',
    destination: order.destination || '',
    items: totalItems,
    costPer: costPer,
    payment: order.payment || '',
    status: order.status || '',
    profit: profit,
    productId: items.length > 0 ? items[0].productId : null,
  };
};

// Helper to map frontend order to backend CreateOrderRequest
const mapOrderToBackend = (order) => {
  const items = [{
    productId: order.productId || null,
    productName: order.productName || 'Product', // Will be fetched from backend
    qty: order.items || 0,
    unitPrice: order.costPer || 0,
  }];
  return {
    customerName: order.customer,
    channel: order.channel,
    destination: order.destination,
    items: items,
    payment: order.payment,
    status: order.status,
  };
};

export const fetchOrders = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);
  if (filters.payment && filters.payment !== 'All') params.append('payment', filters.payment);

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  const orders = await response.json();
  return orders.map(mapOrderFromBackend);
};

export const createOrder = async (order) => {
  const payload = mapOrderToBackend(order);
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create order');
  const created = await response.json();
  return mapOrderFromBackend(created);
};

export const updateOrder = async (id, order) => {
  const payload = mapOrderToBackend(order);
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to update order');
  const updated = await response.json();
  return mapOrderFromBackend(updated);
};

export const deleteOrder = async (id) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete order');
};

export const changeOrderQty = async (id, index, delta) => {
  const response = await fetch(`${API_BASE}/${id}/items/${index}/change?delta=${delta}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to change quantity');
  const updated = await response.json();
  return mapOrderFromBackend(updated);
};
