
<template>
  <div class="home-page-container">
    <n-card class="home-card">
      <h2>Welcome!</h2>
      <div>
        <n-button type="primary" @click="logout" v-if="isLoggedIn" class="logout-btn">Logout</n-button>
      </div>
      <div v-if="!isLoggedIn" class="login-register-msg">
        <p>Please log in or register to continue.</p>
      </div>
      <div v-if="isLoggedIn">
        <GoogleCalendarConnect />
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import GoogleCalendarConnect from './GoogleCalendarConnect.vue';
import { NButton } from 'naive-ui';

const isLoggedIn = ref<boolean>(false);
const router = useRouter();

function logout() {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  router.push('/');
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
