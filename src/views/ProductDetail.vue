<template>
  <div class="product-detail-container" v-loading="loading">
    <div v-if="product" class="product-detail">
      <div class="product-gallery">
        <div class="main-image">
          <img :src="product.image" :alt="product.title">
          <div class="product-tags" v-if="product.isNew || product.discount">
            <span class="tag new" v-if="product.isNew">新品</span>
            <span class="tag discount" v-if="product.discount">
              {{ Math.round(product.discount * 100) }}% OFF
            </span>
          </div>
        </div>
        <div class="thumbnail-list">
          <div class="thumbnail active">
            <img :src="product.image" :alt="product.title">
          </div>
          <!-- 更多缩略图 -->
        </div>
      </div>
      
      <div class="product-info">
        <h1 class="product-title">{{ product.title }}</h1>
        
        <div class="product-meta">
          <div class="product-rating">
            <el-rate 
              v-model="product.rating.rate" 
              disabled 
              text-color="#ff9900"
              :score-template="`${product.rating.rate}分 (${product.rating.count}评)`"
              show-score
            />
          </div>
          <div class="product-category">分类：{{ product.category }}</div>
        </div>
        
        <div class="product-price">
          <div class="current-price">¥{{ product.price.toFixed(2) }}</div>
          <div class="original-price" v-if="product.discount">
            ¥{{ (product.price / (1 - product.discount)).toFixed(2) }}
          </div>
        </div>
        
        <div class="product-description">
          <h3>商品描述</h3>
          <p>{{ product.description }}</p>
        </div>
        
        <div class="product-stock">
          <span :class="['stock-status', product.stock > 0 ? 'in-stock' : 'out-of-stock']">{{ product.stock > 0 ? '有货' : '缺货' }}</span>
          <span class="stock-count" v-if="product.stock > 0">库存: {{ product.stock }}件</span>
        </div>
        
        <div class="product-quantity">
          <span class="quantity-label">数量：</span>
          <el-input-number v-model="quantity" :min="1" :max="product.stock" size="large" />
        </div>
        
        <div class="product-actions">
          <el-button type="primary" size="large" @click="handleAddToCart" :disabled="product.stock <= 0">
            <el-icon><ShoppingCart /></el-icon>
            加入购物车
          </el-button>
          <el-button type="danger" size="large" @click="handleBuyNow" :disabled="product.stock <= 0">
            立即购买
          </el-button>
        </div>
      </div>
    </div>
    
    <div v-if="product" class="product-details-tabs">
      <el-tabs>
        <el-tab-pane label="商品详情">
          <div class="product-details-content">
            <h3>商品详情</h3>
            <p>{{ product.description }}</p>
            <!-- 更多详情内容 -->
          </div>
        </el-tab-pane>
        <el-tab-pane label="规格参数">
          <div class="product-specs">
            <h3>规格参数</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="品牌">{{ product.title.split(' ')[0] }}</el-descriptions-item>
              <el-descriptions-item label="型号">{{ product.title }}</el-descriptions-item>
              <el-descriptions-item label="分类">{{ product.category }}</el-descriptions-item>
              <!-- 更多规格参数 -->
            </el-descriptions>
          </div>
        </el-tab-pane>
        <el-tab-pane label="用户评价">
          <div class="product-reviews">
            <h3>用户评价</h3>
            <div class="review-summary">
              <div class="review-average">
                <div class="average-score">{{ product.rating.rate }}</div>
                <el-rate v-model="product.rating.rate" disabled />
                <div class="review-count">{{ product.rating.count }}条评价</div>
              </div>
            </div>
            <div class="review-list">
              <div class="empty-reviews" v-if="product.rating.count === 0">
                暂无评价
              </div>
              <!-- 评价列表 -->
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <div v-if="!product && !loading" class="product-not-found">
      <el-empty description="商品不存在或已下架">
        <el-button type="primary" @click="$router.push('/products')">返回商品列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { ElMessage } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import type { Product } from '../types/product'
import axios from 'axios'

// 路由实例
const route = useRoute()
const router = useRouter()

// 状态管理
const cartStore = useCartStore()

// 商品数据
const product = ref<Product | null>(null)
const loading = ref(false)
const quantity = ref(1)

