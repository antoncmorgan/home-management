import './styles/main.css';

import { createApp, h } from 'vue';
import App from './App.vue';
import router from './router';
import { NMessageProvider, NDialogProvider, NConfigProvider } from 'naive-ui';

const app = createApp({
  render: () => h(NConfigProvider, {}, {
    default: () => h(NMessageProvider, {}, {
      default: () => h(NDialogProvider, {}, {
        default: () => h(App)
      })
    })
  })
});
app.use(router);
app.mount('#app');
