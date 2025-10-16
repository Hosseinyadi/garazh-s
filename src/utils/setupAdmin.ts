// Supabase removed; admin roles are managed by backend JWT roles

/**
 * Utility function to set up admin user
 * Call this function after user signs up to make them admin
 */
export const setupAdminUser = async (_userId: string) => {
  return { success: false, error: 'Not supported. Use backend admin login.' };
};

/**
 * Check if user is admin
 */
export const checkAdminStatus = async (_userId: string) => {
  // Frontend trusts JWT role; use /auth/profile if needed
  return false;
};

/**
 * Get current user's admin status
 */
export const getCurrentUserAdminStatus = async () => {
  return false;
};

/**
 * Make current user admin (for development/testing)
 */
export const makeCurrentUserAdmin = async () => {
  return { success: false, error: 'Not supported on frontend' };
};