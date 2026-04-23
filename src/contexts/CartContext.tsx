import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import type { CartItem, Product } from '@/types'

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  loading: boolean
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return }
    setLoading(true)
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*, category:categories(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  async function addToCart(product: Product, quantity = 1) {
    if (!user) return
    const existing = items.find(i => i.product_id === product.id)
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + quantity)
    } else {
      const { data } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: product.id, quantity })
        .select('*, product:products(*, category:categories(*))')
        .single()
      if (data) setItems(prev => [data, ...prev])
    }
  }

  async function removeFromCart(itemId: string) {
    await supabase.from('cart_items').delete().eq('id', itemId)
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) { await removeFromCart(itemId); return }
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i))
  }

  async function clearCart() {
    if (!user) return
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    setItems([])
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const total = items.reduce((sum, i) => {
    const price = i.product?.discount_price ?? i.product?.price ?? 0
    return sum + price * i.quantity
  }, 0)

  return (
    <CartContext.Provider value={{ items, itemCount, total, loading, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
