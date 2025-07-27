<template>
  <div class="daily-row">
    <div v-for="day in daily" :key="day.date" class="daily-card">
      <div class="daily-emoji">{{ getWeatherEmoji(day.condition) }}</div>
      <div class="daily-precip" v-if="getPrecipitationPercent(day.precip)">
        {{ getPrecipitationPercent(day.precip) }}%
      </div>
      <div class="daily-temp">
        <span class="hi">{{ day.hi === null ? '--' : day.hi + '°' }}</span> / <span class="lo">{{ day.lo === null ? '--' : day.lo + '°' }}</span>
      </div>
      <div class="daily-date">
        {{
          (() => {
            const dayDate = new Date(day.date);
            const todayDate = new Date();
            const isToday = dayDate.toDateString() === todayDate.toDateString();
            if (isToday) {
              // If hi is not null, assume daytime (Today), else nighttime (Tonight)
              return day.hi !== null ? 'Today' : 'Tonight';
            }
            return dayDate.toLocaleDateString('en-US', { weekday: 'short' });
          })()
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getWeatherEmoji, formatDate, getPrecipitationPercent } from '../utils/weatherUtils';
import type { DailyForecast } from '../models/weatherModel';

defineProps<{ daily: DailyForecast[] }>();
</script>

<style scoped>
.daily-row {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  justify-content: center;
}
.daily-card {
  background: #eaf6fb;
  border-radius: 16px;
  padding: 1.5rem 1rem;
  min-width: 120px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
}
.daily-emoji {
  font-size: 2.5rem;
}
.daily-precip {
  color: #17696b;
  font-weight: 600;
}
.daily-temp {
  font-size: 1.3rem;
  font-weight: 500;
}
.daily-date {
  font-size: 1.1rem;
  color: #555;
}
</style>
