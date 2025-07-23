<template>
  <div
    class="family-member-icon"
    :style="{ backgroundColor: member.color || '#ccc' }"
    @click="$emit('select', member)"
    style="position: relative;"
  >
    <span v-if="member.avatar">{{ member.avatar }}</span>
    <span v-else>{{ member.name.charAt(0) }}</span>
    <slot name="overlay"></slot>
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
  },
});
</script>

<style scoped>
.family-member-icon {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0.625rem 0;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  background: #ccc;
  cursor: pointer;
  transition: background-color 0.2s;
}
</style>
