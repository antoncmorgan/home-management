<template>
  <nav class="family-member-nav">
    <div
      v-for="member in familyMembers"
      :key="member.id"
      class="family-member-icon"
      :style="{ borderColor: member.color || '#ccc' }"
      @click="$emit('select', member)"
    >
      <img v-if="member.avatar" :src="member.avatar" :alt="member.name" />
      <span v-else>{{ member.name.charAt(0) }}</span>
    </div>
    <div class="family-member-icon add" @click="$emit('add')">
      <span>+</span>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { FamilyMember } from '../models/FamilyMember';

export default defineComponent({
  name: 'FamilyMemberNav',
  props: {
    familyMembers: {
      type: Array as PropType<FamilyMember[]>,
      required: true,
    },
  },
});
</script>

<style scoped>
.family-member-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 3.75rem;
  width: 3.75rem;
  background: #fff;
  height: calc(100vh - var(--top-nav-height));
  z-index: 10;
}
.family-member-icon {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0.625rem 0;
  border: 0.125rem solid #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  background: #f9f9f9;
  cursor: pointer;
  transition: border-color 0.2s;
}
.family-member-icon.add {
  border: 0.125rem dashed #aaa;
  color: #888;
  background: #f0f0f0;
}
.family-member-icon img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
</style>
