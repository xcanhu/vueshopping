import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router' // This now correctly imports the router instance

// 创建pinia实例
const pinia = createPinia()
// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

// 客户端特定引导逻辑...
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 这将假设 App.vue 模板的根元素有 `id="app"`
router.isReady().then(() => {
  app.mount('#app')
})