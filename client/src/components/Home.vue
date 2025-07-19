
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
      <div class="calendar-section">
        <CalendarView ref="calendarRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NCard } from 'naive-ui';
import CalendarView from './CalendarView.vue';

const isLoggedIn = ref<boolean>(false);
const calendarRef = ref();

onMounted(() => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
});
</script>

<style scoped>
.home-page-container {
  height: calc(100vh - var(--top-nav-height));
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
  padding: 0rem;
  width: 100%;
  margin: 0 auto;
  height: calc(100vh - var(--top-nav-height));
}

.calendar-section {
  width: 100%;
  height: calc(100vh - var(--top-nav-height));
}

</style>
