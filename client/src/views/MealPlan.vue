<template>
  <div class="meal-plan-view-container">
    <h2>Weekly Meal Plan</h2>
    <MealPlanCalendar />
  </div>
</template>

<script setup lang="ts">
import MealPlanCalendar from '../components/MealPlanCalendar.vue';
</script>

<style scoped>
.meal-plan-view-container {
  height: calc(100vh - var(--top-nav-height));
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  z-index: 0;
  position: relative;
}
</style>
