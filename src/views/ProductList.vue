<template>
  <div class="product-list-container">
    <!-- 商品列表头部 -->
    <div class="product-list-header">
      <div class="header-left">
        <h1>商品列表</h1>
        <el-button type="primary" class="back-home-btn" @click="$router.push('/')">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
      </div>
      <div class="search-box">
        <el-input
          v-model="searchText"
          placeholder="搜索商品"
          clearable
          :prefix-icon="Search"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 筛选器 -->
    <div class="filter-container">
      <div class="filter-section">
        <span class="filter-label">分类：</span>
        <div class="filter-options">
          <el-radio-group v-model="category" @change="handleFilterChange">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button v-for="cat in categories" :key="cat.name" :label="cat.name">
              {{ cat.name }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>
      
      <div class="filter-section">
        <span class="filter-label">标签：</span>
        <div class="filter-options">
          <el-tag 
            v-for="tag in tags" 
            :key="tag"
            :type="selectedTag === tag ? 'primary' : 'info'"
            effect="plain"
            class="filter-tag"
            @click="handleTagSelect(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      
      <div class="filter-section">
        <span class="filter-label">排序：</span>
        <div class="filter-options">
          <el-select v-model="sortBy" placeholder="排序方式" @change="handleFilterChange">
            <el-option label="默认排序" value="default" />
            <el-option label="价格从低到高" value="price-asc" />
            <el-option label="价格从高到低" value="price-desc" />
            <el-option label="评分从高到低" value="rating-desc" />
            <el-option label="最新上架" value="newest" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="product-list">
      <el-empty v-if="!loading && filteredProducts.length === 0" description="暂无商品" />
      
      <el-skeleton :loading="loading" animated :count="4" :throttle="500">
        <template #template>
          <div class="skeleton-list">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="i in 8" :key="i">
                <div class="skeleton-card">
                  <el-skeleton-item variant="image" style="height: 200px" />
                  <div style="padding: 14px">
                    <el-skeleton-item variant="h3" style="width: 80%" />
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px">
                      <el-skeleton-item variant="text" style="width: 30%" />
                      <el-skeleton-item variant="text" style="width: 45%" />
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
        
        <template #default>
          <el-row :gutter="20" class="product-row">
            <el-col 
              :xs="24" 
              :sm="12" 
              :md="8" 
              :lg="6" 
              v-for="product in filteredProducts" 
              :key="product.id"
              class="product-col"
            >
              <div class="product-card" @click="$router.push(`/product/${product.id}`)">
                <div class="product-image">
                  <img :src="product.image" :alt="product.title">
                  <div class="product-tags">
                    <span class="tag new" v-if="product.isNew">新品</span>
                    <span class="tag discount" v-if="product.discount">
                      {{ Math.round(product.discount * 100) }}% OFF
                    </span>
                    <span class="tag stock" v-if="product.stock <= 10">库存紧张</span>
                  </div>
                </div>
                <div class="product-info">
                  <h3 class="product-title">{{ product.title }}</h3>
                  <div class="product-category">{{ product.category }}</div>
                  <div class="product-price">
                    <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
                    <span class="original-price" v-if="product.discount">
                      ¥{{ (product.price / (1 - product.discount)).toFixed(2) }}
                    </span>
                  </div>
                  <div class="product-rating">
                    <el-rate 
                      v-model="product.rating.rate" 
                      disabled 
                      text-color="#ff9900"
                      :score-template="`${product.rating.rate}分 (${product.rating.count}评)`"
                      show-score
                    />
                  </div>
                  <div class="product-tags-list" v-if="product.tags && product.tags.length">
                    <el-tag v-for="tag in product.tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
                  </div>
                </div>
                <div class="product-actions">
                  <el-button type="primary" @click.stop="handleAddToCart(product)">
                    <el-icon><ShoppingCart /></el-icon>
                    加入购物车
                  </el-button>
                  <el-button type="default" @click.stop="handleQuickView(product)">
                    <el-icon><View /></el-icon>
                    快速查看
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </template>
      </el-skeleton>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="totalPages > 1">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-sizes="[12, 24, 36, 48]"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
    
    <!-- 快速查看弹窗 -->
    <el-dialog
      v-model="quickViewVisible"
      title="商品详情"
      width="50%"
      destroy-on-close
    >
      <div class="quick-view-content" v-if="selectedProduct">
        <div class="quick-view-image">
          <img :src="selectedProduct.image" :alt="selectedProduct.title">
        </div>
        <div class="quick-view-info">
          <h2>{{ selectedProduct.title }}</h2>
          <div class="quick-view-price">
            <span class="current-price">¥{{ selectedProduct.price.toFixed(2) }}</span>
            <span class="original-price" v-if="selectedProduct.discount">
              ¥{{ (selectedProduct.price / (1 - selectedProduct.discount)).toFixed(2) }}
            </span>
          </div>
          <div class="quick-view-rating">
            <el-rate 
              v-model="selectedProduct.rating.rate" 
              disabled 
              text-color="#ff9900"
              :score-template="`${selectedProduct.rating.rate}分 (${selectedProduct.rating.count}评)`"
              show-score
            />
          </div>
          <div class="quick-view-description">
            {{ selectedProduct.description }}
          </div>
          <div class="quick-view-stock">
            库存: {{ selectedProduct.stock }} 件
          </div>
          <div class="quick-view-actions">
            <el-input-number v-model="quickViewQuantity" :min="1" :max="selectedProduct.stock" />
            <el-button type="primary" @click="handleAddToCartFromQuickView">
              <el-icon><ShoppingCart /></el-icon>
              加入购物车
            </el-button>
            <el-button type="success" @click="$router.push(`/product/${selectedProduct.id}`)">
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Search, View, ArrowLeft } from '@element-plus/icons-vue'
import type { Product } from '../types/product'
import axios from 'axios'

