<template>
  <n-layout-header class="nav-header">
    <div class="header-left">
      <div class="header-title">Home Management</div>
    </div>
    <div class="header-right">
      <n-button 
        v-if="isLoggedIn" 
        type="primary" 
        @click="logout" 
        class="logout-btn"
        size="medium"
      >
        Logout
      </n-button>
      <n-button quaternary circle @click="toggleTheme" class="theme-toggle">
        <n-icon :component="themeIcon" />
      </n-button>
    </div>
  </n-layout-header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NLayoutHeader, NButton, NIcon } from 'naive-ui';
import { SunnyOutline, MoonOutline } from '@vicons/ionicons5';
import { useOsTheme } from 'naive-ui';

const router = useRouter();
const osTheme = useOsTheme();
const isDark = ref(osTheme.value === 'dark');
const isLoggedIn = ref<boolean>(false);

const themeIcon = computed(() => isDark.value ? SunnyOutline : MoonOutline);

function toggleTheme() {
  isDark.value = !isDark.value;
  // Optionally, persist theme in localStorage or provide to NConfigProvider
}

function logout() {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  router.push('/');
}

function checkAuthStatus() {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
}

onMounted(() => {
  checkAuthStatus();
  // Listen for storage changes to update auth status
  window.addEventListener('storage', checkAuthStatus);
});

// Expose a method to update auth status from other components
defineExpose({
  checkAuthStatus
});
</script>

<style scoped>
.nav-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--n-color);
  border-bottom: 1px solid var(--n-border-color);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logout-btn {
  margin-right: 8px;
}
</style>
