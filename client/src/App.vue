<template>
  <IconoirProvider>
    <n-layout position="absolute" has-sider>
      <SideNav />
      <div style="flex:1; display:flex; flex-direction:column; min-width:0;">
        <NavHeader />
        <n-layout-content class="app-content">
          <router-view />
        </n-layout-content>
      </div>
    </n-layout>
  </IconoirProvider>
</template>

<script setup>
import { NLayout, NLayoutContent } from 'naive-ui';
import NavHeader from './components/NavHeader.vue';
import SideNav from './components/SideNav.vue';
import { IconoirProvider } from '@iconoir/vue';

</script>

<style scoped>
.app-content {
  padding: 0rem;
  width: 100%;
  height: calc(100vh - var(--top-nav-height));
}
</style>
