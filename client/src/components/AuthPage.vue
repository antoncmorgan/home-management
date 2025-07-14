
<template>
  <div class="auth-page-container">
    <n-card class="auth-card">
      <n-tabs v-model:value="tab" type="line" justify-content="space-around">
        <n-tab name="login">Login</n-tab>
        <n-tab name="register">Register</n-tab>
      </n-tabs>
      <div class="auth-form-wrapper">
        <LoginForm v-if="tab === 'login'" @login-success="onLoginSuccess" />
        <RegisterForm v-else @register-success="onRegisterSuccess" />
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';
import { useRouter } from 'vue-router';
import { NCard, NTabs, NTab } from 'naive-ui';

const tab = ref<'login' | 'register'>('login');
const router = useRouter();

function onLoginSuccess() {
  router.push('/home');
}
function onRegisterSuccess() {
  tab.value = 'login';
}
</script>

<style scoped>
.auth-page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-card {
  width: 100%;
  max-width: 400px;
}
.auth-form-wrapper {
  margin-top: 24px;
}
</style>
