
<template>
  <n-layout position="absolute">
    <NavHeader />
    <n-layout-content class="main-content">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>


<script setup>
import { NLayout, NLayoutContent } from 'naive-ui';
import NavHeader from './components/NavHeader.vue';
</script>

<style scoped>
.main-content {
  padding: 0rem;
  width: 100%;
  min-height: calc(100vh - 4rem);
}
</style>
