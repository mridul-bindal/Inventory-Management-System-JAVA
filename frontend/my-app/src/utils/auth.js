// Utility functions for authentication

/**
 * Get current user email from localStorage
 */
export const getCurrentUserEmail = () => {
  return localStorage.getItem('userEmail');
};

/**
 * Check if current user is the owner
 */
export const isOwner = () => {
  const email = getCurrentUserEmail();
  return email && email.toLowerCase() === 'owner@gmail.com';
};

