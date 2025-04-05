import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, Product } from '../types/product'

export const useCartStore = defineStore('cart', () => {
  // 购物车商品列表
  const cartItems = ref<CartItem[]>([])
  
  // 添加商品到购物车
  function addToCart(product: Product, quantity: number = 1) {
    const existItem = cartItems.value.find(item => item.id === product.id)
    
    if (existItem) {
      // 如果商品已存在，增加数量
      existItem.quantity += quantity
    } else {
      // 否则添加新商品
      cartItems.value.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity
      })
    }
  }
  
  // 从购物车移除商品
  function removeFromCart(productId: number) {
    const index = cartItems.value.findIndex(item => item.id === productId)
    if (index !== -1) {
      cartItems.value.splice(index, 1)
    }
  }
  
  // 更新购物车商品数量
  function updateQuantity(productId: number, quantity: number) {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      item.quantity = quantity
    }
  }
  
  // 清空购物车
  function clearCart() {
    cartItems.value = []
  }
  
  // 计算购物车商品总数
  const totalItems = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })
  
  // 计算购物车商品总价
  const totalPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
  })
  
  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  }
}, {
  // 开启持久化
  persist: true
})