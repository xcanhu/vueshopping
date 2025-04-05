<template>
  <div class="user-center-container">
    <div class="user-center-header">
      <h1>个人中心</h1>
    </div>
    
    <div class="user-center-content">
      <div class="user-sidebar">
        <div class="user-info-card">
          <div class="user-avatar">
            <img :src="userStore.userInfo?.avatar || 'https://tse2-mm.cn.bing.net/th/id/OIP-C.jHUH4s7TQ48X_B-1iozuJgHaHa?rs=1&pid=ImgDetMain'" alt="用户头像">
            <div class="upload-avatar" @click="handleAvatarClick">
              <el-icon><Upload /></el-icon>
              <span>更换头像</span>
              <input
                type="file"
                ref="avatarInput"
                style="display: none"
                accept="image/*"
                @change="handleAvatarChange"
              >
            </div>
          </div>
          <h3>{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '未登录' }}</h3>
          <p class="user-id">ID: {{ userStore.userInfo?.id || '-' }}</p>
          <p class="user-since">注册时间: {{ formatDate(userStore.userInfo?.createTime) }}</p>
        </div>
        
        <div class="menu-list">
          <div 
            v-for="(menu, index) in menuList" 
            :key="index"
            class="menu-item"
            :class="{active: activeMenu === menu.key}"
            @click="activeMenu = menu.key"
          >
            <el-icon><component :is="menu.icon" /></el-icon>
            <span>{{ menu.label }}</span>
          </div>
        </div>
      </div>
      
      <div class="user-main-content">
        <!-- 个人资料 -->
        <div v-if="activeMenu === 'profile'" class="content-section">
          <h2 class="section-title">个人资料</h2>
          <el-form :model="userForm" label-width="100px" class="user-form">
            <el-form-item label="用户名">
              <el-input v-model="userForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="userForm.nickname" placeholder="请输入昵称"></el-input>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
            </el-form-item>
            <el-form-item label="当前手机号">
              <el-input :value="maskPhone(userForm.phone)" disabled></el-input>
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="userForm.gender">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
                <el-radio :label="0">保密</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="生日">
              <el-date-picker v-model="userForm.birthday" type="date" placeholder="选择日期"></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateUserInfo" :loading="updating">保存修改</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 我的订单 -->
        <div v-if="activeMenu === 'orders'" class="content-section">
          <h2 class="section-title">我的订单</h2>
          <el-tabs v-model="orderStatus">
            <el-tab-pane label="全部" name="all"></el-tab-pane>
            <el-tab-pane label="待付款" name="unpaid"></el-tab-pane>
            <el-tab-pane label="待发货" name="unshipped"></el-tab-pane>
            <el-tab-pane label="待收货" name="shipped"></el-tab-pane>
            <el-tab-pane label="已完成" name="completed"></el-tab-pane>
          </el-tabs>
          
          <div v-if="orders.length > 0" class="order-list">
            <div v-for="(order, index) in orders" :key="index" class="order-item">
              <div class="order-header">
                <div class="order-info">
                  <span class="order-id">订单号: {{ order.id }}</span>
                  <span class="order-date">下单时间: {{ formatDate(order.createTime) }}</span>
                </div>
                <div class="order-status" :class="order.status">
                  {{ getOrderStatusText(order.status) }}
                </div>
              </div>
              
              <div class="order-products">
                <div v-for="(product, pIndex) in order.products" :key="pIndex" class="order-product">
                  <img :src="product.image" :alt="product.title" class="product-image">
                  <div class="product-info">
                    <h4>{{ product.title }}</h4>
                    <p class="product-price">¥{{ product.price.toFixed(2) }} x {{ product.quantity }}</p>
                  </div>
                </div>
              </div>
              
              <div class="order-footer">
                <div class="order-total">
                  共 {{ getTotalQuantity(order) }} 件商品，总计：
                  <span class="total-price">¥{{ getTotalPrice(order).toFixed(2) }}</span>
                </div>
                <div class="order-actions">
                  <el-button size="small" v-if="order.status === 'unpaid'">去支付</el-button>
                  <el-button size="small" v-if="order.status === 'shipped'">确认收货</el-button>
                  <el-button size="small" v-if="['completed', 'shipped'].includes(order.status)">查看物流</el-button>
                  <el-button size="small">订单详情</el-button>
                </div>
              </div>
            </div>
          </div>
          
          <el-empty v-else description="暂无订单数据"></el-empty>
        </div>
        
        <!-- 收货地址 -->
        <div v-if="activeMenu === 'address'" class="content-section">
          <h2 class="section-title">收货地址</h2>
          <div class="address-list">
            <div v-for="(address, index) in addresses" :key="index" class="address-item">
              <div class="address-content">
                <div class="address-tags">
                  <el-tag v-if="address.isDefault" type="success" size="small">默认</el-tag>
                </div>
                <p>
                  <span class="contact-name">{{ address.name }}</span>
                  <span class="contact-phone">{{ address.phone }}</span>
                </p>
                <p class="address-detail">{{ address.province + address.city + address.district + address.detail }}</p>
              </div>
              <div class="address-actions">
                <el-button type="text" size="small" @click="editAddress(index)">编辑</el-button>
                <el-button type="text" size="small" @click="deleteAddress(index)">删除</el-button>
                <el-button 
                  type="text" 
                  size="small" 
                  v-if="!address.isDefault"
                  @click="setDefaultAddress(index)"
                >
                  设为默认
                </el-button>
              </div>
            </div>
            
            <div class="add-address" @click="showAddressForm = true">
              <el-icon><Plus /></el-icon>
              <span>添加新地址</span>
            </div>
          </div>
        </div>
        
        <!-- 账号安全 -->
        <div v-if="activeMenu === 'security'" class="content-section">
          <h2 class="section-title">账号安全</h2>
          <div class="security-items">
            <div class="security-item">
              <div class="security-info">
                <h3>登录密码</h3>
                <p>定期修改密码可以保护您的账号安全</p>
              </div>
              <el-button @click="showPasswordForm = true">修改</el-button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h3>绑定手机</h3>
                <p>已绑定：{{ maskPhone(userForm.phone) }}</p>
              </div>
              <el-button @click="showPhoneForm = true">修改</el-button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h3>绑定邮箱</h3>
                <p>已绑定：{{ maskEmail(userForm.email) }}</p>
              </div>
              <el-button @click="showEmailForm = true">修改</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordForm" title="修改密码" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updatePassword" :loading="passwordUpdating">确认修改</el-button>
          <el-button @click="showPasswordForm = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    
    <!-- 修改手机对话框 -->
    <el-dialog v-model="showPhoneForm" title="修改手机号" width="400px">
      <el-form :model="phoneForm" :rules="phoneRules" ref="phoneFormRef" label-width="100px">
        <el-form-item label="当前手机号">
          <el-input :value="maskPhone(userForm.phone)" disabled></el-input>
        </el-form-item>
        <el-form-item label="新手机号" prop="newPhone">
          <el-input v-model="phoneForm.newPhone" placeholder="请输入新手机号"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="verifyCode">
          <div class="verify-code-input">
            <el-input v-model="phoneForm.verifyCode" placeholder="请输入验证码"></el-input>
            <el-button :disabled="codeSending" @click="sendVerifyCode">{{ codeButtonText }}</el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updatePhone" :loading="phoneUpdating">确认修改</el-button>
          <el-button @click="showPhoneForm = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    
    <!-- 修改邮箱对话框 -->
    <el-dialog v-model="showEmailForm" title="修改邮箱" width="400px">
      <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="100px">
        <el-form-item label="当前邮箱">
          <el-input :value="maskEmail(userForm.email)" disabled></el-input>
        </el-form-item>
        <el-form-item label="新邮箱" prop="newEmail">
          <el-input v-model="emailForm.newEmail" placeholder="请输入新邮箱"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="verifyCode">
          <div class="verify-code-input">
            <el-input v-model="emailForm.verifyCode" placeholder="请输入验证码"></el-input>
            <el-button :disabled="emailCodeSending" @click="sendEmailVerifyCode">{{ emailCodeButtonText }}</el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateEmail" :loading="emailUpdating">确认修改</el-button>
          <el-button @click="showEmailForm = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    
    <!-- 添加地址对话框 -->
    <el-dialog v-model="showAddressForm" :title="editingAddressIndex === -1 ? '添加收货地址' : '编辑收货地址'" width="500px">
      <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="80px">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="所在地区" required>
          <el-select v-model="addressForm.province" placeholder="省" style="width: 120px; margin-right: 10px;">
            <el-option label="广东省" value="广东省"></el-option>
            <el-option label="北京市" value="北京市"></el-option>
            <el-option label="上海市" value="上海市"></el-option>
          </el-select>
          <el-select v-model="addressForm.city" placeholder="市" style="width: 120px; margin-right: 10px;">
            <el-option label="广州市" value="广州市"></el-option>
            <el-option label="深圳市" value="深圳市"></el-option>
            <el-option label="东莞市" value="东莞市"></el-option>
          </el-select>
          <el-select v-model="addressForm.district" placeholder="区/县">
            <el-option label="天河区" value="天河区"></el-option>
            <el-option label="海珠区" value="海珠区"></el-option>
            <el-option label="越秀区" value="越秀区"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input 
            v-model="addressForm.detail" 
            type="textarea" 
            :rows="2" 
            placeholder="请输入详细地址，如街道、门牌号等"
          ></el-input>
        </el-form-item>
        <el-form-item label="设为默认" prop="isDefault">
          <el-switch v-model="addressForm.isDefault"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveAddress">保存</el-button>
          <el-button @click="showAddressForm = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock, Document, Location, Setting, ShoppingBag, Plus, Upload } from '@element-plus/icons-vue'

