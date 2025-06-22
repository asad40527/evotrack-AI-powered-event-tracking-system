// src/js/services/UserService.js
export class UserService {
  static BASE_ENDPOINT = 'users';

  /**
   * Get current authenticated user
   * @returns {Promise<Object|null>} User object or null if not authenticated
   */
  static async getCurrentUser() {
    try {
      const response = await fetch(`${ApiService.BASE_URL}/${this.BASE_ENDPOINT}/me`, {
        credentials: 'include' // For session/cookie auth
      });

      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   * @param {string} userId 
   * @returns {Promise<Object>} User data
   */
  static async getUserById(userId) {
    return ApiService._fetch(`${this.BASE_ENDPOINT}/${userId}`);
  }

  /**
   * Get user preferences
   * @param {string} userId 
   * @returns {Promise<Object>} User preferences
   */
  static async getUserPreferences(userId) {
    return ApiService._fetch(`${this.BASE_ENDPOINT}/${userId}/preferences`);
  }

  /**
   * Update user preferences
   * @param {string} userId 
   * @param {Object} preferences 
   * @returns {Promise<Object>} Updated preferences
   */
  static async updatePreferences(userId, preferences) {
    return ApiService._fetch(`${this.BASE_ENDPOINT}/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }

  /**
   * Get user activity history
   * @param {string} userId 
   * @param {Object} [options] { limit, offset }
   * @returns {Promise<Array>} Activity history
   */
  static async getActivityHistory(userId, options = {}) {
    const params = new URLSearchParams(options);
    return ApiService._fetch(`${this.BASE_ENDPOINT}/${userId}/activity?${params}`);
  }

  /**
   * Get user's chat history
   * @param {string} userId 
   * @returns {Promise<Array>} Chat history
   */
  static async getChatHistory(userId) {
    return ApiService._fetch(`chat/history/${userId}`);
  }

  /**
   * Verify user authentication status
   * @returns {Promise<boolean>} True if authenticated
   */
  static async isAuthenticated() {
    const user = await this.getCurrentUser();
    return !!user;
  }

  /**
   * Get user role/permissions
   * @param {string} userId 
   * @returns {Promise<string>} User role
   */
  static async getUserRole(userId) {
    const user = await this.getUserById(userId);
    return user?.role || 'guest';
  }
}

// Optional: Add session management utilities
export class SessionService {
  static async login(credentials) {
    return ApiService._fetch('auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  static async logout() {
    return ApiService._fetch('auth/logout', {
      method: 'POST'
    });
  }

  static async refreshToken() {
    return ApiService._fetch('auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
  }
}