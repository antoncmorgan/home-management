<template>
  <div class="google-calendar-connect">
    <n-button v-if="isLoggedIn && showButton" type="primary" @click="connectGoogle" :loading="loading">
      Connect Google Calendar
    </n-button>
    <n-alert v-if="error" type="error" style="margin-top: 0.5rem;">
      {{ error }}
    </n-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiGet, apiRedirect } from '../api/api';
import { useAuthStore } from '../store/authStore';
import { useMessage, NButton, NAlert } from 'naive-ui';

const loading = ref(false);
const showButton = ref(false);
const error = ref('');
const isLoggedIn = ref(false);
const isCalendarConnected = ref(false);
const route = useRoute();
const router = useRouter();
const message = useMessage();

const emit = defineEmits<{
  eventsUpdated: [],
  calendarConnected: [boolean]
}>();

function connectGoogle() {
  // Redirect to backend Google auth endpoint, passing access token as state
  const authStore = useAuthStore();
  const token = authStore.token;
  // Pass token as state param for Google OAuth
  apiRedirect(`/api/google/auth?token=${encodeURIComponent(token)}`);
}

async function checkCalendarConnection() {
  let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
  error.value = '';
  loading.value = false;
  showButton.value = false;
  try {
    loadingTimeout = setTimeout(() => {
      loading.value = true;
      showButton.value = true;
    }, 5000);
    const res = await apiGet('/api/google/calendars');
    isCalendarConnected.value = Array.isArray(res.data.items) && res.data.items.length > 0;
    emit('calendarConnected', isCalendarConnected.value);
    if (!isCalendarConnected.value) {
      showButton.value = true;
    }
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Failed to check calendar connection';
    isCalendarConnected.value = false;
    emit('calendarConnected', false);
    showButton.value = true;
  } finally {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    loading.value = false;
  }
}

onMounted(async () => {
  const authStore = useAuthStore();
  isLoggedIn.value = authStore.isLoggedIn;
  if (isLoggedIn.value) {
    await checkCalendarConnection();
  }
  // If redirected back from Google, the backend will have handled the callback
  if (route.query.google === 'success') {
    message.success('Google account connected!');
    await checkCalendarConnection();
    // Clean up query param
    router.replace({ query: { ...route.query, google: undefined } });
  }
});
</script>

<style scoped>
.google-calendar-connect {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 0.5rem;
}
</style>