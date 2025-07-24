<template>
  <div v-if="weather" class="weather-widget">
    <span class="weather-emoji">{{ weatherEmoji }}</span>
    <span class="weather-temp">{{ weather.temperature }}°F</span>
    <span class="weather-desc">{{ weather.shortForecast }}</span>
  </div>
  <div v-else class="weather-loading">Loading weather...</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { getLatLonFromZip, getNWSForecastUrl, getCurrentWeather, getWeatherEmoji } from '../api/weatherApi';

const props = defineProps<{ zipcode: string }>();
const weather = ref<{ temperature: number; shortForecast: string } | null>(null);
const weatherEmoji = ref('');

async function fetchWeather(zip: string) {
  weather.value = null;
  const latlon = await getLatLonFromZip(zip);
  if (!latlon) {
    return;
  }
  const forecastUrl = await getNWSForecastUrl(latlon.lat, latlon.lon);
  if (!forecastUrl) {
    return;
  }
  const result = await getCurrentWeather(forecastUrl);
  if (result) {
    weather.value = result;
    weatherEmoji.value = getWeatherEmoji(result.shortForecast);
  }
}

let intervalId: number | undefined;

onMounted(() => {
  if (props.zipcode) {
    fetchWeather(props.zipcode);
  }
  intervalId = window.setInterval(() => {
    if (props.zipcode) {
      fetchWeather(props.zipcode);
    }
  }, 600000); // 10 minutes
});

watch(() => props.zipcode, (newZip) => {
  if (newZip) {
    fetchWeather(newZip);
  }
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.weather-widget {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}
.weather-emoji {
  font-size: 2rem;
}
.weather-temp {
  font-weight: bold;
}
.weather-desc {
  color: #555;
}
.weather-loading {
  color: #888;
}
</style>
