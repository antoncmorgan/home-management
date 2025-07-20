<template>
  <n-layout class="side-nav-layout" has-sider>
    <n-layout-sider class="side-nav" collapse-mode="width">
      <div class="icon-list">
        <SideNavIcon icon="clock" :active="active === 'calendar'" @click="goTo('calendar')" />
        <SideNavIcon icon="weather" :active="active === 'weather'" @click="goTo('weather')" />
        <SideNavIcon icon="meal" :active="active === 'meals'" @click="goTo('meals')" />
        <SideNavIcon icon="settings" :active="active === 'settings'" @click="goTo('settings')" />
      </div>
    </n-layout-sider>
  </n-layout>
</template>

<script setup>
import { NLayout, NLayoutSider } from 'naive-ui';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';
import SideNavIcon from './SideNavIcon.vue';

const router = useRouter();
const route = useRoute();

const active = computed(() => {
  if (route.name === 'calendar') return 'calendar';
  if (route.name === 'weather') return 'weather';
  if (route.name === 'meals') return 'meals';
  if (route.name === 'settings') return 'settings';
  return '';
});

function goTo(name) {
  router.push({ name });
}
</script>

<style scoped>
.side-nav-layout {
  height: 100vh;
  max-width: 4rem;
  display: flex;
}
.side-nav {
  width: 4rem !important;
  min-width: 4rem !important;
  background: #232c3b;
  height: 100vh;
}
.icon-list {
  width: 4rem !important;
  min-width: 4rem !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  height: 100%;
  margin-top: 0;
}
</style>
