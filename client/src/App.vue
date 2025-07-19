
<template>
  <n-layout position="absolute">
    <NavHeader />
    <n-layout-content class="app-content">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>


<script setup>
import { NLayout, NLayoutContent } from 'naive-ui';
import NavHeader from './components/NavHeader.vue';
</script>

<style scoped>
.app-content {
  padding: 0rem;
  width: 100%;
  height: calc(100vh - var(--top-nav-height));
}
</style>
