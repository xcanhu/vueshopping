// 商品接口
export interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating?: {
    rate: number
    count: number
  }
  stock: number
  tags?: string[]
  discount?: number
  isNew?: boolean
  isFeatured?: boolean
}

// 购物车商品接口
export interface CartItem {
  id: number
  title: string
  price: number
  image: string
  quantity: number
}

// 商品列表过滤参数
export interface ProductFilter {
  category?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'price-asc' | 'price-desc' | 'rating-desc' | 'newest'
  search?: string
  page?: number
  pageSize?: number
}

// 商品列表响应
export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}