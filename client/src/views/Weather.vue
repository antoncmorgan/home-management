<template>
  <div class="weather-view-container">
    <div class="weather-location-row">
      <h2>{{ city }}, {{ state }}</h2>
    </div>
    <HourlyForecastRow :hourly="hourlyForecast" />
    <DailyForecastRow :daily="dailyForecast" />
  </div>
</template>

<script setup lang="ts">

import HourlyForecastRow from '../components/HourlyForecastRow.vue';
import DailyForecastRow from '../components/DailyForecastRow.vue';
import type { Ref } from 'vue';
import { ref, onMounted } from 'vue';
import { getWeatherData } from '../api/weatherApi';
import { storeToRefs } from 'pinia';
import { useHomeStore } from '../store/homeStore';
import type { HourlyForecast, DailyForecast } from '../models/weatherModel';

const city = ref('Sample City');
const state = ref('CA');
const homeStore = useHomeStore();
const { home } = storeToRefs(homeStore);
const hourlyForecast: Ref<HourlyForecast[]> = ref([]);
const dailyForecast: Ref<DailyForecast[]> = ref([]);
const loading = ref(false);
const error = ref('');

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
  fetchWeather();
});
</script>

<style scoped>
.weather-view-container {
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.weather-location-row {
  text-align: center;
}
</style>
