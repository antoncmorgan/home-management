<template>
  <n-form :model="form" @submit.prevent>
    <n-form-item label="Username">
      <n-input v-model:value="form.username" disabled />
    </n-form-item>
    <n-form-item label="Home Name">
      <n-input v-model:value="form.familyName" />
    </n-form-item>
    <n-form-item label="Primary Email">
      <n-input v-model:value="form.primaryEmail" />
    </n-form-item>
    <n-form-item label="Street Address">
      <n-input v-model:value="form.addressStreet" />
    </n-form-item>
    <div class="row-flex">
      <n-form-item label="City" class="half-width">
        <n-input v-model:value="form.addressCity" />
      </n-form-item>
      <n-form-item label="State" class="half-width">
        <StateSelect v-model="form.addressState" />
      </n-form-item>
    </div>
    <n-form-item label="Zip Code">
      <n-input v-model:value="form.addressZip" />
    </n-form-item>
    <n-form-item label="Notes">
      <n-input v-model:value="form.notes" type="textarea" />
    </n-form-item>
    <n-form-item>
      <slot name="actions" />
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
import { NForm, NFormItem, NInput } from 'naive-ui';
import StateSelect from './StateSelect.vue';
const props = defineProps<{ form: any }>();
</script>

<style scoped>
.row-flex {
  display: flex;
  gap: 1rem;
}
.half-width {
  flex: 1;
}
</style>
