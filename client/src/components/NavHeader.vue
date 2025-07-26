<template>
    <n-layout-header class="nav-header">
        <div class="header-left">
            <div class="header-title">{{ homeName }}</div>
            <div class="header-time">{{ currentTime }}</div>
            <WeatherWidget v-if="homeZipcode" :zipcode="homeZipcode" class="header-weather" />
        </div>
        <div class="header-right">
        <div v-if="isLoggedIn" class="user-menu-wrapper">
            <n-dropdown :options="userDropdownOptions" @select="handleUserMenuSelect">
                <n-button quaternary circle class="user-btn">
                    <span class="username">{{ username }}</span>
                    <n-icon :component="UserIcon" />
                </n-button>
            </n-dropdown>
        </div>
        <n-button quaternary circle @click="toggleTheme" class="theme-toggle">
            <n-icon :component="themeIcon" />
        </n-button>
        </div>
    </n-layout-header>
</template>

<script setup lang="ts">
import WeatherWidget from './WeatherWidget.vue';
const currentTime = ref('');

function updateTime() {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

onMounted(() => {
    updateTime();
    setInterval(updateTime, 1000);
});

import { ref, computed, onMounted } from 'vue';
import { User } from '@iconoir/vue';
import { useRouter } from 'vue-router';
import { NLayoutHeader, NButton, NIcon, NDropdown } from 'naive-ui';
import { SunLight, HalfMoon } from '@iconoir/vue';
import { useOsTheme } from 'naive-ui';
import { useAuthStore } from '../store/authStore';
import { useHomeStore } from '../store/homeStore';

const router = useRouter();
const osTheme = useOsTheme();
const isDark = ref(osTheme.value === 'dark');
const authStore = useAuthStore();
const homeStore = useHomeStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
const username = computed(() => authStore.username);
const homeName = computed(() => homeStore.home.display_name || 'My Home');
const homeZipcode = computed(() => homeStore.home.address_zip || '');

const themeIcon = computed(() => isDark.value ? SunLight : HalfMoon);
const UserIcon = User;

function toggleTheme() {
    isDark.value = !isDark.value;
    // Optionally, persist theme in localStorage or provide to NConfigProvider
}

async function logout() {
    try {
        await authStore.logout();
    } catch (e) {
        // Optionally handle error (e.g., show notification)
    }
    router.push('/');
}

const userDropdownOptions = [
    { label: 'Profile', key: 'profile' },
    { label: 'Logout', key: 'logout' }
];

function handleUserMenuSelect(key: string) {
    if (key === 'profile') {
        router.push('/profile');
    } else if (key === 'logout') {
        logout();
    }
}

</script>

<style scoped>
.nav-header {
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
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

.header-time {
    font-size: 1.5rem;
    font-weight: 500;
    margin-left: 1.5rem;
    color: #606060;
    letter-spacing: 0.5px;
    min-width: 4.5rem;
}

.header-weather {
    margin-left: 1.2rem;
    display: inline-flex;
    align-items: center;
    font-size: 1.2rem;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.user-menu-wrapper {
    display: flex;
    align-items: center;
}
.user-btn {
    display: flex;
    align-items: center;
    padding: 0 1rem;
    width: auto;
}
.username {
    font-weight: 500;
    margin: 0 .5rem;
}

.logout-btn {
    margin-right: 0.5rem;
}
</style>
