
<template>
  <n-form @submit.prevent="onSubmit" class="register-form">
    <n-form-item label="Username" :feedback="usernameError" class="form-item">
      <n-input v-model:value="username" placeholder="Username" class="form-input" />
    </n-form-item>
    <n-form-item label="Password" :feedback="passwordError" class="form-item">
      <n-input v-model:value="password" type="password" placeholder="Password" class="form-input" />
    </n-form-item>
    <n-button :loading="loading" type="primary" block attr-type="submit">Register</n-button>
    <n-alert v-if="error" type="error" class="register-error">{{ error }}</n-alert>
    <n-alert v-if="success" type="success" class="register-success">Registration successful! Please log in.</n-alert>
  </n-form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NForm, NFormItem, NInput, NButton, NAlert } from 'naive-ui';
import { apiPost } from '../api/api';

const emit = defineEmits<{
  (e: 'register-success'): void;
}>();
const username = ref<string>('');
const password = ref<string>('');
const loading = ref<boolean>(false);
const error = ref<string>('');
const success = ref<boolean>(false);

const usernameError = computed(() => !username.value ? 'Username is required' : '');
const passwordError = computed(() => !password.value ? 'Password is required' : '');

async function onSubmit() {
  error.value = '';
  success.value = false;
  if (!username.value || !password.value) return;
  loading.value = true;
  try {
    await apiPost('/api/auth/register', { username: username.value, password: password.value });
    success.value = true;
    emit('register-success');
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Registration failed';
  } finally {
    loading.value = false;
  }
}

</script>

<style scoped>
.register-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-item {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.form-input {
  width: 100%;
  min-width: 12.5rem;
  min-height: 2rem;
  box-sizing: border-box;
}
.register-error {
  margin-top: 0.5rem;
}
.register-success {
  margin-top: 0.5rem;
}
</style>
