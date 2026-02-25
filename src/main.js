import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useBudgetStore } from './stores/budget'

import "./assets/styles/main.css";

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

// Initialize persisted data before mount (sync)
useBudgetStore(pinia).load()

app.mount('#app')