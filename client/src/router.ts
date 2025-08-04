import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AuthView from './views/Auth.vue';
import HomeView from './views/Home.vue';
import ProfileView from './views/Profile.vue';

import WeatherView from './views/Weather.vue';
import MealPlans from './views/MealPlan.vue';

import { useAuthStore } from './store/authStore';
import { apiGet } from './api/api';

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: AuthView },
  {
    path: '/home', component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar', name: 'calendar', component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/weather', name: 'weather', component: WeatherView,
    meta: { requiresAuth: true }
  },
  {
    path: '/meals', name: 'meals', component: MealPlans,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings', name: 'settings', component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile', name: 'Profile', component: ProfileView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for auth protection

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  let isAuthenticated = false;
  try {
    const res = await apiGet('/api/auth/me');
    authStore.setUserInfo({
      id: res.data.id,
      username: res.data.username
    });
    isAuthenticated = true;
  } catch (e) {
    isAuthenticated = false;
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/');
  } else if (isAuthenticated && to.path === '/') {
    next('/home');
  } else {
    next();
  }
});

export default router;
