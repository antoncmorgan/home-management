<template>
  <div class="hourly-row">
    <div v-for="hour in hourly" :key="hour.hour" class="hourly-card">
      <div class="hourly-emoji">{{ getWeatherEmoji(hour.condition) }}</div>
      <div class="hourly-precip" v-if="getPrecipitationPercent(hour.precip)">
        {{ getPrecipitationPercent(hour.precip) }}%
      </div>
      <div class="hourly-temp">{{ hour.temp === null ? '--' : hour.temp + '°' }}</div>
      <div class="hourly-time">{{ formatHour(hour.hour) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getWeatherEmoji, formatHour, getPrecipitationPercent } from '../utils/weatherUtils';
import type { HourlyForecast } from '../models/weatherModel';

defineProps<{ hourly: HourlyForecast[] }>();
</script>

<style scoped>
.hourly-row {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  justify-content: center;
}
.hourly-card {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 1rem;
  min-width: 80px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.hourly-emoji {
  font-size: 2rem;
}
.hourly-precip {
  color: #17696b;
  font-weight: 600;
}
.hourly-temp {
  font-size: 1.2rem;
  font-weight: 500;
}
.hourly-time {
  font-size: 1rem;
  color: #888;
}
</style>
