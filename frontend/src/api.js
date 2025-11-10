// Module API pour communiquer avec le backend
const API_BASE = '';

class API {
  static async request(endpoint, options = {}) {
    try {
      const response = await fetch(API_BASE + endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Erreur HTTP: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentification
  static async login(email, password) {
    return await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  static async register(email, password, name) {
    return await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
  }

  static async logout() {
    return await this.request('/api/auth/logout', { method: 'POST' });
  }

  static async me() {
    return await this.request('/api/auth/me');
  }

  // Arbres décisionnels
  static async getTrees() {
    return await this.request('/api/trees');
  }

  static async getTree(id) {
    return await this.request(`/api/trees/${id}`);
  }

  static async createTree(treeData) {
    return await this.request('/api/trees', {
      method: 'POST',
      body: JSON.stringify(treeData)
    });
  }

  static async updateTree(id, treeData) {
    return await this.request(`/api/trees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(treeData)
    });
  }

  static async deleteTree(id) {
    return await this.request(`/api/trees/${id}`, {
      method: 'DELETE'
    });
  }

  // Tests orthopédiques
  static async getTests(region = null) {
    const query = region ? `?region=${encodeURIComponent(region)}` : '';
    return await this.request(`/api/tests${query}`);
  }

  static async getTest(id) {
    return await this.request(`/api/tests/${id}`);
  }

  static async createTest(testData) {
    return await this.request('/api/tests', {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  }

  static async updateTest(id, testData) {
    return await this.request(`/api/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(testData)
    });
  }

  static async deleteTest(id) {
    return await this.request(`/api/tests/${id}`, {
      method: 'DELETE'
    });
  }

  // Diagnostics
  static async saveDiagnostic(data) {
    return await this.request('/api/diagnostics', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async getDiagnostics() {
    return await this.request('/api/diagnostics');
  }

  static downloadPdf(id) {
    // Utiliser le chemin complet avec le proxy
    const url = `/api/diagnostics/${id}/pdf`;
    window.open(url, '_blank');
  }

  // Utilisateurs (admin)
  static async getUsers() {
    return await this.request('/api/users');
  }

  static async createUser(userData) {
    return await this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  static async updateUser(id, userData) {
    return await this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  static async updatePassword(userId, currentPassword, newPassword) {
    return await this.request(`/api/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  static async deleteUser(id) {
    return await this.request(`/api/users/${id}`, { method: 'DELETE' });
  }

  // Statistiques
  static async getStats() {
    return await this.request('/api/stats');
  }

  // Paramètres
  static async getSetting(key) {
    return await this.request(`/api/settings/${key}`);
  }

  static async setSetting(key, value) {
    return await this.request(`/api/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    });
  }
}

export default API;
