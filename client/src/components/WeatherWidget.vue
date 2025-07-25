<template>
  <div v-if="weather" class="weather-widget">
    <span class="weather-emoji">{{ weatherEmoji }}</span>
    <span class="weather-temp">
      <template v-if="weather.temperature !== null">{{ weather.temperature }}°F</template>
      <template v-else>--°F</template>
    </span>
    <span class="weather-hilo">
        <template v-if="weather.high !== null">{{ weather.high }}°</template>
        <template v-else>--°</template>
        /
        <template v-if="weather.low !== null">{{ weather.low }}°</template>
        <template v-else>--°</template>
    </span>
    <span class="weather-desc">{{ weather.shortForecast }}</span>
  </div>
  <div v-else class="weather-loading">Loading weather...</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { getWeatherData, getWeatherEmoji } from '../api/weatherApi';

const props = defineProps<{ zipcode: string }>();
const weather = ref<{ temperature: number | null; high: number | null; low: number | null; shortForecast: string } | null>(null);
const weatherEmoji = ref('');

async function fetchWeather(zip: string) {
  weather.value = null;
  const data = await getWeatherData(zip);
  if (!data) return;
  weather.value = data;
  weatherEmoji.value = getWeatherEmoji(data.shortForecast);
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
.weather-hilo {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin-left: 0.5rem;
    color: #888;
    font-size: 1rem;
}
.weather-loading {
  color: #888;
}
</style>
