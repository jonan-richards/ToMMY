import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';

import vuetify from './plugins/vuetify';
import './plugins/highlight';

import 'roboto-fontface/css/roboto/roboto-fontface.css';
import './assets/css/main.scss';
import App from './App.vue';

import { useAuthStore } from './stores/auth';

const pinia = createPinia();

const app = createApp(App)
    .use(pinia)
    .use(vuetify);

const auth = useAuthStore();
auth.initialize().then(() => app
    .use(router)
    .mount('#app'));
