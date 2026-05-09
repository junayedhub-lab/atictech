export interface Profile {
  id: string
  full_name: string
  phone: string
  address: string
  role: 'customer' | 'admin'
  avatar_url?: string
  is_blocked: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  discount_price?: number
  stock: number
  category_id: string
  category?: Category
  images: string[]
  is_featured: boolean
  is_trending: boolean
  tags?: string[]
  rating_avg?: number
  rating_count?: number
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  product?: Product
  quantity: number
  created_at: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cod' | 'bkash' | 'nagad'
export type PaymentStatus = 'pending' | 'approved' | 'rejected'

export interface Order {
  id: string
  user_id: string | null   // null for guest orders
  customer_name?: string   // for guest orders (no profile)
  profile?: Profile
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  transaction_id?: string
  total: number
  delivery_charge: number
  address: string
  phone: string
  notes?: string
  items?: OrderItem[]
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product?: Product
  quantity: number
  price: number
  is_reviewed?: boolean // Temporary field for UI
}

export interface Review {
  id: string
  product_id: string
  order_id?: string // Link review to a specific order
  user_id: string
  profile?: Profile
  rating: number
  comment: string
  created_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url: string
  link?: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Page {
  id: string
  slug: string
  title: string
  content: string
  meta_description?: string
}

export interface Setting {
  id: string
  key: string
  value: string
}

export interface LocalCartItem {
  product: Product
  quantity: number
}
