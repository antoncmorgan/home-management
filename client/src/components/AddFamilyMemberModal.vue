<template>
  <n-modal :show="show" preset="dialog" title="Add Family Member" @mask-click="close" @close="close">
    <n-form @submit.prevent="submit" class="add-family-member-form">
      <n-form-item label="Name" required>
        <n-input v-model:value="name" required placeholder="Enter name" />
      </n-form-item>
      <n-form-item label="Avatar URL (optional)">
        <n-input v-model:value="avatarUrl" placeholder="https://..." />
      </n-form-item>
      <n-form-item label="Color (optional)">
        <input v-model="color" type="color" style="width: 2.5rem; height: 2.5rem; border: none; background: none; padding: 0;" />
      </n-form-item>
      <div class="actions">
        <n-button type="primary" attr-type="submit">Add</n-button>
        <n-button @click="close" type="default">Cancel</n-button>
      </div>
    </n-form>
  </n-modal>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { NModal, NForm, NFormItem, NInput, NButton } from 'naive-ui';

export default defineComponent({
  name: 'AddFamilyMemberModal',
  components: { NModal, NForm, NFormItem, NInput, NButton },
  props: {
    show: Boolean,
  },
  emits: ['add', 'close'],
  setup(props, { emit }) {
    const name = ref('');
    const avatarUrl = ref('');
    const color = ref('#cccccc');

    watch(() => props.show, (val) => {
      if (val) {
        name.value = '';
        avatarUrl.value = '';
        color.value = '#cccccc';
      }
    });

    function submit() {
      emit('add', { name: name.value, avatarUrl: avatarUrl.value, color: color.value });
    }
    function close() {
      emit('close');
    }
    return { name, avatarUrl, color, submit, close };
  },
});
</script>

<style scoped>
.actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.add-family-member-form {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
</style>
