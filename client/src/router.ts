import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AuthPage from './components/AuthPage.vue';
import Home from './components/Home.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: AuthPage },
  { path: '/home', component: Home },
  { path: '/calendar', name: 'calendar', component: Home },
  { path: '/weather', name: 'weather', component: Home },
  { path: '/meals', name: 'meals', component: Home },
  { path: '/settings', name: 'settings', component: Home },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for auth protection
router.beforeEach((to, from, next) => {
  const publicPaths = ['/'];
  const token = localStorage.getItem('token');
  const isPublic = publicPaths.includes(to.path);

  if (!isPublic && !token) {
    // Not logged in, redirect to login
    next({ path: '/', query: { redirect: to.fullPath } });
  } else if (isPublic && token) {
    // Already logged in, redirect to home
    next({ path: '/home' });
  } else {
    next();
  }
});

export default router;