// 用户状态管理
const userStore = useUserStore()

// 当前激活的菜单
const activeMenu = ref('profile')

// 菜单列表
const menuList = [
  { key: 'profile', label: '个人资料', icon: 'User' },
  { key: 'orders', label: '我的订单', icon: 'ShoppingBag' },
  { key: 'address', label: '收货地址', icon: 'Location' },
  { key: 'security', label: '账号安全', icon: 'Lock' }
]

// 用户表单数据
const userForm = reactive({
  username: userStore.userInfo?.username || '',
  nickname: userStore.userInfo?.nickname || '',
  email: userStore.userInfo?.email || '',
  phone: userStore.userInfo?.phone || '',
  gender: userStore.userInfo?.gender || 0,
  birthday: userStore.userInfo?.birthday || ''
})

// 更新状态
const updating = ref(false)

// 更新用户信息
const updateUserInfo = async () => {
  updating.value = true
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新用户信息
    userStore.setUserInfo({
      ...userStore.userInfo,
      ...userForm
    })
    
    ElMessage.success('个人资料更新成功')
  } catch (error) {
    ElMessage.error('更新失败，请稍后再试')
    console.error('更新失败:', error)
  } finally {
    updating.value = false
  }
}

// 订单相关
const orderStatus = ref('all')
const orders = ref([
  {
    id: 'ORD20230001',
    createTime: '2023-05-15T10:30:00',
    status: 'completed',
    products: [
      { id: 1, title: 'iPhone 13 Pro', price: 8999, quantity: 1, image: 'https://img.alicdn.com/imgextra/i2/4129257698/O1CN01cGe2lN26jjty4GaoS_!!4129257698.jpg_q50.jpg_.webp' },
      { id: 2, title: 'AirPods Pro', price: 1999, quantity: 1, image: 'https://img.alicdn.com/imgextra/i1/2207440821122/O1CN01NyIOKO1K9vQfVTGKJ_!!4611686018427386754-0-item_pic.jpg_.webp' }
    ]
  },
  {
    id: 'ORD20230002',
    createTime: '2023-06-20T14:20:00',
    status: 'shipped',
    products: [
      { id: 3, title: 'MacBook Pro 14英寸', price: 14999, quantity: 1, image: 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spaceblack-gallery1-202410?wid=4000&hei=3074&fmt=jpeg&qlt=90&.v=1729264981617' }
    ]
  },
  {
    id: 'ORD20230003',
    createTime: '2023-07-05T09:15:00',
    status: 'unpaid',
    products: [
      { id: 4, title: 'iPad Air', price: 4799, quantity: 1, image: 'https://gw.alicdn.com/bao/uploaded/i4/2217790232532/O1CN01e8qqwu1UZhn7A2g8t_!!2217790232532.png_.webp' },
      { id: 5, title: 'Apple Pencil', price: 999, quantity: 1, image: 'https://img.alicdn.com/imgextra/i3/133668489/O1CN01n7lnze2Ca1FM5wqFZ_!!4611686018427387529-0-item_pic.jpg_.webp' }
    ]
  }
])

// 获取订单状态文本
const getOrderStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    unpaid: '待付款',
    unshipped: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 计算订单总数量
const getTotalQuantity = (order: any) => {
  return order.products.reduce((total: number, product: any) => total + product.quantity, 0)
}

// 计算订单总价
const getTotalPrice = (order: any) => {
  return order.products.reduce((total: number, product: any) => total + product.price * product.quantity, 0)
}

// 地址相关
const addresses = ref([
  {
    name: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南路XX号XX大厦XX室',
    isDefault: true
  },
  {
    name: '李四',
    phone: '13900139000',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    detail: '天河路XX号XX大厦XX室',
    isDefault: false
  }
])

// 地址表单
const showAddressForm = ref(false)
const editingAddressIndex = ref(-1)
const addressForm = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

// 地址表单验证规则
const addressRules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ]
}

