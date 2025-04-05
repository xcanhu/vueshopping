import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 路由懒加载
const Home = () => import('../views/Home.vue')
const ProductList = () => import('../views/ProductList.vue')
const ProductDetail = () => import('../views/ProductDetail.vue')
const Cart = () => import('../views/Cart.vue')
const Checkout = () => import('../views/Checkout.vue')
const UserCenter = () => import('../views/UserCenter.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const NotFound = () => import('../views/NotFound.vue')

// 导出原始路由配置
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      keepAlive: true
    }
  },
  {
    path: '/products',
    name: 'ProductList',
    component: ProductList,
    meta: {
      title: '商品列表',
      keepAlive: true
    }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: {
      title: '商品详情',
      keepAlive: false
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: {
      title: '购物车',
      requiresAuth: true,
      keepAlive: false
    }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: {
      title: '结算',
      requiresAuth: true,
      keepAlive: false
    }
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: UserCenter,
    meta: {
      title: '用户中心',
      requiresAuth: true,
      keepAlive: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      keepAlive: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '注册',
      keepAlive: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面不存在',
      keepAlive: false
    }
  }
]

// 创建并导出router实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '首页'} - StarMall电商网站`
  
  // 需要登录权限的路由验证
  if (to.meta.requiresAuth) {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    next()
  }
})

export default router