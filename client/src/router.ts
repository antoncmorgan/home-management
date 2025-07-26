import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AuthPage from './components/AuthPage.vue';
import Home from './components/Home.vue';
import ProfilePage from './components/ProfilePage.vue';

import { useAuthStore } from './store/authStore';
import { apiGet } from './api/api';

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: AuthPage },
  {
    path: '/home', component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar', name: 'calendar', component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/weather', name: 'weather', component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/meals', name: 'meals', component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings', name: 'settings', component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile', name: 'Profile', component: ProfilePage,
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
