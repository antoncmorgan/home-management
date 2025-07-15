<template>
  <div class="google-calendar-connect">
    <n-button v-if="isLoggedIn" type="primary" @click="connectGoogle" :loading="loading">
      Connect Google Calendar
    </n-button>
    <n-alert v-if="!isLoggedIn" type="info">
      Please log in to connect your Google Calendar.
    </n-alert>
    <n-alert v-if="error" type="error" style="margin-top: 0.5rem;">
      {{ error }}
    </n-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiGet, apiRedirect } from '../api';
import { useMessage, NButton, NAlert, NCard, NTag } from 'naive-ui';

const loading = ref(false);
const error = ref('');
const events = ref<any[]>([]);
const isLoggedIn = ref(false);
const route = useRoute();
const router = useRouter();
const message = useMessage();

const emit = defineEmits<{
  eventsUpdated: []
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

async function fetchEvents() {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('token') ?? undefined;
    const res = await apiGet('/api/google/events/month', token);
    events.value = res.data.items || [];
    emit('eventsUpdated');
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Failed to fetch events';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  isLoggedIn.value = !!localStorage.getItem('token');
  // If redirected back from Google, the backend will have handled the callback
  if (route.query.google === 'success') {
    message.success('Google account connected!');
    await fetchEvents();
    // Clean up query param
    router.replace({ query: { ...route.query, google: undefined } });
  } else if (isLoggedIn.value) {
    await fetchEvents();
  }
});
</script>

<style scoped>
.google-calendar-connect {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>