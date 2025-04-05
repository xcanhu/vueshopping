<template>
  <div class="cart-container">
    <div class="cart-header">
      <h1>我的购物车</h1>
      <el-button @click="$router.push('/products')" plain>
        <el-icon><ArrowLeft /></el-icon>
        继续购物
      </el-button>
    </div>
    
    <div class="cart-content" v-if="cartStore.cartItems.length > 0">
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
        
        <el-table-column label="数量" width="200">
          <template #default="{row}">
            <el-input-number 
              v-model="row.quantity" 
              :min="1" 
              :max="99"
              @change="(value: number) => handleQuantityChange(row.id, value)"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="小计" width="120">
          <template #default="{row}">
            <span class="subtotal">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120">
          <template #default="{row}">
            <el-button type="danger" @click="handleRemoveItem(row.id)" text>
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="cart-footer">
        <div class="cart-summary">
          <div class="summary-item">
            <span>商品总数:</span>
            <span>{{ cartStore.totalItems }}件</span>
          </div>
          <div class="summary-item">
            <span>商品总价:</span>
            <span class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="cart-actions">
          <el-button @click="handleClearCart">清空购物车</el-button>
          <el-button type="primary" @click="handleCheckout">去结算</el-button>
        </div>
      </div>
    </div>
    
    <div class="empty-cart" v-else>
      <el-empty description="购物车空空如也">
        <el-button type="primary" @click="$router.push('/products')">去购物</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../stores/cart'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ArrowLeft, Delete } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 购物车状态管理
const cartStore = useCartStore()

// 更新商品数量
const handleQuantityChange = (productId: number, quantity: number) => {
  cartStore.updateQuantity(productId, quantity)
}

// 移除商品
const handleRemoveItem = (productId: number) => {
  ElMessageBox.confirm('确定要从购物车中移除该商品吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.removeFromCart(productId)
    ElMessage.success('商品已移除')
  }).catch(() => {})
}

// 清空购物车
const handleClearCart = () => {
  if (cartStore.cartItems.length === 0) return
  
  ElMessageBox.confirm('确定要清空购物车吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.clearCart()
    ElMessage.success('购物车已清空')
  }).catch(() => {})
}

// 去结算
const handleCheckout = () => {
  router.push('/checkout')
}
</script>

<style lang="scss" scoped>
.cart-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
    
    h1 {
      font-size: 24px;
      color: #333;
    }
  }
  
  .product-info {
    display: flex;
    align-items: center;
    
    .product-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 5px;
      margin-right: 15px;
    }
    
    .product-details h3 {
      margin: 0;
      font-size: 16px;
    }
  }
  
  .price, .subtotal {
    font-weight: bold;
    color: #333;
  }
  
  .subtotal {
    color: var(--el-color-danger);
  }
  
  .cart-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    
    .cart-summary {
      .summary-item {
        display: flex;
        margin-bottom: 10px;
        
        span {
          margin-right: 10px;
          font-size: 16px;
        }
        
        .total-price {
          font-size: 20px;
          font-weight: bold;
          color: var(--el-color-danger);
        }
      }
    }
    
    .cart-actions {
      display: flex;
      gap: 10px;
    }
  }
  
  .empty-cart {
    padding: 50px 0;
  }
}
</style>