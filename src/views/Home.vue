<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="logo">
        <img src="@/assets/images/logo.svg" alt="StarMall Logo" />
        <h1>StarMall</h1>
      </div>
      <div class="search">
        <el-input
          v-model="searchText"
          placeholder="搜索商品"
          :prefix-icon="Search"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="user-actions">
        <div class="theme-options">
          <div class="theme-tags">
            <el-tooltip content="选择主题色" placement="top">
              <div class="color-picker">
                <el-color-picker v-model="themeColor" size="small" @change="updateTheme" />
              </div>
            </el-tooltip>
          </div>
          <div class="theme-mode">
            <el-tooltip :content="darkMode ? '切换到亮色模式' : '切换到暗色模式'" placement="top">
              <el-switch
                v-model="darkMode"
                @change="toggleDarkMode"
                size="small"
                :inline-prompt="true"
                :active-icon="Moon"
                :inactive-icon="Sunny"
                :style="{
                  '--el-switch-on-color': '#1a1a1a',
                  '--el-switch-off-color': themeColor
                }"
                />
            </el-tooltip>
          </div>
        </div>
        <el-button v-if="!userStore.token" @click="$router.push('/login')" type="text">登录</el-button>
        <el-button v-if="!userStore.token" @click="$router.push('/register')" type="text">注册</el-button>
        <el-dropdown v-else>
          <span class="user-info">
            {{ userStore.userInfo?.nickname || userStore.userInfo?.username }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu class="userhover">
              <el-dropdown-item @click="$router.push('/user')">个人中心</el-dropdown-item>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <div class="cart-icon" @click="$router.push('/cart')">
          <el-badge :value="cartStore.totalItems" :hidden="cartStore.totalItems === 0">
            <el-icon :size="24"><ShoppingCart /></el-icon>
          </el-badge>
        </div>
      </div>
    </header>

    <!-- 主导航菜单 -->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="all-categories">
          <el-popover
            placement="bottom-start"
            :width="200"
            trigger="hover"
            popper-class="categories-popover"
          >
            <template #reference>
              <div class="category-title">
                <el-icon><Menu /></el-icon>
                <span>全部分类</span>
              </div>
            </template>
            <div class="categories-list">
              <div 
                v-for="category in categories" 
                :key="category.id"
                class="category-item"
                @click="handleCategoryClick(category)"
              >
                <el-icon><component :is="category.icon" /></el-icon>
                <span>{{ category.name }}</span>
              </div>
            </div>
          </el-popover>
        </div>
        <ul class="nav-links">
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/products">全部商品</router-link></li>
          <li><router-link to="/products?tag=新品">新品上市</router-link></li>
          <li><router-link to="/products?tag=热卖">热卖商品</router-link></li>
          <li><router-link to="/products?tag=促销">促销特惠</router-link></li>
        </ul>
      </div>
    </nav>

    <!-- 滑动门轮播图 -->
    <div class="slider-container">
      <el-carousel height="400px" indicator-position="outside" :interval="5000">
        <el-carousel-item v-for="(banner, index) in banners" :key="index">
          <div class="banner-content" :style="{backgroundImage: `url(${banner.image})`}">
            <div class="banner-info">
              <h2>{{ banner.title }}</h2>
              <p>{{ banner.description }}</p>
              <el-button type="primary" @click="openLink(banner.link)">立即查看</el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      
      <!-- 滑动门侧边栏 -->
      <div class="slider-sidebar">
        <div 
          v-for="(category, index) in featuredCategories" 
          :key="index"
          class="sidebar-item"
          @mouseenter="activeCategory = index"
          @mouseleave="activeCategory = -1"
          @click="$router.push(`/products?category=${category.name}`)"
        >
          <div class="sidebar-item-content">
            <el-icon><component :is="category.icon" /></el-icon>
            <span>{{ category.name }}</span>
          </div>
          
          <!-- 滑动门展开内容 -->
          <div class="sidebar-expand" v-show="activeCategory === index">
            <div class="expand-content">
              <h3>{{ category.name }}热门商品</h3>
              <div class="expand-items">
                <div 
                  v-for="(subItem, subIndex) in category.subItems" 
                  :key="subIndex"
                  class="expand-item"
                  @click.stop="$router.push(`/product/${subItem.id}`)"
                >
                  <img :src="subItem.image" :alt="subItem.title">
                  <span>{{ subItem.title }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 特色商品展示 -->
    <section class="featured-products">
      <h2 class="section-title">特色商品</h2>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in featuredProducts" :key="product.id">
          <div class="product-card" @click="$router.push(`/product/${product.id}`)">
            <div class="product-image">
              <img :src="product.image" :alt="product.title">
              <div class="product-tags" v-if="product.isNew || product.discount">
                <span class="tag new" v-if="product.isNew">新品</span>
                <span class="tag discount" v-if="product.discount">
                  {{ Math.round(product.discount * 100) }}% OFF
                </span>
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-title">{{ product.title }}</h3>
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
            </div>
            <div class="product-actions">
              <el-button type="primary" @click.stop="handleAddToCart(product)">
                <el-icon><ShoppingCart /></el-icon>
                加入购物车
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>StarMall电商网站是基于Vue3打造的现代电商平台，致力于提供优质的购物体验。</p>
        </div>
        <div class="footer-section">
          <h3>客户服务</h3>
          <ul>
            <li>配送说明</li>
            <li>退换政策</li>
            <li>支付方式</li>
            <li>常见问题</li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>联系我们</h3>
          <ul>
            <li>电话: 400-123-4567</li>
            <li>邮箱: support@vueshopping.com</li>
            <li>地址: 北京市朝阳区科技园</li>
          </ul>
        </div>
      </div>
      <div class="copyright">
        <p>&copy; 2024 Xcan电商网站 版权所有</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useCartStore } from '../stores/cart'
import { useThemeStore } from '../stores/theme'
import { Search, Menu, ShoppingCart, ArrowDown, Moon, Sunny } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Product } from '../types/product'