// 路由实例
const route = useRoute()
const router = useRouter()

// 状态管理
const cartStore = useCartStore()

// 商品列表数据
const products = ref<Product[]>([])
const loading = ref(false)
const total = ref(0)
const pageSize = ref(12)
const currentPage = ref(1)
const totalPages = ref(1)

// 搜索相关
const searchText = ref('')

// 筛选和排序
const sortBy = ref('default')
const category = ref('')

// 在组件挂载时获取URL参数
onMounted(() => {
  const categoryId = route.query.category
  if (categoryId) {
    // 根据categoryId找到对应的分类名称
    const categoryMap: Record<number, string> = {
      1: '手机数码',
      2: '电脑办公',
      3: '家用电器',
      4: '服装鞋包',
      5: '美妆护肤',
      6: '食品生鲜',
      7: '图书音像',
      8: '运动户外'
    }
    category.value = categoryMap[Number(categoryId)] || ''
  }
})

const categories = ref([
  { name: '手机数码' },
  { name: '电脑办公' },
  { name: '家用电器' },
  { name: '服装鞋包' },
  { name: '美妆护肤' },
  { name: '食品生鲜' },
  { name: '图书音像' },
  { name: '运动户外' }
])

// 标签筛选
const tags = ref(['新品', '热卖', '促销', '限量版', '高端'])
const selectedTag = ref('')

// 快速查看
const quickViewVisible = ref(false)
const selectedProduct = ref<Product | null>(null)
const quickViewQuantity = ref(1)

// 根据筛选条件过滤商品
const filteredProducts = computed(() => {
  // 确保products.value是数组，如果不是则返回空数组
  if (!Array.isArray(products.value)) {
    return []
  }
  
  let result = [...products.value]
  
  // 按分类筛选
  if (category.value) {
    result = result.filter(p => p.category === category.value)
  }
  
  // 按标签筛选
  if (selectedTag.value) {
    result = result.filter(p => p.tags && p.tags.includes(selectedTag.value))
  }
  
  // 按搜索关键词筛选
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(p => 
      p.title.toLowerCase().includes(keyword) || 
      p.description.toLowerCase().includes(keyword) ||
      p.category.toLowerCase().includes(keyword)
    )
  }
  
  // 排序
  if (sortBy.value === 'price-asc') {
    result.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    result.sort((a, b) => b.price - a.price)
  } else if (sortBy.value === 'rating-desc') {
    result.sort((a, b) => b.rating.rate - a.rating.rate)
  } else if (sortBy.value === 'newest') {
    result = result.filter(p => p.isNew).concat(result.filter(p => !p.isNew))
  }
  
  return result
})

// 获取商品列表数据
const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/products', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        category: category.value,
        search: searchText.value || route.query.search,
        tag: selectedTag.value || route.query.tag,
        sort: sortBy.value
      }
    })
    products.value = response.data.products || []
    total.value = response.data.total
    totalPages.value = response.data.totalPages
    
    // 为商品添加标签（模拟数据）
    products.value.forEach(product => {
      if (!product.tags) {
        product.tags = []
        if (product.isNew) product.tags.push('新品')
        if (product.discount > 0) product.tags.push('促销')
        if (product.stock <= 10) product.tags.push('库存紧张')
      }
    })
  } catch (error) {
    console.error('获取商品列表失败', error)
    ElMessage.error('获取商品列表失败')
    // 确保在请求失败时products.value是一个空数组
    products.value = []
  } finally {
    loading.value = false
  }
}

// 添加到购物车
const handleAddToCart = (product: Product) => {
  cartStore.addToCart(product, 1)
  ElMessage.success('已添加到购物车')
}

// 从快速查看中添加到购物车
const handleAddToCartFromQuickView = () => {
  if (selectedProduct.value) {
    cartStore.addToCart(selectedProduct.value, quickViewQuantity.value)
    ElMessage.success(`已添加 ${quickViewQuantity.value} 件商品到购物车`)
    quickViewVisible.value = false
  }
}

// 快速查看商品
const handleQuickView = (product: Product) => {
  selectedProduct.value = product
  quickViewQuantity.value = 1
  quickViewVisible.value = true
}

// 页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchProducts()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 每页显示数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchProducts()
}

