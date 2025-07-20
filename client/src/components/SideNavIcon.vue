<template>
  <div :class="['side-nav-icon', { active }]" @click="$emit('click')">
    <component :is="iconComponent" class="icon-svg" />
  </div>
</template>

<script setup>
import { Calendar, SunLight, Cutlery, Settings } from '@iconoir/vue';

const props = defineProps({
  icon: { type: String, required: true },
  active: { type: Boolean, default: false }
});

const iconMap = {
  clock: Calendar,
  weather: SunLight,
  meal: Cutlery,
  settings: Settings
};

const iconComponent = iconMap[props.icon];
</script>

<style scoped>
.side-nav-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #2d3950;
  transition: background 0.2s;
}
.side-nav-icon.active {
  background: #3b82f6;
}
.icon-svg {
  width: 1.75rem;
  height: 1.75rem;
  color: #fff;
}
</style>
