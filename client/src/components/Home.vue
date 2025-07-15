
<template>
  <div class="home-page-container">
    <div v-if="!isLoggedIn" class="login-message">
      <n-card class="home-card">
        <h2>Welcome!</h2>
        <div class="login-register-msg">
          <p>Please log in or register to continue.</p>
        </div>
      </n-card>
    </div>
    
    <div v-if="isLoggedIn" class="main-content">
      <div class="connection-section">
        <GoogleCalendarConnect @events-updated="handleEventsUpdated" />
      </div>
      
      <div class="calendar-section">
        <CalendarView ref="calendarRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NCard } from 'naive-ui';
import GoogleCalendarConnect from './GoogleCalendarConnect.vue';
import CalendarView from './CalendarView.vue';

const isLoggedIn = ref<boolean>(false);
const calendarRef = ref();

function handleEventsUpdated() {
  // Refresh the calendar when events are updated
  if (calendarRef.value) {
    calendarRef.value.refreshEvents();
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
  width: 100%;
}

.login-message {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.home-card {
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.login-register-msg {
  margin-top: 16px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.connection-section {
  display: flex;
  justify-content: center;
}

.calendar-section {
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    padding: 0.5rem;
  }
}
</style>
