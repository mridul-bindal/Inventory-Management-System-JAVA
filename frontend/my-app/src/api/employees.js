const API_BASE = 'http://localhost:8080/api/employees';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const fetchEmployees = async () => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    };
    
    const response = await fetch(API_BASE, {
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch employees' }));
      console.error('Error fetching employees:', error, 'Status:', response.status);
      throw new Error(error.error || `Failed to fetch employees: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('fetchEmployees error:', error);
    throw error;
  }
};

export const createEmployee = async (employee) => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(employee),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create employee' }));
    throw new Error(error.error || 'Failed to create employee');
  }
  return await response.json();
};

export const updateEmployee = async (id, employee) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(employee),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update employee' }));
    throw new Error(error.error || 'Failed to update employee');
  }
  return await response.json();
};

export const deleteEmployee = async (id) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete employee');
};

export const getOwnerIncome = async () => {
  const response = await fetch(`${API_BASE}/income`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch owner income' }));
    throw new Error(error.error || `Failed to fetch owner income: ${response.status} ${response.statusText}`);
  }
  return await response.json();
};

