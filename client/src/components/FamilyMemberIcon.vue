<template>
  <div class="family-member-icon-wrapper">
    <div
      class="family-member-icon"
      :class="{ selected }"
      :style="{ backgroundColor: member.color || '#ccc' }"
      @click="$emit('select', member)"
      style="position: relative;"
    >
      <span v-if="member.avatar">{{ member.avatar }}</span>
      <span v-else>{{ member.name.charAt(0) }}</span>
      <slot name="overlay"></slot>
    </div>
    <div v-if="showFooter" class="member-footer">{{ member.name }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { FamilyMember } from '../models/FamilyMember';

export default defineComponent({
  name: 'FamilyMemberIcon',
  props: {
    member: {
      type: Object as PropType<FamilyMember>,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    showFooter: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style scoped>
.family-member-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.family-member-icon {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0.625rem 0 0 0;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  background: #ccc;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 0 0 2px transparent;
}
.family-member-icon.selected {
  box-shadow: 0 0 0 2px #18a058;
  background: #f6ffed;
}
.member-footer {
  text-align: center;
  font-size: 0.9rem;
  color: #333;
  margin-top: 0.25rem;
}
</style>
