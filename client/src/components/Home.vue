
<template>
  <div class="home-page-container">
    <n-card class="home-card">
      <h2>Welcome!</h2>
      <div>
        <n-button type="primary" @click="logout" v-if="isLoggedIn" class="logout-btn">Logout</n-button>
        <n-button type="info" @click="goToGoogleAuth" v-if="isLoggedIn">Connect Google Calendar</n-button>
      </div>
      <div v-if="!isLoggedIn" class="login-register-msg">
        <p>Please log in or register to continue.</p>
      </div>
      <div v-if="isLoggedIn">
        <n-button type="success" class="show-calendars-btn" @click="fetchCalendars">Show My Google Calendars</n-button>
        <n-list v-if="calendars.length" class="calendar-list">
          <n-list-item v-for="cal in calendars" :key="cal.id">
            {{ cal.summary }}
          </n-list-item>
        </n-list>
        <n-alert v-if="calendarError" type="error" class="calendar-error">{{ calendarError }}</n-alert>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { NButton, NList, NListItem, NAlert } from 'naive-ui';

interface Calendar {
  id: string;
  summary: string;
}

const isLoggedIn = ref<boolean>(false);
const calendars = ref<Calendar[]>([]);
const calendarError = ref<string>('');
const router = useRouter();

function logout() {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  router.push('/');
}

function goToGoogleAuth() {
  window.location.href = '/api/google/auth';
}

async function fetchCalendars() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await axios.get('/api/google/calendars', {
      headers: { Authorization: `Bearer ${token}` },
    });
    calendars.value = res.data.items;
    calendarError.value = '';
  } catch (e: any) {
    calendarError.value = e.response?.data?.message || 'Failed to load calendars';
  }
}

onMounted(() => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
});
</script>

<style scoped>
.home-page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.home-card {
  width: 100%;
  max-width: 600px;
  text-align: center;
}
.logout-btn {
  margin-bottom: 1rem;
}
.login-register-msg {
  margin-top: 16px;
}
.show-calendars-btn {
  margin-top: 1rem;
}
.calendar-list {
  margin-top: 1rem;
}
.calendar-error {
  margin-top: 0.5rem;
}
</style>
