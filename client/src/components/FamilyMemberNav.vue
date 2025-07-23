<template>
  <nav class="family-member-nav">
    <FamilyMemberIcon
      v-for="member in familyMembers"
      :key="member.id"
      :member="member"
      @select="$emit('select', member)"
    />
    <div class="family-member-icon add" @click="$emit('add')">
      <span>+</span>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { FamilyMember } from '../models/FamilyMember';
import FamilyMemberIcon from './FamilyMemberIcon.vue';

export default defineComponent({
  name: 'FamilyMemberNav',
  components: {
    FamilyMemberIcon,
  },
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

.family-member-icon.add {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0.625rem 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  cursor: pointer;
  border: 0.125rem dashed #aaa;
  color: #888;
  background: #f0f0f0;
}
</style>
