
<template>
  <n-layout position="absolute">
    <n-layout-header class="main-header">
      <div class="header-title">Home Management</div>
      <n-button quaternary circle @click="toggleTheme">
        <n-icon :component="themeIcon" />
      </n-button>
    </n-layout-header>
    <n-layout-content class="main-content">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>


<script setup>
import { ref, computed } from 'vue';
import { NLayout, NLayoutHeader, NLayoutContent, NButton, NIcon, darkTheme, useOsTheme } from 'naive-ui';
import { SunnyOutline, MoonOutline } from '@vicons/ionicons5';

const osTheme = useOsTheme();
const isDark = ref(osTheme.value === 'dark');
const themeIcon = computed(() => isDark.value ? SunnyOutline : MoonOutline);
function toggleTheme() {
  isDark.value = !isDark.value;
  // Optionally, persist theme in localStorage or provide to NConfigProvider
}
</script>

<style scoped>
.main-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--n-color);
}
.header-title {
  font-size: 1.5rem;
  font-weight: bold;
}
.main-content {
  padding: 24px;
  min-height: calc(100vh - 64px);
}
</style>
