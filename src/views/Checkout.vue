<template>
  <div class="checkout-container">
    <div class="checkout-header">
      <h1>订单结算</h1>
      <el-button @click="$router.push('/cart')" plain>
        <el-icon><ArrowLeft /></el-icon>
        返回购物车
      </el-button>
    </div>
    
    <div class="checkout-content">
      <!-- 收货地址 -->
      <div class="checkout-section address-section">
        <h2 class="section-title">
          <el-icon><Location /></el-icon>
          收货地址
        </h2>
        <div class="section-content">
          <div v-if="selectedAddress" class="selected-address">
            <div class="address-info">
              <p>
                <span class="contact-name">{{ selectedAddress.name }}</span>
                <span class="contact-phone">{{ selectedAddress.phone }}</span>
              </p>
              <p class="address-detail">{{ selectedAddress.province + selectedAddress.city + selectedAddress.district + selectedAddress.detail }}</p>
            </div>
            <el-button type="text" @click="showAddressSelector = true">更换地址</el-button>
          </div>
          <div v-else class="no-address">
            <p>您还没有收货地址</p>
            <el-button type="primary" @click="showAddressForm = true">添加收货地址</el-button>
          </div>
        </div>
      </div>
      
      <!-- 支付方式 -->
      <div class="checkout-section payment-section">
        <h2 class="section-title">
          <el-icon><CreditCard /></el-icon>
          支付方式
        </h2>
        <div class="section-content">
          <el-radio-group v-model="paymentMethod">
            <el-radio label="alipay">
              <img src="" alt="" class="payment-icon">
              支付宝
            </el-radio>
            <el-radio label="wechat">
              <img src="" alt="" class="payment-icon">
              微信支付
            </el-radio>
            <el-radio label="creditcard">
              <img src="" alt="" class="payment-icon">
              银行卡
            </el-radio>
          </el-radio-group>
        </div>
      </div>
      
      <!-- 订单信息 -->
      <div class="checkout-section order-section">
        <h2 class="section-title">
          <el-icon><ShoppingBag /></el-icon>
          订单信息
        </h2>
        <div class="section-content">
          <el-table :data="cartStore.cartItems" style="width: 100%">
            <el-table-column label="商品信息" min-width="400">
              <template #default="{row}">
                <div class="product-info">
                  <img :src="row.image" :alt="row.title" class="product-image">
                  <div class="product-details">
                    <h3>{{ row.title }}</h3>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="单价" width="120">
              <template #default="{row}">
                <span class="price">¥{{ row.price.toFixed(2) }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="数量" width="120">
              <template #default="{row}">
                <span>{{ row.quantity }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="小计" width="120">
              <template #default="{row}">
                <span class="subtotal">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <!-- 订单备注 -->
      <div class="checkout-section remark-section">
        <h2 class="section-title">
          <el-icon><ChatLineRound /></el-icon>
          订单备注
        </h2>
        <div class="section-content">
          <el-input 
            v-model="orderRemark" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入订单备注，如有特殊要求请在此说明"
            maxlength="200"
            show-word-limit
          ></el-input>
        </div>
      </div>
      
      <!-- 订单金额 -->
      <div class="checkout-section total-section">
        <h2 class="section-title">
          <el-icon><Money /></el-icon>
          订单金额
        </h2>
        <div class="section-content">
          <div class="order-total">
            <div class="total-item">
              <span>商品总价：</span>
              <span>¥{{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="total-item">
              <span>运费：</span>
              <span>¥{{ shipping.toFixed(2) }}</span>
            </div>
            <div class="total-item discount" v-if="discount > 0">
              <span>优惠：</span>
              <span>-¥{{ discount.toFixed(2) }}</span>
            </div>
            <div class="total-item final-total">
              <span>应付金额：</span>
              <span class="final-price">¥{{ (cartStore.totalPrice + shipping - discount).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 提交订单 -->
      <div class="checkout-submit">
        <el-button size="large" @click="$router.push('/cart')">返回购物车</el-button>
        <el-button type="primary" size="large" @click="handleSubmitOrder" :loading="submitting">
          提交订单
        </el-button>
      </div>
    </div>
    
    <!-- 地址选择器对话框 -->
    <el-dialog v-model="showAddressSelector" title="选择收货地址" width="600px">
      <div class="address-list">
        <div 
          v-for="(address, index) in addresses" 
          :key="index"
          class="address-item"
          :class="{active: selectedAddressIndex === index}"
          @click="selectedAddressIndex = index"
        >
          <div class="address-content">
            <p>
              <span class="contact-name">{{ address.name }}</span>
              <span class="contact-phone">{{ address.phone }}</span>
            </p>
            <p class="address-detail">{{ address.province + address.city + address.district + address.detail }}</p>
          </div>
          <div class="address-actions">
            <el-button type="text" size="small" @click.stop="editAddress(index)">编辑</el-button>
            <el-button type="text" size="small" @click.stop="deleteAddress(index)">删除</el-button>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <el-button @click="showAddressSelector = false">取消</el-button>
        <el-button type="primary" @click="confirmSelectAddress">确定</el-button>
      </div>
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
      </el-form>
      <div class="dialog-footer">
        <el-button @click="showAddressForm = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Location, CreditCard, ShoppingBag, ChatLineRound, Money } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 购物车状态
const cartStore = useCartStore()

// 支付方式
const paymentMethod = ref('alipay')

// 订单备注
const orderRemark = ref('')

// 运费和折扣
const shipping = ref(10)
const discount = ref(0)

// 提交状态
const submitting = ref(false)

// 地址相关
const showAddressSelector = ref(false)
const showAddressForm = ref(false)
const selectedAddressIndex = ref(0)
const editingAddressIndex = ref(-1)

// 模拟地址数据
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

// 当前选中的地址
const selectedAddress = computed(() => {
  return addresses.value[selectedAddressIndex.value]
})

// 地址表单
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

// 确认选择地址
const confirmSelectAddress = () => {
  showAddressSelector.value = false
}

// 编辑地址
const editAddress = (index: number) => {
  editingAddressIndex.value = index
  const address = addresses.value[index]
  Object.assign(addressForm, address)
  showAddressForm.value = true
  showAddressSelector.value = false
}

// 删除地址
const deleteAddress = (index: number) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    addresses.value.splice(index, 1)
    if (selectedAddressIndex.value >= addresses.value.length) {
      selectedAddressIndex.value = addresses.value.length - 1
    }
    ElMessage.success('地址已删除')
  }).catch(() => {})
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
          selectedAddressIndex.value = addresses.value.length - 1
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
          selectedAddressIndex.value = editingAddressIndex.value
        }
        
        ElMessage.success('地址修改成功')
      }
      
      showAddressForm.value = false
      
      // 重置表单
      Object.keys(addressForm).forEach(key => {
(addressForm as any)[key] = ''
      })
      addressForm.isDefault = false
      editingAddressIndex.value = -1
    }
  })
}

