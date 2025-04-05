import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import { renderToString } from '@vue/server-renderer'
import App from './App.vue'
import { routes } from './router'

// 导出渲染函数
export function render(url: string, manifest: any) {
  // 创建router实例，使用内存历史记录
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })

  // 创建pinia实例
  const pinia = createPinia()

  // 创建应用实例
  const app = createApp(App)
  
  // 使用插件
  app.use(pinia)
  app.use(router)
  app.use(ElementPlus)

  // 设置服务器端路由位置
  router.push(url)
  
  // 等待路由准备就绪
  return router.isReady().then(() => {
    // 获取匹配的组件
    const matchedComponents = router.currentRoute.value.matched

    // 预加载链接
    const preloadLinks = Object.entries(manifest)
      .filter(([file]) => file.endsWith('.js') || file.endsWith('.css'))
      .map(([file]) => {
        return `<link rel="preload" href="${file}" as="${file.endsWith('.js') ? 'script' : 'style'}">`
      })
      .join('')

    return {
      html: renderToString(app),
      preloadLinks
    }
  })
}