// 筛选条件变化
const handleFilterChange = () => {
  currentPage.value = 1
  fetchProducts()
  
  // 更新URL参数
  router.push({
    query: { 
      ...route.query,
      category: category.value || undefined,
      sort: sortBy.value !== 'default' ? sortBy.value : undefined
    }
  })
}

// 标签选择
const handleTagSelect = (tag: string) => {
  selectedTag.value = selectedTag.value === tag ? '' : tag
  currentPage.value = 1
  fetchProducts()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
  
  // 更新URL参数
  router.push({
    query: { 
      ...route.query,
      search: searchText.value || undefined
    }
  })
}

// 生命周期钩子
onMounted(() => {
  // 从URL获取查询参数
  if (route.query.category) {
    category.value = route.query.category as string
  }
  
  if (route.query.search) {
    searchText.value = route.query.search as string
  }
  
  if (route.query.tag) {
    selectedTag.value = route.query.tag as string
  }
  
  if (route.query.sort) {
    sortBy.value = route.query.sort as string
  }
  
  // 获取商品列表
  fetchProducts()
})
</script>

<style lang="scss" scoped>
.product-list-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.product-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
    
    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    
    .back-home-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.3s;
      
      &:hover {
        transform: translateX(-3px);
      }
    }
  }
  
  .search-box {
    width: 100%;
    max-width: 400px;
    
    @media (max-width: 768px) {
      width: 100%;
      max-width: none;
    }
  }
}

.filter-container {
  margin-bottom: 25px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .filter-section {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap;
    gap: 10px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .filter-label {
      font-weight: 600;
      color: #333;
      min-width: 60px;
    }
    
    .filter-options {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .filter-tag {
        cursor: pointer;
        margin-right: 5px;
        margin-bottom: 5px;
        transition: all 0.2s;
        
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}

.product-list {
  margin-bottom: 30px;
}

.skeleton-list {
  width: 100%;
}

.skeleton-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.product-row {
  row-gap: 20px; // 垂直间距
}

.product-col {
  height: 100%;
}

.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  margin-bottom: 20px;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    border-color: #42b883;
    
    .product-image img {
      transform: scale(1.05);
    }
    
    .product-title {
      color: #42b883;
    }
  }

  .product-image {
    position: relative;
    height: 200px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }

    .product-tags {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;

      .tag {
        padding: 5px 10px;
        border-radius: 3px;
        font-size: 12px;
        font-weight: bold;
        color: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

        &.new {
          background-color: #67c23a;
        }

        &.discount {
          background-color: #f56c6c;
        }
        
        &.stock {
          background-color: #e6a23c;
        }
      }
    }
  }

  .product-info {
    padding: 15px;
    flex: 1;

    .product-title {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
      height: 40px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      transition: color 0.3s;
    }
    
    .product-category {
      color: #909399;
      font-size: 13px;
      margin-bottom: 8px;
      padding: 2px 8px;
      background-color: #f5f7fa;
      border-radius: 12px;
      display: inline-block;
    }

    .product-price {
      margin-bottom: 10px;

      .current-price {
        font-size: 18px;
        font-weight: bold;
        color: #f56c6c;
      }

      .original-price {
        font-size: 14px;
        color: #999;
        text-decoration: line-through;
        margin-left: 5px;
      }
    }
    
    .product-tags-list {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
  }

  .product-actions {
    padding: 0 15px 15px;
    display: flex;
    gap: 8px;
    
    .el-button {
      flex: 1;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
      }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.quick-view-content {
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  .quick-view-image {
    flex: 1;
    max-width: 300px;
    
    img {
      width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s;
      
      &:hover {
        transform: scale(1.03);
      }
    }
    
    @media (max-width: 768px) {
      max-width: 100%;
    }
  }
  
  .quick-view-info {
    flex: 1;
    
    h2 {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 20px;
      color: #333;
    }
    
    .quick-view-price {
      margin-bottom: 15px;
      
      .current-price {
        font-size: 22px;
        font-weight: bold;
        color: #f56c6c;
      }
      
      .original-price {
        font-size: 16px;
        color: #999;
        text-decoration: line-through;
        margin-left: 8px;
      }
    }
    
    .quick-view-rating {
      margin-bottom: 15px;
    }
    
    .quick-view-description {
      margin-bottom: 15px;
      color: #606266;
      line-height: 1.6;
      padding: 10px;
      background-color: #f9f9f9;
      border-radius: 6px;
    }
    
    .quick-view-stock {
      margin-bottom: 15px;
      font-weight: 500;
      color: #333;
      padding: 5px 10px;
      background-color: #ecf5ff;
      border-radius: 4px;
      display: inline-block;
    }
    
    .quick-view-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      
      .el-button {
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-2px);
        }
      }
    }
  }
}

// 在文件末尾添加以下样式（确保在最后一个样式块后添加）
.el-radio-button.is-active .el-radio-button__inner {
  color: #fff !important;
}

// 或者如果使用标签形式的选择器
.el-tag.is-checked {
  color: #fff !important;
}
</style>

