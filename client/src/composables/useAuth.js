import { ref } from "vue";
import * as api from "../services/api";

/**
 * Composable for authentication state and operations
 */
export function useAuth() {
  const isAuthenticated = ref(false);
  const authLoading = ref(false);
  const authError = ref("");
  const username = ref("");

  /**
   * Login user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   */
  async function loginUser(user, password) {
    authError.value = "";
    authLoading.value = true;
    try {
      await api.login(user, password);
      isAuthenticated.value = true;
      username.value = user;
    } catch (err) {
      console.error("Login failed:", err);
      authError.value = err.message || "Login failed";
      throw err;
    } finally {
      authLoading.value = false;
    }
  }

  /**
   * Register new user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   */
  async function registerUser(user, password) {
    authError.value = "";
    authLoading.value = true;
    try {
      await api.register(user, password);
      isAuthenticated.value = true;
      username.value = user;
    } catch (err) {
      console.error("Registration failed:", err);
      authError.value = err.message || "Registration failed";
      throw err;
    } finally {
      authLoading.value = false;
    }
  }

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async function logoutUser() {
    try {
      await api.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      isAuthenticated.value = false;
      authError.value = "";
      username.value = "";
    }
  }

  /**
   * Try to restore session from existing cookies
   * @returns {Promise<boolean>} True if session restored
   */
  async function tryRestoreSession() {
    authLoading.value = true;
    try {
      // Try to fetch current user info
      const user = await api.getCurrentUser();
      if (user && user.username) {
        isAuthenticated.value = true;
        username.value = user.username;
        return true;
      }
      return false;
    } catch (err) {
      console.error("Session restore failed:", err);
      isAuthenticated.value = false;
      return false;
    } finally {
      authLoading.value = false;
    }
  }

  return {
    isAuthenticated,
    authLoading,
    authError,
    username,
    loginUser,
    registerUser,
    logoutUser,
    tryRestoreSession,
  };
}
