import { defineStore } from 'pinia';
import { authApi } from '../api/authApi';
import { useHomeStore } from './homeStore';

export const useAuthStore = defineStore('auth', {
    state: () => {
        const token = localStorage.getItem('accessToken') || '';
        let username = '';
        let userId: string | null = null;
        if (token) {
            try {
                // Parse JWT (assume format: header.payload.signature)
                const payload = JSON.parse(atob(token.split('.')[1]));
                username = payload.username || '';
                userId = payload.userId || payload.id || null;
            } catch {}
        }
        return {
            isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
            username,
            token,
            userId
        };
    },
    actions: {
        setUserInfo(user: { id: string, username: string, accessToken?: string }) {
            this.userId = user.id;
            this.username = user.username;
            this.isLoggedIn = true;
            localStorage.setItem('isLoggedIn', 'true');
            if (user.accessToken) {
                this.token = user.accessToken;
                localStorage.setItem('accessToken', user.accessToken);
            }
        },
        async logout() {
            try {
                await authApi.post('/api/auth/logout');
                this.username = '';
                this.isLoggedIn = false;
                localStorage.setItem('isLoggedIn', 'false');
                this.userId = null;
                this.token = '';
                localStorage.removeItem('accessToken');
                // Always clear homeStore on logout
                useHomeStore().clearHome();
            } catch { }
        },
        async postLoginSetup(userInfo: { id: string, username: string, accessToken?: string }) {
            this.setUserInfo(userInfo);
            // Populate homeStore using its own async action
            useHomeStore().populateHome();
        }
    }
});
