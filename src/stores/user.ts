import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '../types/user'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref<UserInfo | null>(null)
  // 登录token
  const token = ref<string>('')
  
  // 设置用户信息
  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }
  
  // 设置token
  function setToken(newToken: string) {
    token.value = newToken
    // 同时存储到localStorage，确保路由守卫能够正确获取
    localStorage.setItem('token', newToken)
  }
  
  // 清除用户信息
  function clearUserInfo() {
    userInfo.value = null
    token.value = ''
    // 同时清除localStorage中的token
    localStorage.removeItem('token')
  }
  
  return {
    userInfo,
    token,
    setUserInfo,
    setToken,
    clearUserInfo
  }
}, {
  // 开启持久化
  persist: true
})