// 获取商品详情
const fetchProductDetail = async () => {
  const productId = route.params.id
  if (!productId) return
  
  loading.value = true
  try {
    
    // 模拟数据
    setTimeout(() => {
      product.value = {
        id: Number(productId),
        title: 'iPhone 13 Pro',
        price: 8999,
        description: '最新款iPhone，搭载A15仿生芯片，超强性能，出色的拍照能力，持久的电池续航。',
        category: '手机数码',
        image: 'https://img.alicdn.com/imgextra/i2/4129257698/O1CN01cGe2lN26jjty4GaoS_!!4129257698.jpg_q50.jpg_.webp',
        rating: {
          rate: 4.8,
          count: 320
        },
        stock: 100,
        isNew: true,
        discount: 0
      }
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取商品详情失败', error)
    ElMessage.error('获取商品详情失败')
    loading.value = false
  }
}

// 添加到购物车
const handleAddToCart = () => {
  if (!product.value) return
  
  cartStore.addToCart(product.value, quantity.value)
  ElMessage.success(`已将 ${quantity.value} 件商品添加到购物车`)
}

// 立即购买
const handleBuyNow = () => {
  if (!product.value) return
  
  // 添加到购物车
  cartStore.addToCart(product.value, quantity.value)
  
  // 跳转到结算页面
  router.push('/checkout')
}

// 生命周期钩子
onMounted(() => {
  fetchProductDetail()
})
</script>

<style lang="scss" scoped>
.product-detail-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.product-detail {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  background-color: #fff;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 15px;
  }
}

.product-gallery {
  flex: 1;
  max-width: 500px;
  
  .main-image {
    position: relative;
    width: 100%;
    height: 400px;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
    
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.5s;
      
      &:hover {
        transform: scale(1.05);
      }
    }
    
    .product-tags {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      z-index: 2;

      .tag {
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        color: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        animation: tagPulse 2s infinite;

        &.new {
          background-color: #67c23a;
        }

        &.discount {
          background-color: #f56c6c;
          animation-delay: 0.5s;
        }
      }
    }
  }
  
  @keyframes tagPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .thumbnail-list {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-start;
    
    .thumbnail {
      width: 80px;
      height: 80px;
      border: 1px solid #eee;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      
      &:hover {
        border-color: var(--el-color-primary);
        transform: translateY(-3px);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
        
        img {
          transform: scale(1.1);
        }
      }
      
      &.active {
        border-color: var(--el-color-primary);
        border-width: 2px;
        transform: translateY(-3px);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.product-info {
  flex: 1;
  padding: 0 10px;
  
  .product-title {
    font-size: 26px;
    margin: 0 0 15px;
    color: #333;
    font-weight: 600;
    line-height: 1.3;
    position: relative;
    padding-bottom: 12px;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      background: var(--el-color-primary);
      border-radius: 3px;
    }
  }
  
  .product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px 0;
    border-bottom: 1px dashed #eee;
    
    .product-category {
      color: #666;
      background-color: #f5f7fa;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 14px;
      transition: all 0.3s;
      
      &:hover {
        background-color: #ecf5ff;
        color: var(--el-color-primary);
      }
    }
  }
  
  .product-price {
    margin-bottom: 25px;
    display: flex;
    align-items: baseline;
    background-color: #fff9f9;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid #f56c6c;
    
    .current-price {
      font-size: 32px;
      font-weight: bold;
      color: #f56c6c;
      text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
      position: relative;
      
      &::before {
        content: '促销价';
        position: absolute;
        top: -18px;
        left: 0;
        font-size: 12px;
        color: #999;
        font-weight: normal;
      }
    }
    
    .original-price {
      font-size: 16px;
      color: #999;
      text-decoration: line-through;
      margin-left: 12px;
      position: relative;
      
      &::before {
        content: '原价';
        position: absolute;
        top: -18px;
        left: 0;
        font-size: 12px;
        color: #999;
      }
    }
  }
  
  .product-description {
    margin-bottom: 25px;
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    transition: all 0.3s;
    
    &:hover {
      background-color: #f5f5f5;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    h3 {
      font-size: 18px;
      margin-bottom: 12px;
      color: #333;
      display: flex;
      align-items: center;
      
      &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 18px;
        background-color: var(--el-color-primary);
        margin-right: 8px;
        border-radius: 2px;
      }
    }
    
    p {
      color: #666;
      line-height: 1.8;
      text-align: justify;
      font-size: 14px;
    }
  }
  
  .product-stock {
    margin-bottom: 25px;
    display: flex;
    align-items: center;
    
    .stock-status {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: bold;
      transition: all 0.3s;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      
      &.in-stock {
        background-color: #f0f9eb;
        color: #67c23a;
        border-left: 3px solid #67c23a;
      }
      
      &.out-of-stock {
        background-color: #fef0f0;
        color: #f56c6c;
        border-left: 3px solid #f56c6c;
        animation: pulse 1.5s infinite;
      }
    }
    
    .stock-count {
      margin-left: 15px;
      color: #666;
      background-color: #f5f7fa;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      transition: all 0.3s;
      
      &:hover {
        background-color: #edf2fc;
      }
    }
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.8; }
    100% { opacity: 1; }
  }
  
  .product-quantity {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    
    .quantity-label {
      margin-right: 15px;
      font-weight: 500;
      color: #333;
    }
    
    :deep(.el-input-number) {
      .el-input-number__decrease,
      .el-input-number__increase {
        background-color: #f5f5f5;
        border-color: #dcdfe6;
        transition: all 0.3s;
        
        &:hover {
          color: var(--el-color-primary);
          background-color: #ecf5ff;
        }
      }
      
      .el-input__inner {
        text-align: center;
        font-weight: bold;
      }
    }
  }
  
  .product-actions {
    display: flex;
    gap: 20px;
    margin-top: 10px;
    
    :deep(.el-button) {
      flex: 1;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }
      
      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      
      .el-icon {
        margin-right: 8px;
        font-size: 18px;
      }
    }
  }
}