// 路由实例
const router = useRouter()

// 状态管理
const userStore = useUserStore()
const cartStore = useCartStore()

// 搜索文本
const searchText = ref('')

// 主题定制
const themeStore = useThemeStore()
const themeColor = ref(themeStore.themeColor)
const darkMode = ref(themeStore.darkMode)

// 滑动门相关状态
const activeCategory = ref(-1)

// 模拟数据 - 分类列表
const categories = ref([
  { id: 1, name: '手机数码', icon: 'Cellphone' },
  { id: 2, name: '电脑办公', icon: 'Monitor' },
  { id: 3, name: '家用电器', icon: 'HomeFilled' },
  { id: 4, name: '服装鞋包', icon: 'ShoppingBag' },
  { id: 5, name: '美妆护肤', icon: 'Brush' },
  { id: 6, name: '食品生鲜', icon: 'Food' },
  { id: 7, name: '图书音像', icon: 'Reading' },
  { id: 8, name: '运动户外', icon: 'Football' }
])

// 模拟数据 - 滑动门侧边栏分类
const featuredCategories = ref([
  { 
    id: 1, 
    name: '手机数码', 
    icon: 'Cellphone',
    subItems: [
      { id: 101, title: 'iPhone 13', image: 'https://img.alicdn.com/imgextra/i2/4129257698/O1CN01cGe2lN26jjty4GaoS_!!4129257698.jpg_q50.jpg_.webp' },
      { id: 102, title: '华为 P50', image: 'https://img.alicdn.com/imgextra/i3/14770107/O1CN01fOdenS1Cf3Q1Qnlnq_!!14770107.jpg_.webp' },
      { id: 103, title: '小米 12', image: 'https://img.alicdn.com/imgextra/i3/2217592119216/O1CN01p440sb2Hwz9BFUxxN_!!2217592119216.png_.webp' },
      { id: 104, title: 'OPPO Find X', image: 'https://img.alicdn.com/imgextra/i3/901409638/O1CN01PUgJ212L4GKLl887R_!!901409638.jpg_.webp' },
      { id: 105, title: '三星 S22', image: 'https://gw.alicdn.com/imgextra/O1CN01Nft0L022C4NSIlhpR_!!370627083.jpg_.webp' },
      { id: 106, title: 'vivo Y200', image: 'https://img.alicdn.com/imgextra/i1/2207440821122/O1CN01NyIOKO1K9vQfVTGKJ_!!4611686018427386754-0-item_pic.jpg_.webp' }
    ]
  },
  { 
    id: 2, 
    name: '电脑办公', 
    icon: 'Monitor',
    subItems: [
      { id: 201, title: 'MacBook Pro', image: 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spaceblack-gallery1-202410?wid=4000&hei=3074&fmt=jpeg&qlt=90&.v=1729264981617' },
      { id: 202, title: 'ThinkPad X1', image: 'https://img.alicdn.com/imgextra/i1/2955374408/O1CN01zlqZrX1iQutzmbo2p_!!4611686018427383624-0-item_pic.jpg_.webp' },
      { id: 203, title: '戴尔 XPS', image: 'https://gw.alicdn.com/imgextra/O1CN01Xxhd4P1UqC41NNRUB_!!379092568.jpg_.webp' },
      { id: 204, title: '华硕 ROG', image: 'https://gw.alicdn.com/imgextra/O1CN01M5sxaF1Nj8jNHrLBh_!!2745641605-0-picasso.jpg_.webp' },
      { id: 205, title: '惠普 Spectre', image: 'https://img.alicdn.com/imgextra/i3/133668489/O1CN01n7lnze2Ca1FM5wqFZ_!!4611686018427387529-0-item_pic.jpg_.webp' },
      { id: 206, title: '联想 YOGA', image: 'https://img.alicdn.com/imgextra/i4/2616970884/O1CN014gKzqY1IOvADbzlE8_!!4611686018427383428-0-item_pic.jpg_.webp' }
    ]
  },
  { 
    id: 3, 
    name: '家用电器', 
    icon: 'HomeFilled',
    subItems: [
      { id: 301, title: '海尔冰箱', image: 'https://img.alicdn.com/imgextra/i3/870154867/O1CN01URWqUf1lp8hKVSVn7_!!870154867.png_.webp' },
      { id: 302, title: '美的空调', image: 'https://img.alicdn.com/imgextra/i3/2218858406671/O1CN013z2PPu1z9NCVWOy7i_!!2218858406671.jpg_.webp' },
      { id: 303, title: '格力空调', image: 'https://gw.alicdn.com/bao/uploaded/i4/2217790232532/O1CN01e8qqwu1UZhn7A2g8t_!!2217790232532.png_.webp' },
      { id: 304, title: '西门子洗衣机', image: 'https://img.alicdn.com/imgextra/i4/859230932/O1CN01ifof1T1IkuBAEO1pf_!!4611686018427384532-0-item_pic.jpg_.webp' },
      { id: 305, title: '松下电视', image: 'https://gw.alicdn.com/bao/uploaded/i4/2811051391/O1CN01zh10Oa1M97thVMblm_!!2811051391.jpg_.webp' },
      { id: 306, title: '小米电视', image: 'https://cdn.cnbj0.fds.api.mi-img.com/b2c-shopapi-pms/pms_1728975011.67952227.jpg' }
    ]
  },
  { 
    id: 4, 
    name: '服装鞋包', 
    icon: 'ShoppingBag',
    subItems: [
      { id: 401, title: '耐克运动鞋', image: 'https://img.alicdn.com/imgextra/i2/4129257698/O1CN01cGe2lN26jjty4GaoS_!!4129257698.jpg_q50.jpg_.webp' },
      { id: 402, title: '阿迪达斯', image: 'https://img.alicdn.com/imgextra/i3/14770107/O1CN01fOdenS1Cf3Q1Qnlnq_!!14770107.jpg_.webp' },
      { id: 403, title: 'Zara外套', image: 'https://img.alicdn.com/imgextra/i3/2217592119216/O1CN01p440sb2Hwz9BFUxxN_!!2217592119216.png_.webp' },
      { id: 404, title: 'H&M T恤', image: 'https://img.alicdn.com/imgextra/i3/901409638/O1CN01PUgJ212L4GKLl887R_!!901409638.jpg_.webp' },
      { id: 405, title: 'UNIQLO牛仔裤', image: 'https://gw.alicdn.com/imgextra/O1CN01Nft0L022C4NSIlhpR_!!370627083.jpg_.webp' },
      { id: 406, title: '优衣库羽绒服', image: 'https://img.alicdn.com/imgextra/i1/2207440821122/O1CN01NyIOKO1K9vQfVTGKJ_!!4611686018427386754-0-item_pic.jpg_.webp' }
    ]
  },
  { 
    id: 5, 
    name: '美妆护肤', 
    icon: 'Brush',
    subItems: [
      { id: 501, title: '兰蔻精华', image: 'https://img.alicdn.com/imgextra/i2/2200785402219/O1CN01wFDOr01SGLu3yPfSC_!!2200785402219.jpg_.webp' },
      { id: 502, title: '雅诗兰黛面霜', image: 'https://img.alicdn.com/imgextra/i1/2955374408/O1CN01zlqZrX1iQutzmbo2p_!!4611686018427383624-0-item_pic.jpg_.webp' },
      { id: 503, title: 'SK-II神仙水', image: 'https://gw.alicdn.com/imgextra/O1CN01Xxhd4P1UqC41NNRUB_!!379092568.jpg_.webp' },
      { id: 504, title: '资生堂口红', image: 'https://gw.alicdn.com/imgextra/O1CN01M5sxaF1Nj8jNHrLBh_!!2745641605-0-picasso.jpg_.webp' },
      { id: 505, title: '欧莱雅洗发水', image: 'https://img.alicdn.com/imgextra/i3/133668489/O1CN01n7lnze2Ca1FM5wqFZ_!!4611686018427387529-0-item_pic.jpg_.webp' },
      { id: 506, title: '薇诺娜护肤', image: 'https://img.alicdn.com/imgextra/i4/2616970884/O1CN014gKzqY1IOvADbzlE8_!!4611686018427383428-0-item_pic.jpg_.webp' }
    ]
  }
])

// 模拟数据 - 轮播图
const banners = ref([
  {
    title: '新品上市',
    description: '全新iPhone 16系列，现在购买享受优惠',
    image: require('@/assets/images/banner1.png'),
    link: 'https://www.apple.com.cn/iphone/?cid=aos-cn-kwbi-iphone-bz'
  },
  {
    title: '夏季特惠',
    description: '夏季服装全场低至5折，限时抢购',
    image: 'https://res-cms.abercrombie.cn/bz-anf-prod/prod/ANF/2025-03-27/pchco-3.28_b054d72a-fd02-4cff-9430-19ef2ee4ca03.gif',
    link: 'https://www.hollisterco.cn/'
  },
  {
    title: '电脑数码专场',
    description: '笔记本电脑、平板电脑多重优惠',
    image: 'https://www-cdn.djiits.com/cms/uploads/02752474cc43dafa366821c44b81a2f4@origin.jpg',
    link: 'https://www.dji.com/cn/rs-4-mini?site=brandsite&from=homepage'
  }
])

// 模拟数据 - 特色商品
const featuredProducts = ref([
  {
    id: 1,
    title: 'iPhone 13 Pro',
    price: 8999,
    description: '最新款iPhone，搭载A15仿生芯片',
    category: '手机数码',
    image: 'https://img.alicdn.com/imgextra/i2/4129257698/O1CN01cGe2lN26jjty4GaoS_!!4129257698.jpg_q50.jpg_.webp',
    rating: {
      rate: 4.8,
      count: 320
    },
    stock: 100,
    isNew: true,
    discount: 0
  },
  {
    id: 2,
    title: 'MacBook Pro 14英寸',
    price: 14999,
    description: '搭载M1 Pro芯片，强大性能',
    category: '电脑办公',
    image: 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spaceblack-gallery1-202410?wid=4000&hei=3074&fmt=jpeg&qlt=90&.v=1729264981617',
    rating: {
      rate: 4.9,
      count: 156
    },
    stock: 50,
    isNew: true,
    discount: 0
  },
  {
    id: 3,
    title: '小米电视6 OLED 65英寸',
    price: 6999,
    description: '4K超高清OLED屏幕，震撼视觉体验',
    category: '家用电器',
    image: 'https://cdn.cnbj0.fds.api.mi-img.com/b2c-shopapi-pms/pms_1728975011.67952227.jpg',
    rating: {
      rate: 4.7,
      count: 89
    },
    stock: 30,
    isNew: false,
    discount: 0.1
  },
  {
    id: 4,
    title: 'Nike Air Max 270',
    price: 1299,
    description: '舒适缓震，时尚外观',
    category: '服装鞋包',
    image: 'https://gw.alicdn.com/bao/uploaded/i2/890482188/O1CN01TrMoGc1S29cIjn1m3-890482188.jpg_.webp',
    rating: {
      rate: 4.6,
      count: 215
    },
    stock: 200,
    isNew: false,
    discount: 0.2
  }
])

// 搜索处理
const handleSearch = () => {
  if (searchText.value.trim()) {
    router.push({
      path: '/products',
      query: { search: searchText.value.trim() }
    })
  }
}

// 分类点击处理
const handleCategoryClick = (category: any) => {
  router.push({
    path: '/products',
    query: { category: category.name }
  })
}

// 添加到购物车
const handleAddToCart = (product: Product) => {
  cartStore.addToCart(product, 1)
  ElMessage.success('已添加到购物车')
}

// 退出登录
const handleLogout = () => {
  userStore.clearUserInfo()
  ElMessage.success('已退出登录')
  router.push('/')
}

// 更新主题色
const updateTheme = (color: string) => {
  themeStore.setThemeColor(color)
}

// 切换暗黑模式
const toggleDarkMode = (value: boolean) => {
  themeStore.toggleDarkMode(value)
}

// 立即查看打开链接
const openLink = (url: string) => {
  if (typeof window !== 'undefined') {
    window.location.href =url;
  }
}

// 生命周期钩子
onMounted(() => {
  // 同步主题状态
  themeColor.value = themeStore.themeColor
  darkMode.value = themeStore.darkMode
})
</script>

<style lang="scss" scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--background-color-base);
  font-family: var(--font-family);
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 50px;
  background-color: var(--background-color-white);
  box-shadow: var(--box-shadow-light);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: var(--transition-base);
  
  @media (max-width: 768px) {
    padding: 15px 20px;
  }

  .logo {
    display: flex;
    align-items: center;
    
    img {
      height: 40px;
      width: auto;
      margin-right: 10px;
    }
    
    h1 {
      display: none;
    }
  }

  .search {
    width: 400px;
    
    @media (max-width: 992px) {
      width: 300px;
    }
    
    @media (max-width: 768px) {
      width: 200px;
    }
    
    :deep(.el-input__wrapper) {
      border-radius: var(--border-radius-large);
      box-shadow: var(--box-shadow-light);
      transition: var(--transition-base);
      
      &:hover, &:focus-within {
        box-shadow: 0 0 0 1px var(--primary-color-light);
      }
    }
  }

  .user-actions {
    display: flex;
    align-items: center;
    gap: 20px;

    .theme-options {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 10px;
      border-radius: var(--border-radius-base);
      
      .theme-tags, .theme-mode {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .color-picker {
        display: flex;
        align-items: center;
        cursor: pointer;
      }
      
      .preset-themes {
        .preset-title {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 10px;
          color: var(--text-color-primary);
        }
        
        .theme-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          
          .theme-item {
            width: 30px;
            height: 30px;
            border-radius: var(--border-radius-circle);
            cursor: pointer;
            transition: var(--transition-base);
            border: 2px solid transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            
            &.active {
              border-color: var(--border-color-base);
              transform: scale(1.1);
            }
            
            &:hover {
              transform: scale(1.1);
            }
            
            .theme-color-block {
              width: 100%;
              height: 100%;
              border-radius: var(--border-radius-circle);
            }
          }
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: 500;
      color: var(--text-color-primary);
      transition: var(--transition-base);
      
      &:hover {
        color: var(--primary-color);
      }
      
      .el-icon {
        margin-left: 5px;
        transition: var(--transition-base);
      }
      
      &:hover .el-icon {
        transform: translateY(2px);
      }
    }

    :deep(.el-dropdown-menu) {
      .el-dropdown-menu__item {
        color: var(--primary-color);
        transition: var(--transition-base);
        
        &:hover, &:focus {
          color: #fff !important;
          background-color: var(--background-color-hover);
        }
      }
    }

    .cart-icon {
      cursor: pointer;
      padding: 8px;
      border-radius: var(--border-radius-circle);
      transition: var(--transition-base);
      position: relative;

      &:hover {
        color: var(--primary-color);
        background-color: var(--background-color-hover);
      }
      
      :deep(.el-badge__content) {
        border: none;
        font-weight: 600;
      }
    }
  }
}

/* 主导航菜单 */
.main-nav {
  background-color: var(--primary-color);
  color: #fff;
  box-shadow: var(--box-shadow-base);

  .nav-container {
    display: flex;
    max-width: 1200px;
    margin: 0 auto;
    height: 60px;

    .all-categories {
      width: 220px;
      position: relative;

      .category-title {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        cursor: pointer;
        background-color: rgba(0, 0, 0, 0.15);
        transition: var(--transition-base);
        font-weight: 600;
        letter-spacing: 0.5px;

        .el-icon {
          margin-right: 8px;
          font-size: 20px;
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.25);
        }
      }
    }

    .nav-links {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;

      li {
        height: 60px;
        line-height: 60px;
        padding: 0 25px;
        transition: var(--transition-base);
        position: relative;

        &:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 3px;
          background-color: #fff;
          transition: var(--transition-base);
          transform: translateX(-50%);
        }
        
        &:hover::after {
          width: 70%;
        }

        a {
          color: #fff;
          text-decoration: none;
          font-size: var(--font-size-md);
          font-weight: 500;
          display: block;
          height: 100%;
        }
      }
    }
  }
}

