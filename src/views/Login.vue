<template>
  <div class="login-container">
    <div class="login-box">
      <h2>用户登录</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading">登录</el-button>
          <el-button @click="$router.push('/register')">注册账号</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import type { LoginParams } from '../types/user'

// 路由实例
const router = useRouter()
const route = useRoute()

// 用户状态管理
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref()

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive<LoginParams>({
  username: '',
  password: '',
  remember: false
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true
        
        // 模拟API请求
        // 实际项目中应该调用真实的登录API
        // const { data } = await axios.post('/api/login', loginForm)
        
        // 模拟登录成功响应
        const data = {
          token: 'mock-jwt-token',
          userInfo: {
            id: 1,
            username: loginForm.username,
            nickname: '用户',
            email: 'test@example.com',
            avatar: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.jHUH4s7TQ48X_B-1iozuJgHaHa?rs=1&pid=ImgDetMain',
            role: 'user' as const,
            createTime: new Date().toISOString()
          }
        }
        
        // 存储用户信息和token
        userStore.setToken(data.token)
        userStore.setUserInfo(data.userInfo)
        
        ElMessage.success('登录成功')
        
        // 如果有重定向地址，则跳转到重定向地址
        const redirectUrl = route.query.redirect as string
        router.push(redirectUrl || '/')
      } catch (error) {
        ElMessage.error('登录失败，请检查用户名和密码')
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  
  .login-box {
    width: 400px;
    padding: 30px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: var(--el-color-primary);
    }
  }
}
</style>