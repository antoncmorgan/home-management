
<template>
  <n-form @submit.prevent="onSubmit" class="login-form">
    <n-form-item label="Username" :feedback="usernameError" class="form-item">
      <n-input v-model:value="username" placeholder="Username" class="form-input" />
    </n-form-item>
    <n-form-item label="Password" :feedback="passwordError" class="form-item">
      <n-input v-model:value="password" type="password" placeholder="Password" class="form-input" />
    </n-form-item>
    <n-button :loading="loading" type="primary" block attr-type="submit">Login</n-button>
    <n-alert v-if="error" type="error" class="login-error">{{ error }}</n-alert>
  </n-form>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue';
import { NForm, NFormItem, NInput, NButton, NAlert } from 'naive-ui';
import { apiPost } from '../api/api';
import { useAuthStore } from '../store/authStore';

const emit = defineEmits<{
  (e: 'login-success'): void;
}>();
const username = ref<string>('');
const password = ref<string>('');
const loading = ref<boolean>(false);
const error = ref<string>('');

const usernameError = computed(() => !username.value ? 'Username is required' : '');
const passwordError = computed(() => !password.value ? 'Password is required' : '');

const authStore = useAuthStore();

async function onSubmit() {
  error.value = '';
  if (!username.value || !password.value) return;
  loading.value = true;
  try {
    const res = await apiPost('/api/auth/login', { username: username.value, password: password.value });
    await authStore.postLoginSetup({
      id: res.data.id,
      username: res.data.username
    });
    emit('login-success');
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped>
.login-form {
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
.login-error {
  margin-top: 0.5rem;
}
</style>
