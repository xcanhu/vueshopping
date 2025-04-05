// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  nickname?: string
  email: string
  avatar?: string
  phone?: string
  address?: string[]
  role:  'user' | 'admin'
  createTime: string
  birthday?: string
  gender?: 'male' | 'female'
}

// 登录请求参数
export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

// 注册请求参数
export interface RegisterParams {
  username: string
  password: string
  confirmPassword: string
  email: string
  phone?: string
}

// 登录响应
export interface LoginResponse {
  token: string
  userInfo: UserInfo
}