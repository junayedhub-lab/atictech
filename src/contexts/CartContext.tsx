import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import type { CartItem, Product } from '@/types'

const LOCAL_CART_KEY = 'atik_guest_cart'

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

// ── Local (guest) cart helpers ────────────────────────────────────────────────
function readLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalCart(items: CartItem[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items))
}

function makeGuestItem(product: Product, quantity: number): CartItem {
  return {
    id: `local-${product.id}`,
    user_id: 'guest',
    product_id: product.id,
    product,
    quantity,
    created_at: new Date().toISOString(),
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  // ── Fetch / sync cart ───────────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!user) {
      // Guest: load from localStorage
      setItems(readLocalCart())
      return
    }
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

  // When user logs in, merge local cart into DB cart then clear local
  useEffect(() => {
    if (!user) return
    const local = readLocalCart()
    if (local.length === 0) return

    async function mergeLocalCart() {
      for (const item of local) {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user!.id)
          .eq('product_id', item.product_id)
          .maybeSingle()

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + item.quantity })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('cart_items')
            .insert({ user_id: user!.id, product_id: item.product_id, quantity: item.quantity })
        }
      }
      localStorage.removeItem(LOCAL_CART_KEY)
      fetchCart()
    }

    mergeLocalCart()
  }, [user])

  // ── Add to cart ─────────────────────────────────────────────────────────────
  async function addToCart(product: Product, quantity = 1) {
    if (!user) {
      // Guest: local cart
      const current = readLocalCart()
      const existing = current.find(i => i.product_id === product.id)
      let updated: CartItem[]
      if (existing) {
        updated = current.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      } else {
        updated = [makeGuestItem(product, quantity), ...current]
      }
      writeLocalCart(updated)
      setItems(updated)
      return
    }

    // Logged-in user: DB cart
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

  // ── Remove from cart ────────────────────────────────────────────────────────
  async function removeFromCart(itemId: string) {
    if (!user) {
      const updated = readLocalCart().filter(i => i.id !== itemId)
      writeLocalCart(updated)
      setItems(updated)
      return
    }
    await supabase.from('cart_items').delete().eq('id', itemId)
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  // ── Update quantity ─────────────────────────────────────────────────────────
  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) { await removeFromCart(itemId); return }

    if (!user) {
      const updated = readLocalCart().map(i => i.id === itemId ? { ...i, quantity } : i)
      writeLocalCart(updated)
      setItems(updated)
      return
    }
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i))
  }

  // ── Clear cart ──────────────────────────────────────────────────────────────
  async function clearCart() {
    if (!user) {
      localStorage.removeItem(LOCAL_CART_KEY)
      setItems([])
      return
    }
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
