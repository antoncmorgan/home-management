<template>
  <div class="weather-view-container">
    <div class="weather-bg" :style="bgStyle"></div>
    <div class="weather-location-row">
      <h2>{{ city }}{{ state ? `, ${state}` : '' }}</h2>
    </div>
    <div class="weather-emoji-bg">{{ moodEmoji }}</div>
    <HourlyForecastRow :hourly="hourlyForecast" />
    <DailyForecastRow :daily="dailyForecast" />
  </div>
</template>

<script setup lang="ts">

import HourlyForecastRow from '../components/HourlyForecastRow.vue';
import DailyForecastRow from '../components/DailyForecastRow.vue';
import type { Ref } from 'vue';
import { ref, onMounted, computed, watch } from 'vue';
import { getWeatherData } from '../api/weatherApi';
import { storeToRefs } from 'pinia';
import { useHomeStore } from '../store/homeStore';

import { moodMap } from '../utils/weatherUtils';
import type { HourlyForecast, DailyForecast } from '../models/weatherModel';

const city = ref('');
const state = ref('');
const homeStore = useHomeStore();
const { home } = storeToRefs(homeStore);
const hourlyForecast: Ref<HourlyForecast[]> = ref([]);
const dailyForecast: Ref<DailyForecast[]> = ref([]);

const loading = ref(false);
const error = ref('');


const currentHourCondition = computed(() => {
  if (!hourlyForecast.value.length) return 'Default';
  const now = new Date();
  // Find the closest hour
  const current = hourlyForecast.value.find(h => {
    const hourDate = new Date(h.hour);
    return hourDate.getHours() === now.getHours();
  });
  return current?.condition || 'Default';
});

const moodEmoji = computed(() => {
  const cond = currentHourCondition.value;
  const now = new Date();
  const hour = now.getHours();
  const isNight = hour < 6 || hour >= 19;
  for (const key in moodMap) {
    if (cond.toLowerCase().includes(key.toLowerCase())) {
      return isNight ? moodMap[key].night : moodMap[key].day;
    }
  }
  return isNight ? moodMap.Default.night : moodMap.Default.day;
});

const bgStyle = computed(() => {
  const cond = currentHourCondition.value;
  for (const key in moodMap) {
    if (cond.toLowerCase().includes(key.toLowerCase())) {
      return `background:${moodMap[key].bg};`;
    }
  }
  return `background:${moodMap.Default.bg};`;
});

async function fetchWeather() {
  loading.value = true;
  error.value = '';
  try {
    const zip = home.value?.address_zip || '90210';
    // Get weather data and points API response
    const data = await getWeatherData(zip, { days: 7, hourly: true });
    let pointsRes = null;
    if (data && (data as any)._pointsRes) {
      pointsRes = (data as any)._pointsRes;
    }
    if (!data) {
      error.value = 'Could not fetch weather data.';
      return;
    }
    // Get city/state from points API response if available
    if (pointsRes && pointsRes.data && pointsRes.data.properties) {
      city.value = pointsRes.data.properties.relativeLocation?.properties?.city || 'Unknown City';
      state.value = pointsRes.data.properties.relativeLocation?.properties?.state || 'Unknown State';
    } else {
      city.value = home.value?.address_city || 'Unknown City';
      state.value = home.value?.address_state || 'Unknown State';
    }
    // Hourly: use real hourly data if available
    if (data.hourly && Array.isArray(data.hourly)) {
      hourlyForecast.value = data.hourly;
    } else {
      // fallback
      const now = new Date();
      hourlyForecast.value = Array.from({ length: 6 }).map((_, i) => ({
        hour: new Date(now.getTime() + i * 60 * 60 * 1000).toISOString(),
        temp: data.temperature ?? null,
        precip: 0,
        condition: data.shortForecast
      }));
    }
    // Daily: use dailyPeriods from API if available
    if (data.dailyPeriods && Array.isArray(data.dailyPeriods)) {
      dailyForecast.value = data.dailyPeriods;
    } else {
      // fallback if no forecast periods
      const now = new Date();
      dailyForecast.value = [
        {
          date: now.toISOString(),
          hi: data.high ?? null,
          lo: data.low ?? null,
          precip: 0,
          condition: data.shortForecast
        }
      ];
    }
  } catch (e: any) {
    error.value = 'Failed to fetch weather data.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  // Only fetch weather when home.value is loaded
  if (home.value && home.value.address_zip) {
    fetchWeather();
  } else {
    // Watch for home.value to be set, then fetch weather
    const stop = watch(
      () => home.value?.address_zip,
      (zip) => {
        if (zip) {
          fetchWeather();
          stop(); // Stop watching after first fetch
        }
      }
    );
  }
});
</script>

<style scoped>
.weather-view-container {
  height: calc(100vh - var(--top-nav-height));
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  z-index: 0;
  position: relative;
}

.weather-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.2;
}

.weather-location-row {
  text-align: center;
}
.weather-emoji-bg {
  position: absolute;
  opacity: 0.8;
  color: rgba(0, 0, 0, 0.15);
  background-color: transparent;
  top: 3rem;
  left: 4rem;
  transform: translate(-50%, -50%);
  font-size: 24vw;
  z-index: -1;
  pointer-events: none;
  user-select: none;
  width: 1em;
  height: 1em;
  text-align: center;
}
</style>
