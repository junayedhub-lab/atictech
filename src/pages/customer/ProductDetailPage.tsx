import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, Zap, Star, ChevronLeft, Minus, Plus, Package, Truck, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product, Review } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import StarRating from '@/components/ui/StarRating'
import { Skeleton } from '@/components/ui/Skeleton'
import { Helmet } from 'react-helmet-async'
import ProductCard from '@/components/product/ProductCard'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setSelectedImg(0)
    setQuantity(1)

    async function load() {
      const { data: p } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .single()

      if (!p) { navigate('/products'); return }
      setProduct(p)

      const [relatedRes, reviewsRes] = await Promise.all([
        supabase.from('products').select('*, category:categories(*)').eq('category_id', p.category_id).neq('id', p.id).limit(4),
        supabase.from('reviews').select('*, profile:profiles(full_name, avatar_url)').eq('product_id', p.id).order('created_at', { ascending: false }),
      ])
      
      if (reviewsRes.error) {
        console.error('Review fetch error:', reviewsRes.error)
      }
      
      setRelated(relatedRes.data || [])
      setReviews(reviewsRes.data || [])
      setLoading(false)
    }
    load()
  }, [slug, navigate])

  const handleAddToCart = async () => {
    if (!product) return
    setAddingToCart(true)
    await addToCart(product, quantity)
    toast.success(`${quantity} item(s) added to cart!`, { icon: '🛒' })
    setAddingToCart(false)
  }

  const handleBuyNow = async () => {
    if (!product) return
    await addToCart(product, quantity)
    navigate('/checkout')
  }



  if (loading) return <ProductDetailSkeleton />
  if (!product) return null

  const discount = product.discount_price ? getDiscountPercent(product.price, product.discount_price) : 0
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <>
      <Helmet>
        <title>{product.name} — Atik Technology</title>
        <meta name="description" content={product.description?.slice(0, 160)} />
      </Helmet>

      <div className="container-wide py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-400 transition-colors">Products</Link>
          {product.category && <>
            <span>/</span>
            <Link to={`/products?category=${product.category.slug}`} className="hover:text-blue-400 transition-colors">{product.category.name}</Link>
          </>}
          <span>/</span>
          <span className="text-slate-300 line-clamp-1">{product.name}</span>
        </nav>

        {/* Main product section */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50">
              <img
                src={product.images?.[selectedImg] || 'https://placehold.co/600x600/1e293b/475569?text=Product'}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={cn(
                      'w-18 h-18 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200',
                      i === selectedImg ? 'border-blue-500' : 'border-slate-700 opacity-60 hover:opacity-100'
                    )}
                    style={{ width: 72, height: 72 }}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {product.category && (
              <Link to={`/products?category=${product.category.slug}`} className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                {product.category.name}
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating summary */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-3">
                <StarRating rating={avgRating} size={16} />
                <span className="text-sm text-slate-300">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-slate-500">({reviews.length} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-white">
                {formatPrice(product.discount_price ?? product.price)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-slate-500 line-through">{formatPrice(product.price)}</span>
                  <span className="bg-orange-500/15 text-orange-400 text-sm font-semibold px-2.5 py-0.5 rounded-full">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full',
                product.stock > 10 ? 'bg-green-500/10 text-green-400' :
                product.stock > 0 ? 'bg-orange-500/10 text-orange-400' :
                'bg-red-500/10 text-red-400'
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', product.stock > 0 ? 'bg-current' : 'bg-red-400')} />
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">Quantity:</span>
                <div className="flex items-center border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-5 py-2.5 text-sm font-medium text-white min-w-[48px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="p-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShoppingCart size={18} />}
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={18} /> Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: 'Fast Delivery', sub: 'Nationwide' },
                { icon: Shield, label: 'Secure Pay', sub: 'bKash / COD' },
                { icon: Package, label: 'Easy Returns', sub: '7-day policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-center">
                  <Icon size={16} className="text-blue-400" />
                  <p className="text-xs font-medium text-slate-300">{label}</p>
                  <p className="text-xs text-slate-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Description + Reviews */}
        <div className="mb-16">
          <div className="flex border-b border-slate-800 mb-6">
            {(['description', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-6 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px relative',
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                )}
              >
                {tab} 
                {tab === 'reviews' && reviews.length > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {reviews.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'description' ? (
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
              {product.description || 'No description available.'}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Review Policy Notice */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Package size={20} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Verified Purchases Only</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    To ensure authentic feedback, only customers who have purchased this product can leave a review. 
                    If you've bought this, go to <Link to="/account/orders" className="text-blue-400 hover:underline">My Orders</Link> to share your experience.
                  </p>
                </div>
              </div>

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No reviews yet. Be the first!</p>
              ) : reviews.map(review => (
                <div key={review.id} className="flex gap-4 pb-5 border-b border-slate-800 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0 shadow-inner">
                    {(review as any).full_name?.[0]?.toUpperCase() || (review.profile as any)?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white">
                        {(review as any).full_name || (review.profile as any)?.full_name || 'Verified Customer'}
                      </p>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{review.comment}</p>
                    <p className="text-xs text-slate-600 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-display font-bold text-white mb-5">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-2 gap-10">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-1/2" />
          <div className="flex gap-3 mt-4">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
