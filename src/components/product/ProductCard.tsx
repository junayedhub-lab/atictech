import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import type { Product } from '@/types'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import StarRating from '@/components/ui/StarRating'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const discount = product.discount_price
    ? getDiscountPercent(product.price, product.discount_price)
    : 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    await addToCart(product)
    toast.success('Added to cart!', { icon: '🛒' })
  }

  return (
    <div className="product-card group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/40">
      {/* Image */}
      {/* Image Area */}
      <div className="relative overflow-hidden aspect-square bg-slate-700/30">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images?.[0] || 'https://placehold.co/400x400/1e293b/475569?text=Product'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          {discount > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <ShoppingCart size={13} /> Add to Cart
          </button>
          <Link
            to={`/products/${product.slug}`}
            className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
          >
            <Eye size={13} />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        {product.category && (
          <p className="text-xs text-blue-400 font-medium">{product.category.name}</p>
        )}
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-slate-200 line-clamp-2 hover:text-white transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {(product.rating_avg ?? 0) > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={product.rating_avg || 0} size={12} />
            <span className="text-xs text-slate-500">({product.rating_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-base font-bold text-white">
            {formatPrice(product.discount_price ?? product.price)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-slate-500 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-orange-400">Only {product.stock} left!</p>
        )}
      </div>
    </div>
  )
}
