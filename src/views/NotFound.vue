<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <div class="error-divider"></div>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被删除</p>
      <el-button type="primary" @click="$router.push('/')">
        <el-icon><HomeFilled /></el-icon>
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HomeFilled } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  
  .not-found-content {
    text-align: center;
    padding: 50px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 100%;
    animation: fadeIn 0.5s ease-in-out;
    
    h1 {
      font-size: 120px;
      color: var(--el-color-primary);
      margin: 0;
      line-height: 1;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .error-divider {
      height: 4px;
      width: 60px;
      background: var(--el-color-primary);
      margin: 20px auto;
      border-radius: 2px;
    }
    
    h2 {
      font-size: 28px;
      color: #333;
      margin: 0 0 15px;
    }
    
    p {
      margin: 0 0 30px;
      font-size: 16px;
      color: #666;
      line-height: 1.6;
    }
    
    .el-button {
      padding: 12px 24px;
      font-size: 16px;
      
      .el-icon {
        margin-right: 8px;
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>