// 表单引用
const addressFormRef = ref()

// 编辑地址
const editAddress = (index: number) => {
  editingAddressIndex.value = index
  const address = addresses.value[index]
  Object.assign(addressForm, address)
  showAddressForm.value = true
}

// 删除地址
const deleteAddress = (index: number) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    addresses.value.splice(index, 1)
    ElMessage.success('地址已删除')
  }).catch(() => {})
}

// 设为默认地址
const setDefaultAddress = (index: number) => {
  addresses.value.forEach((address, i) => {
    address.isDefault = i === index
  })
  ElMessage.success('默认地址已设置')
}

// 保存地址
const saveAddress = async () => {
  if (!addressFormRef.value) return
  
  await addressFormRef.value.validate((valid: boolean) => {
    if (valid) {
      if (editingAddressIndex.value === -1) {
        // 添加新地址
        addresses.value.push({...addressForm})
        
        // 如果设为默认，更新其他地址的默认状态
        if (addressForm.isDefault) {
          addresses.value.forEach((address, index) => {
            if (index !== addresses.value.length - 1) {
              address.isDefault = false
            }
          })
        }
        
        ElMessage.success('地址添加成功')
      } else {
        // 编辑现有地址
        addresses.value[editingAddressIndex.value] = {...addressForm}
        
        // 如果设为默认，更新其他地址的默认状态
        if (addressForm.isDefault) {
          addresses.value.forEach((address, index) => {
            if (index !== editingAddressIndex.value) {
              address.isDefault = false
            }
          })
        }
        
        ElMessage.success('地址修改成功')
      }
      
      showAddressForm.value = false
      
      // 重置表单
      Object.keys(addressForm).forEach(key => {
        addressForm[key] = ''
      })
      addressForm.isDefault = false
      editingAddressIndex.value = -1
    }
  })
}