// 提交订单
const handleSubmitOrder = () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  if (cartStore.cartItems.length === 0) {
    ElMessage.warning('购物车为空，无法提交订单')
    return
  }
  
  submitting.value = true
  
  // 模拟API请求
  setTimeout(() => {
    ElMessage.success('订单提交成功！')
    cartStore.clearCart()
    router.push('/')
    submitting.value = false
  }, 1500)
}
</script>

<style lang="scss" scoped>
.checkout-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h1 {
    font-size: 24px;
    color: #333;
  }
}

.checkout-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.checkout-section {
  padding: 20px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    font-size: 18px;
    margin-bottom: 15px;
    color: #333;
    
    .el-icon {
      margin-right: 8px;
      font-size: 20px;
      color: var(--el-color-primary);
    }
  }
  
  .section-content {
    padding: 0 10px;
  }
}

.selected-address {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
  
  .address-info {
    flex: 1;
    
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
}

.no-address {
  text-align: center;
  padding: 20px;
  color: #999;
  
  p {
    margin-bottom: 15px;
  }
}

.payment-section {
  .el-radio {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 5px;
    transition: all 0.3s;
    
    &.is-checked {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
    
    .payment-icon {
      margin-right: 10px;
      margin-left: 5px;
    }
  }
}

.product-info {
  display: flex;
  align-items: center;
  
  .product-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 5px;
    margin-right: 15px;
  }
  
  .product-details h3 {
    margin: 0;
    font-size: 14px;
    color: #333;
  }
}

.price, .subtotal {
  font-weight: bold;
  color: #333;
}

.subtotal {
  color: var(--el-color-danger);
}

.order-total {
  padding: 10px;
  
  .total-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 14px;
    
    &.discount {
      color: var(--el-color-success);
    }
    
    &.final-total {
      font-size: 18px;
      font-weight: bold;
      padding-top: 10px;
      margin-top: 10px;
      border-top: 1px dashed #eee;
      
      .final-price {
        color: var(--el-color-danger);
        font-size: 24px;
      }
    }
  }
}

.checkout-submit {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.address-list {
  max-height: 400px;
  overflow-y: auto;
  
  .address-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 5px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      border-color: #ddd;
      background-color: #f9f9f9;
    }
    
    &.active {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
    
    .address-content {
      flex: 1;
      
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
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}
</style>