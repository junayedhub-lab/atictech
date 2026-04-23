import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'
import Button from '@/components/ui/Button'

export default function CartPage() {
  const { items, itemCount, total, removeFromCart, updateQuantity } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const DELIVERY_CHARGE = 80

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h1 className="text-2xl font-display font-bold text-white mb-3">Sign in to view cart</h1>
        <p className="text-slate-400 mb-6">Please sign in to access your shopping cart.</p>
        <Link to="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
          Sign In
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-7xl mb-5">🛒</div>
        <h1 className="text-2xl font-display font-bold text-white mb-3">Your cart is empty</h1>
        <p className="text-slate-400 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-600/25 hover:gap-3">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Cart ({itemCount}) — AtikTech</title>
      </Helmet>

      <div className="container-wide py-10">
        <h1 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
          <ShoppingBag className="text-blue-400" size={26} />
          Shopping Cart
          <span className="text-lg font-normal text-slate-400">({itemCount} items)</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const product = item.product!
              const price = product.discount_price ?? product.price
              return (
                <div key={item.id} className="flex gap-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600 transition-all group">
                  {/* Image */}
                  <Link to={`/products/${product.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-700">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/200x200/1e293b/475569?text=Product'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="text-sm font-medium text-slate-200 hover:text-white line-clamp-2 transition-colors">{product.name}</h3>
                    </Link>
                    {product.category && <p className="text-xs text-blue-400 mt-0.5">{(product as any).category?.name}</p>}

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-4 py-1.5 text-sm font-medium text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1.5 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Price + Remove */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-base font-bold text-white">{formatPrice(price * item.quantity)}</p>
                          {item.quantity > 1 && <p className="text-xs text-slate-500">{formatPrice(price)} each</p>}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal ({itemCount} items)</span>
                  <span className="text-slate-200">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Delivery Charge</span>
                  <span className="text-slate-200">{formatPrice(DELIVERY_CHARGE)}</span>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4 mb-6">
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-xl text-white">{formatPrice(total + DELIVERY_CHARGE)}</span>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={() => navigate('/checkout')}
                className="mb-3"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Button>
              <Link
                to="/products"
                className="block text-center text-sm text-slate-400 hover:text-blue-400 transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
