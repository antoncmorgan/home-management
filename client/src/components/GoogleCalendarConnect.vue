<template>
  <div class="google-calendar-connect">
    <n-button v-if="isLoggedIn && !isCalendarConnected" type="primary" @click="connectGoogle" :loading="loading">
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
import { useMessage, NButton, NAlert } from 'naive-ui';

const loading = ref(false);
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
  // Redirect to backend Google auth endpoint with JWT as query param
  const token = localStorage.getItem('token');
  if (token) {
    apiRedirect(`/api/google/auth?token=${encodeURIComponent(token)}`);
  } else {
    apiRedirect('/api/google/auth');
  }
}

async function checkCalendarConnection() {
  loading.value = true;
  error.value = '';
  try {
    const res = await apiGet('/api/google/calendars');
    // If calendars are returned, consider Google Calendar connected
    isCalendarConnected.value = Array.isArray(res.data.items) && res.data.items.length > 0;
    emit('calendarConnected', isCalendarConnected.value);
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Failed to check calendar connection';
    isCalendarConnected.value = false;
    emit('calendarConnected', false);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  isLoggedIn.value = !!localStorage.getItem('token');
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