// 安全相关
const showPasswordForm = ref(false)
const showPhoneForm = ref(false)
const showEmailForm = ref(false)

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 密码表单引用
const passwordFormRef = ref()
const passwordUpdating = ref(false)

// 更新密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      passwordUpdating.value = true
      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        ElMessage.success('密码修改成功')
        showPasswordForm.value = false
        
        // 重置表单
        passwordForm.oldPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } catch (error) {
        ElMessage.error('密码修改失败，请稍后再试')
        console.error('密码修改失败:', error)
      } finally {
        passwordUpdating.value = false
      }
    }
  })
}

// 手机表单
const phoneForm = reactive({
  newPhone: '',
  verifyCode: ''
})

// 手机表单验证规则
const phoneRules = {
  newPhone: [
    { required: true, message: '请输入新手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 手机表单引用
const phoneFormRef = ref()
const phoneUpdating = ref(false)
const codeSending = ref(false)
const codeCountdown = ref(0)
const codeButtonText = computed(() => {
  return codeCountdown.value > 0 ? `${codeCountdown.value}秒后重新获取` : '获取验证码'
})

// 发送验证码
const sendVerifyCode = () => {
  if (codeSending.value) return
  if (!phoneForm.newPhone) {
    ElMessage.warning('请先输入新手机号')
    return
  }
  
  codeSending.value = true
  codeCountdown.value = 60
  
  // 模拟发送验证码
  ElMessage.success('验证码已发送')
  
  // 倒计时
  const timer = setInterval(() => {
    codeCountdown.value--
    if (codeCountdown.value <= 0) {
      clearInterval(timer)
      codeSending.value = false
    }
  }, 1000)
}

// 更新手机号
const updatePhone = async () => {
  if (!phoneFormRef.value) return
  
  await phoneFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      phoneUpdating.value = true
      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 更新手机号
        userForm.phone = phoneForm.newPhone
        
        ElMessage.success('手机号修改成功')
        showPhoneForm.value = false
        
        // 重置表单
        phoneForm.newPhone = ''
        phoneForm.verifyCode = ''
      } catch (error) {
        ElMessage.error('手机号修改失败，请稍后再试')
        console.error('手机号修改失败:', error)
      } finally {
        phoneUpdating.value = false
      }
    }
  })
}

