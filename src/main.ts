import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入全局样式
import './assets/styles/global.scss'

// 创建pinia实例
const pinia = createPinia()
// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 挂载应用
app.mount('#app')