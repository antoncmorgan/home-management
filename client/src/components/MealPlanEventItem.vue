<template>
  <div class="event-item" :style="{ backgroundColor: bgColor }">
    <div class="event-row">
      <div class="event-circle" :style="{ backgroundColor: color }">
        <span class="event-initial">{{ memberInitial }}</span>
      </div>
      <div class="event-title">{{ title }}</div>
    </div>
    <div class="event-content">
      <div v-if="itemsToPack && itemsToPack.length" class="event-items-chips">
        <span class="event-items-title">Pack:</span>
        <div class="event-chips-list">
          <span v-for="item in itemsToPack" :key="item" class="event-chip">{{ item }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{
  title: string;
  color: string;
  memberName?: string;
  itemsToPack?: string[];
}>();
const memberInitial = computed(() => props.memberName ? props.memberName.charAt(0).toUpperCase() : '');
const bgColor = computed(() => {
  // Use color with 0.2 opacity
  if (!props.color) return 'rgba(0,0,0,0.05)';
  // Convert hex to rgba
  const hex = props.color.replace('#', '');
  if (hex.length === 3) {
    const r = parseInt(hex[0]+hex[0], 16);
    const g = parseInt(hex[1]+hex[1], 16);
    const b = parseInt(hex[2]+hex[2], 16);
    return `rgba(${r},${g},${b},0.2)`;
  } else if (hex.length === 6) {
    const r = parseInt(hex.substring(0,2), 16);
    const g = parseInt(hex.substring(2,4), 16);
    const b = parseInt(hex.substring(4,6), 16);
    return `rgba(${r},${g},${b},0.2)`;
  }
  return props.color;
});
</script>

<style scoped>
.event-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
}
.event-row {
  display: flex;
  align-items: center;
  width: 100%;
}
.event-circle {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.1rem;
  margin-right: 0.7rem;
}
.event-initial {
  font-size: 1.1rem;
}
.event-title {
  font-weight: 400;
  font-size: .8rem;
  margin-bottom: 0;
}
.event-content {
  width: 100%;
}
.event-items-chips {
  display: flex;
  flex-direction: row;
  gap: 0.3rem;
  margin: 0.3rem 0;
}
.event-items-title {
  font-size: 0.7rem;
  color: #333;
  font-weight: 500;
  margin-right: 0.3rem;
}
.event-chips-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.event-chip {
  display: inline-block;
  background: #e0e0e0;
  color: #333;
  border-radius: 1rem;
  padding: 0.15rem 0.7rem;
  font-size: 0.7rem;
  font-weight: 400;
}
</style>
