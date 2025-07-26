import { defineStore } from 'pinia';
import { authApi } from '../api/authApi';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isLoggedIn: false,
        username: '',
        token: '',
        userId: null as string | null
    }),
    actions: {
        setUserInfo(user: { id: string, username: string }) {
            this.userId = user.id;
            this.username = user.username;
            this.isLoggedIn = true;
        },
        async logout() {
            try {
                await authApi.post('/api/auth/logout');
                this.username = '';
                this.isLoggedIn = false;
                this.userId = null;
                // Always clear homeStore on logout
                import('./homeStore').then(({ useHomeStore }) => {
                    useHomeStore().clearHome();
                });
            } catch { }
        },
        async postLoginSetup(userInfo: { id: string, username: string }) {
            this.setUserInfo(userInfo);
            // Fetch family info and populate homeStore
            if (userInfo.id) {
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
            }
        }
    }
});
