import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 预设主题色列表
  const presetThemes = [
    { name: '默认蓝', color: '#3b82f6' },
    { name: '活力红', color: '#ef4444' },
    { name: '清新绿', color: '#10b981' },
    { name: '优雅紫', color: '#8b5cf6' },
    { name: '明亮橙', color: '#f59e0b' }
  ]
  
  // 主题色
  const themeColor = ref('#3b82f6')
  // 暗黑模式状态
  const darkMode = ref(false)
  
  // 设置主题色
  function setThemeColor(color: string) {
    themeColor.value = color
    // 更新CSS变量
    updateThemeColor(color)
  }
  
  // 切换暗黑模式
  function toggleDarkMode(value: boolean) {
    darkMode.value = value
    // 更新暗黑模式类
    if (value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  // 更新CSS变量
  function updateThemeColor(color: string) {
    // 设置主色调
    document.documentElement.style.setProperty('--primary-color', color)
    // 设置Element Plus主色调
    document.documentElement.style.setProperty('--el-color-primary', color)
    
    // 生成主色调的亮色和暗色变体
    const lightenColor = lightenDarkenColor(color, 40)
    const darkenColor = lightenDarkenColor(color, -20)
    
    // 设置亮色和暗色变体
    document.documentElement.style.setProperty('--primary-color-light', lightenColor)
    document.documentElement.style.setProperty('--primary-color-dark', darkenColor)
    
    // 设置Element Plus的色彩变量
    for (let i = 1; i <= 9; i++) {
      const lightColor = lightenDarkenColor(color, 5 * (10 - i))
      document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, lightColor)
    }
    document.documentElement.style.setProperty('--el-color-primary-dark-2', darkenColor)
  }
  
  // 初始化主题
  function initTheme() {
    // 应用存储的主题色
    updateThemeColor(themeColor.value)
    // 应用存储的暗黑模式设置
    toggleDarkMode(darkMode.value)
  }
  
  // 辅助函数：调整颜色的明暗度
  function lightenDarkenColor(color: string, amount: number): string {
    let usePound = false
  
    if (color[0] === '#') {
      color = color.slice(1)
      usePound = true
    }
  
    const num = parseInt(color, 16)
    let r = (num >> 16) + amount
    let g = ((num >> 8) & 0x00FF) + amount
    let b = (num & 0x0000FF) + amount
  
    r = Math.min(Math.max(0, r), 255)
    g = Math.min(Math.max(0, g), 255)
    b = Math.min(Math.max(0, b), 255)
  
    return (usePound ? '#' : '') + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
  }
  
  return {
    presetThemes,
    themeColor,
    darkMode,
    setThemeColor,
    toggleDarkMode,
    updateThemeColor,
    initTheme
  }
}, {
  // 开启持久化
  persist: true
})