// 邮箱表单
const emailForm = reactive({
  newEmail: '',
  verifyCode: ''
})

// 邮箱表单验证规则
const emailRules = {
  newEmail: [
    { required: true, message: '请输入新邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 邮箱表单引用
const emailFormRef = ref()
const emailUpdating = ref(false)
const emailCodeSending = ref(false)
const emailCodeCountdown = ref(0)
const emailCodeButtonText = computed(() => {
  return emailCodeCountdown.value > 0 ? `${emailCodeCountdown.value}秒后重新获取` : '获取验证码'
})

// 发送邮箱验证码
const sendEmailVerifyCode = () => {
  if (emailCodeSending.value) return
  if (!emailForm.newEmail) {
    ElMessage.warning('请先输入新邮箱')
    return
  }
  
  emailCodeSending.value = true
  emailCodeCountdown.value = 60
  
  // 模拟发送验证码
  ElMessage.success('验证码已发送到邮箱')
  
  // 倒计时
  const timer = setInterval(() => {
    emailCodeCountdown.value--
    if (emailCodeCountdown.value <= 0) {
      clearInterval(timer)
      emailCodeSending.value = false
    }
  }, 1000)
}

// 更新邮箱
const updateEmail = async () => {
  if (!emailFormRef.value) return
  
  await emailFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      emailUpdating.value = true
      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 更新邮箱
        userForm.email = emailForm.newEmail
        
        ElMessage.success('邮箱修改成功')
        showEmailForm.value = false
        
        // 重置表单
        emailForm.newEmail = ''
        emailForm.verifyCode = ''
      } catch (error) {
        ElMessage.error('邮箱修改失败，请稍后再试')
        console.error('邮箱修改失败:', error)
      } finally {
        emailUpdating.value = false
      }
    }
  })
}