/* 滑动门轮播图 - 现代化设计 */
.slider-container {
  position: relative;
  max-width: 1200px;
  margin: 30px auto;
  height: 450px;
  border-radius: var(--border-radius-large);
  overflow: hidden;
  box-shadow: var(--box-shadow-card);
  padding-left: 220px;
  
  @media (max-width: 992px) {
    padding-left: 0;
  }
  
  @media (max-width: 768px) {
    height: 350px;
    margin: 20px 15px;
    border-radius: var(--border-radius-medium);
  }
}

.slider-container {
  :deep(.el-carousel) {
    height: 100%;
    
    .el-carousel__container {
      height: 100%;
    }
    
    .el-carousel__indicators {
      z-index: 30;
      
      .el-carousel__button {
        width: 10px;
        height: 10px;
        border-radius: var(--border-radius-circle);
        background-color: rgba(255, 255, 255, 0.6);
        transition: var(--transition-base);
      }
      
      .el-carousel__indicator.is-active .el-carousel__button {
        background-color: #fff;
        transform: scale(1.2);
      }
    }
  }

  .banner-content {
    height: 100%;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    padding: 0 280px 0 50px;
    position: relative;
    overflow: hidden;
    
    @media (max-width: 992px) {
      padding: 0 50px;
      justify-content: center;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%);
      z-index: 1;
    }

    .banner-info {
      position: absolute;
      top: 20px;
      left: 650px;
      max-width: 350px;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.6));
      padding: 25px;
      border-radius: var(--border-radius-medium);
      box-shadow: var(--box-shadow-card);
      z-index: 2;
      backdrop-filter: blur(5px);
      border-left: 4px solid var(--primary-color);
      
      @media (max-width: 768px) {
        max-width: 280px;
        padding: 20px;
        top: 30px;
        left: 30px;
      }

      h2 {
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 24px;
        font-weight: 700;
        color: #fff;
      }

      p {
        margin-bottom: 15px;
        font-size: var(--font-size-md);
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.5;
      }
      
      .el-button {
        font-weight: 600;
        letter-spacing: 0.5px;
        padding: 10px 20px;
        border-radius: var(--border-radius-medium);
        transition: var(--transition-base);
        background-color: var(--primary-color);
        border-color: var(--primary-color);
        color: #fff;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          opacity: 0.9;
        }
      }
    }
  }

  /* 滑动门侧边栏 */
  .slider-sidebar {
    position: absolute;
    top: 0;
    left: 0;
    width: 220px;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75);
    z-index: 10;
    backdrop-filter: blur(5px);
    
    @media (max-width: 992px) {
      display: none;
    }

    .sidebar-item {
      position: relative;
      height: 90px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      color: #fff;
      cursor: pointer;
      transition: var(--transition-base);
      border-left: 3px solid transparent;

      &:hover {
        background-color: var(--primary-color);
        border-left-color: #fff;
      }

      .sidebar-item-content {
        display: flex;
        align-items: center;

        .el-icon {
          margin-right: 12px;
          font-size: 20px;
        }
        
        span {
          font-size: 16px;
          font-weight: 500;
        }
      }

      /* 滑动门展开内容 */
      .sidebar-expand {
        position: fixed;
        left: 220px;
        top: 0;
        width: 500px;
        min-height: 450px;
        max-height: 100%;
        background-color: #fff;
        box-shadow: var(--box-shadow-hover);
        z-index: 20;
        padding: 25px;
        color: var(--text-color-primary);
        border-radius: 0 var(--border-radius-medium) var(--border-radius-medium) 0;

        .expand-content {
          h3 {
            margin-top: 0;
            margin-bottom: 20px;
            color: var(--primary-color);
            border-bottom: 2px solid var(--border-color-lighter);
            padding-bottom: 12px;
            font-size: 18px;
            position: relative;
            
            &::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 0;
              width: 50px;
              height: 2px;
              background-color: var(--primary-color);
            }
          }

          .expand-items {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            padding: 10px 0;
          }

          .expand-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            transition: var(--transition-base);
            padding: 10px;
            border-radius: var(--border-radius-base);
          }

          .expand-item img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: var(--border-radius-base);
            margin-bottom: 8px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            transition: var(--transition-base);
          }

          .expand-item span {
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 14px;
            line-height: 1.4;
            padding: 0 5px;
          }
        }
      }
    }
  }
}

