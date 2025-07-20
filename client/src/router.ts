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

export default router;
