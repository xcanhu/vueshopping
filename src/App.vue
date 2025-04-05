<template>
  <div class="app-container">
    <el-config-provider :locale="zhCn">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { onMounted } from 'vue'
import { useThemeStore } from './stores/theme'

// 初始化主题设置
const themeStore = useThemeStore()
onMounted(() => {
  themeStore.initTheme()
})
</script>

<style lang="scss">
// 添加颜色模块导入
@use 'sass:color';
@use './assets/styles/global';


/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  font-family: var(--font-family);
  color: var(--text-color-primary);
  background-color: var(--background-color-base);
  scroll-behavior: smooth;
}

.app-container {
  height: 100vh;
  width: 100%;
}

/* Element Plus 样式覆盖 */
:deep(.el-button) {
  border-radius: var(--border-radius-medium);
  font-weight: 500;
  transition: var(--transition-base);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--box-shadow-light);
  }
  
  &.is-round {
    border-radius: 20px;
  }
}

:deep(.el-input__wrapper) {
  border-radius: var(--border-radius-medium);
  transition: var(--transition-base);
}

:deep(.el-card) {
  border-radius: var(--border-radius-medium);
  overflow: hidden;
  transition: var(--transition-base);
  border: none;
  box-shadow: var(--box-shadow-light);
  
  &:hover {
    box-shadow: var(--box-shadow-hover);
  }
}

:deep(.el-dialog) {
  border-radius: var(--border-radius-large);
  overflow: hidden;
  
  .el-dialog__header {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid var(--border-color-lighter);
  }
  
  .el-dialog__body {
    padding: 30px;
  }
  
  .el-dialog__footer {
    padding: 20px;
    border-top: 1px solid var(--border-color-lighter);
  }
}


</style>
