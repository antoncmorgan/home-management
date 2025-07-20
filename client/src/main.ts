import './styles/main.css';

import { createApp, h } from 'vue';
import App from './App.vue';
import router from './router';
import { NMessageProvider, NDialogProvider, NConfigProvider } from 'naive-ui';
import themeOverrides from './naiveThemeOverrides';
import { createPinia } from 'pinia';

const app = createApp({
  render: () => h(NConfigProvider, { themeOverrides }, {
    default: () => h(NMessageProvider, {}, {
      default: () => h(NDialogProvider, {}, {
        default: () => h(App)
      })
    })
  })
});
app.use(createPinia());
app.use(router);
app.mount('#app');