// 格式化日期
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 手机号脱敏
const maskPhone = (phone: string) => {
  if (!phone) return '-'
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

// 邮箱脱敏
const maskEmail = (email: string) => {
  if (!email) return '-'
  const [username, domain] = email.split('@')
  if (username.length <= 2) return `${username.charAt(0)}****@${domain}`
  return `${username.charAt(0)}${username.charAt(1)}****@${domain}`
}

// 头像上传相关
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarUploading = ref(false)

// 点击上传头像
const handleAvatarClick = () => {
  avatarInput.value?.click()
}

// 处理头像变更
const handleAvatarChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  
  // 验证文件大小（限制为2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB')
    return
  }
  
  avatarUploading.value = true
  try {
    // 模拟上传API请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 创建临时URL预览
    const reader = new FileReader()
    reader.onload = async (e) => {
      const avatarUrl = e.target?.result as string
      
      // 更新用户信息
      userStore.setUserInfo({
        ...userStore.userInfo,
        avatar: avatarUrl
      })
      
      ElMessage.success('头像更新成功')
    }
    reader.readAsDataURL(file)
  } catch (error) {
    ElMessage.error('头像上传失败，请稍后再试')
    console.error('头像上传失败:', error)
  } finally {
    avatarUploading.value = false
    // 清空input，以便重复选择同一文件时也能触发change事件
    if (avatarInput.value) {
      avatarInput.value.value = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.user-center-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.user-center-header {
  margin-bottom: 20px;
  
  h1 {
    font-size: 24px;
    color: #333;
  }
}

.user-center-content {
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.user-sidebar {
  width: 250px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
  }
  
  .user-info-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    .user-avatar {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto 15px;
      border-radius: 50%;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .upload-avatar {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        padding: 5px 0;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      &:hover .upload-avatar {
        opacity: 1;
      }
    }
    
    h3 {
      margin: 0 0 10px;
      font-size: 18px;
    }
    
    p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }
  }
  
  .menu-list {
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    .menu-item {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      cursor: pointer;
      transition: all 0.3s;
      border-left: 3px solid transparent;
      
      .el-icon {
        margin-right: 10px;
        font-size: 18px;
      }
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      &.active {
        background-color: var(--el-color-primary-light-9);
        color: #333333;
        border-left-color: var(--el-color-primary);
      }
    }
  }
}

.user-main-content {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  .section-title {
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
}

.user-form {
  max-width: 500px;
}

.order-list {
  .order-item {
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 20px;
    overflow: hidden;
    
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background-color: #f9f9f9;
      border-bottom: 1px solid #eee;
      
      .order-info {
        .order-id {
          font-weight: bold;
          margin-right: 15px;
        }
        
        .order-date {
          color: #666;
          font-size: 14px;
        }
      }
      
      .order-status {
        font-weight: bold;
        padding: 5px 10px;
        border-radius: 4px;
        
        &.unpaid {
          color: #e6a23c;
          background-color: rgba(230, 162, 60, 0.1);
        }
        
        &.unshipped {
          color: #409eff;
          background-color: rgba(64, 158, 255, 0.1);
        }
        
        &.shipped {
          color: #67c23a;
          background-color: rgba(103, 194, 58, 0.1);
        }
        
        &.completed {
          color: #909399;
          background-color: rgba(144, 147, 153, 0.1);
        }
        
        &.cancelled {
          color: #f56c6c;
          background-color: rgba(245, 108, 108, 0.1);
        }
      }
    }
    
    .order-products {
      padding: 15px;
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      
      .order-product {
        display: flex;
        align-items: center;
        width: calc(50% - 8px);
        
        @media (max-width: 768px) {
          width: 100%;
        }
        
        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 5px;
          margin-right: 10px;
        }
        
        .product-info {
          flex: 1;
          
          h4 {
            margin: 0 0 5px;
            font-size: 14px;
          }
          
          .product-price {
            color: #666;
            font-size: 13px;
          }
        }
      }
    }
    
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background-color: #f9f9f9;
      border-top: 1px solid #eee;
      
      .order-total {
        font-size: 14px;
        
        .total-price {
          font-weight: bold;
          color: #f56c6c;
          font-size: 16px;
        }
      }
      
      .order-actions {
        display: flex;
        gap: 10px;
      }
    }
  }
}

.address-list {
  .address-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 5px;
    margin-bottom: 15px;
    
    .address-content {
      flex: 1;
      
      .address-tags {
        margin-bottom: 5px;
      }
      
      p {
        margin: 5px 0;
      }
      
      .contact-name {
        font-weight: bold;
        margin-right: 15px;
      }
      
      .contact-phone {
        color: #666;
      }
      
      .address-detail {
        color: #333;
      }
    }
    
    .address-actions {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
  }
  
  .add-address {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    border: 1px dashed #ddd;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
    
    .el-icon {
      margin-right: 5px;
    }
    
    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }
  }
}

.security-items {
  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 5px;
    margin-bottom: 15px;
    
    .security-info {
      h3 {
        margin: 0 0 5px;
        font-size: 16px;
      }
      
      p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
    }
  }
}

.verify-code-input {
  display: flex;
  gap: 10px;
}
</style>