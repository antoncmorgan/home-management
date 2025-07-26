
<template>
  <div class="home-page-container">    
    <div class="main-content">
      <div class="calendar-section">
        <CalendarView ref="calendarRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/authStore';
import CalendarView from './CalendarView.vue';

const authStore = useAuthStore();
const isLoggedIn = ref<boolean>(false);
const calendarRef = ref();

onMounted(() => {
  isLoggedIn.value = authStore.isLoggedIn;
});
</script>

<style scoped>
.home-page-container {
  height: calc(100vh - var(--top-nav-height));
  width: 100%;
}

.home-card {
  width: 100%;
  max-width: 600px;
  text-align: center;
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