.product-details-tabs {
  margin-bottom: 40px;
  background-color: #fff;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }
  
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
    border-bottom: 2px solid #f0f2f5;
    
    .el-tabs__nav-wrap::after {
      height: 2px;
      background-color: transparent;
    }
    
    .el-tabs__item {
      font-size: 16px;
      padding: 0 20px 12px;
      height: 40px;
      line-height: 40px;
      transition: all 0.3s;
      
      &.is-active {
        color: var(--el-color-primary);
        font-weight: bold;
      }
      
      &:hover {
        color: var(--el-color-primary);
      }
    }
    
    .el-tabs__active-bar {
      height: 3px;
      border-radius: 3px;
    }
  }
  
  .product-details-content,
  .product-specs,
  .product-reviews {
    padding: 20px 0;
    animation: fadeIn 0.5s ease-in-out;
    
    h3 {
      font-size: 18px;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 12px;
      color: #333;
      font-weight: 600;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 50px;
        height: 3px;
        background: var(--el-color-primary);
        border-radius: 3px;
      }
    }
  }
  
  :deep(.el-descriptions) {
    .el-descriptions__label {
      font-weight: bold;
      color: #606266;
    }
    
    .el-descriptions__content {
      color: #333;
    }
    
    .el-descriptions-item__container {
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
  
  .review-summary {
    display: flex;
    margin-bottom: 30px;
    
    .review-average {
      text-align: center;
      padding: 25px;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
      transition: all 0.3s;
      width: 200px;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
      }
      
      .average-score {
        font-size: 42px;
        font-weight: bold;
        color: #f56c6c;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        margin-bottom: 5px;
      }
      
      :deep(.el-rate) {
        margin: 10px 0;
        justify-content: center;
        
        .el-rate__icon {
          font-size: 20px;
          margin-right: 4px;
        }
      }
      
      .review-count {
        margin-top: 10px;
        color: #666;
        font-size: 14px;
        background-color: #fff;
        padding: 5px 10px;
        border-radius: 15px;
        display: inline-block;
      }
    }
  }
  
  .review-list {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .empty-reviews {
    text-align: center;
    padding: 40px 0;
    color: #909399;
    font-size: 16px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin: 20px 0;
    
    &::before {
      content: '😢';
      display: block;
      font-size: 36px;
      margin-bottom: 15px;
    }
  }
}

.product-not-found {
  padding: 80px 0;
  text-align: center;
  animation: fadeIn 0.5s ease-in-out;
  
  :deep(.el-empty) {
    padding: 40px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    max-width: 500px;
    margin: 0 auto;
    
    .el-empty__description {
      margin-top: 20px;
      font-size: 16px;
      color: #606266;
    }
    
    .el-button {
      margin-top: 20px;
      padding: 12px 25px;
      font-size: 16px;
    }
  }
}
</style>