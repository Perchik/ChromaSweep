import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/globals.css'
import { registerRules } from './core/rules/register'

registerRules()

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
