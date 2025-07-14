<template>
  <div>
    <n-button v-if="isLoggedIn" type="primary" @click="connectGoogle" :loading="loading">
      Connect Google Calendar
    </n-button>
    <n-alert v-if="!isLoggedIn" type="info" style="margin-top: 1em;">Please log in to connect your Google Calendar.</n-alert>
    <n-alert v-if="error" type="error" style="margin-top: 1em;">{{ error }}</n-alert>
    <div v-if="events.length" style="margin-top: 2em;">
      <h3>Your Google Calendar Events (This Month):</h3>
      <ul>
        <li v-for="event in events" :key="event.id">
          <strong>{{ event.summary }}</strong>
          <span v-if="event.start?.dateTime"> — {{ new Date(event.start.dateTime).toLocaleString() }}</span>
          <span v-else-if="event.start?.date"> — {{ event.start.date }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiGet, apiRedirect } from '../api';
import { useMessage, NButton, NAlert } from 'naive-ui';

const loading = ref(false);
const error = ref('');
const events = ref<any[]>([]);
const isLoggedIn = ref(false);
const route = useRoute();
const router = useRouter();
const message = useMessage();

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
  } else {
    await fetchEvents();
  }
});
</script>

<style scoped>
ul {
  padding-left: 1.5em;
}
</style>