/* 特色商品展示 */
.featured-products {
  max-width: 1200px;
  margin: 50px auto;
  padding: 0 20px;

  .section-title {
    text-align: center;
    margin-bottom: 40px;
    font-size: 32px;
    color: var(--text-color-primary);
    position: relative;
    font-weight: 700;

    &:after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background-color: var(--primary-color);
      border-radius: var(--border-radius-base);
    }
  }

  .product-card {
    background: linear-gradient(to bottom, var(--background-color-white), var(--background-color-base));
    border-radius: var(--border-radius-medium);
    overflow: hidden;
    box-shadow: var(--box-shadow-light);
    transition: var(--transition-smooth);
    margin-bottom: 25px;
    cursor: pointer;
    border: 1px solid var(--border-color-lighter);
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.5), transparent 70%);
      background-size: 200% 100%;
      animation: shine 3s linear infinite;
      opacity: 0;
      transition: opacity 0.3s;
    }

    &:hover {
      transform: translateY(-8px);
      box-shadow: var(--box-shadow-hover);
      
      &::before {
        opacity: 1;
      }
      
      .product-image img {
        transform: scale(1.08);
      }
    }

    .product-image {
      position: relative;
      height: 220px;
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
        gap: 8px;
        z-index: 2;

        .tag {
          padding: 6px 12px;
          border-radius: var(--border-radius-base);
          font-size: 12px;
          font-weight: bold;
          color: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

          &.new {
            background-color: var(--success-color);
          }

          &.discount {
            background-color: var(--danger-color);
          }
        }
      }
    }
    
    .product-info {
      padding: 20px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
    
    .product-title {
      margin: 0 0 12px;
      font-size: var(--font-size-md);
      font-weight: 600;
      height: 44px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      color: var(--text-color-primary);
    }
    
    .product-price {
      margin-bottom: 12px;
      display: flex;
      align-items: center;

      .current-price {
        font-size: 20px;
        font-weight: bold;
        color: var(--danger-color);
      }

      .original-price {
        font-size: 14px;
        color: var(--text-color-secondary);
        text-decoration: line-through;
        margin-left: 8px;
      }
    }
    
    .product-rating {
      margin-bottom: 15px;
      
      :deep(.el-rate__icon) {
        margin-right: 2px;
      }
    }
    
    .product-actions {
      padding: 0 20px 20px;
      margin-top: auto;
      
      .el-button {
        border-radius: var(--border-radius-medium);
        font-weight: 500;
        transition: var(--transition-base);
        
        &:hover {
          transform: translateY(-2px);
        }
      }
    }
  }
}

/* 页脚 */
.footer {
  background-color: var(--text-color-primary);
  color: #fff;
  padding: 50px 0 0;
  margin-top: 50px;
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0 20px;
    
    .footer-section {
      width: 30%;
      margin-bottom: 30px;
      
      @media (max-width: 768px) {
        width: 100%;
      }
      
      h3 {
        font-size: 18px;
        margin-bottom: 20px;
        position: relative;
        padding-bottom: 10px;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background-color: var(--primary-color);
        }
      }
      
      p {
        line-height: 1.6;
        margin-bottom: 15px;
        color: rgba(255, 255, 255, 0.8);
      }
      
      ul {
        list-style: none;
        padding: 0;
        
        li {
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.8);
          transition: var(--transition-base);
          
          &:hover {
            color: var(--primary-color-light);
            transform: translateX(5px);
          }
        }
      }
    }
  }
  
  .copyright {
    text-align: center;
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 20px;
    
    p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
    }
  }
}

/* 动画 */
@keyframes slideInFromLeft {
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.userhover {
  :hover{
    color: #fff;
  }
}
</style>