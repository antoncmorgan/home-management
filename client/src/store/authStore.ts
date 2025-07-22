import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    username: '',
    token: ''
  }),
  actions: {
    setToken(token: string) {
      this.token = token;
      this.isLoggedIn = !!token;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.username = payload.username || payload.name || '';
        } catch {
          this.username = '';
        }
      } else {
        this.username = '';
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.setToken('');
    },
    checkAuthStatus() {
      const token = localStorage.getItem('token') || '';
      this.setToken(token);
    }
  }
});
