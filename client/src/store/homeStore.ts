import { defineStore } from 'pinia';
import type { Home } from '../models/Home';
import { useAuthStore } from './authStore';

export const useHomeStore = defineStore('home', {
    state: () => ({
        home: {} as Home
    }),
    actions: {
        setHome(newHome: Home) {
            this.home = newHome;
        },
        clearHome() {
            this.home = {} as Home;
        },
        async populateHome() {
            const authStore = useAuthStore();
            if (authStore.isLoggedIn && authStore.userId) {
                const { listFamilies } = await import('../api/familyApi');
                const families = await listFamilies();
                if (families && families.length > 0) {
                    this.setHome(families[0]);
                } else {
                    this.clearHome();
                }
            } else {
                this.clearHome();
            }
        }
    }
});
