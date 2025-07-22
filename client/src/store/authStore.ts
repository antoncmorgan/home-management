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
        // Fetch family info and populate homeStore
        import('../api/familyApi').then(({ listFamilies }) => {
          listFamilies().then(families => {
            import('./homeStore').then(({ useHomeStore }) => {
              if (families && families.length > 0) {
                useHomeStore().setHome(families[0]);
              } else {
                useHomeStore().clearHome();
              }
            });
          });
        });
      } else {
        this.username = '';
        import('./homeStore').then(({ useHomeStore }) => {
          useHomeStore().clearHome();
        });
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
