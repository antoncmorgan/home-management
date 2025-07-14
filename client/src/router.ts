import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AuthPage from './components/AuthPage.vue';
import Home from './components/Home.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: AuthPage },
  { path: '/home', component: Home },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
