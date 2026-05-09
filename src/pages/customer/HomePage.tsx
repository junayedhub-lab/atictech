import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Truck, HeadphonesIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product, Category, Banner } from '@/types'
import ProductCard from '@/components/product/ProductCard'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Helmet } from 'react-helmet-async'

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [bannerIdx, setBannerIdx] = useState(0)
  const [featured, setFeatured] = useState<Product[]>([])
  const [trending, setTrending] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [bannersRes, featuredRes, trendingRes, catRes] = await Promise.all([
        supabase.from('banners').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('products').select('*, category:categories(*)').eq('is_featured', true).limit(8),
        supabase.from('products').select('*, category:categories(*)').eq('is_trending', true).limit(8),
        supabase.from('categories').select('*').is('parent_id', null).limit(8),
      ])
      setBanners(bannersRes.data || [])
      setFeatured(featuredRes.data || [])
      setTrending(trendingRes.data || [])
      setCategories(catRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Auto-advance banner
  useEffect(() => {
    if (banners.length <= 1) return
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 5000)
    return () => clearInterval(t)
  }, [banners.length])

  const currentBanner = banners[bannerIdx]

  const features = [
    { icon: Truck, title: 'Fast Delivery', desc: 'Dhaka & nationwide delivery' },
    { icon: Shield, title: 'Secure Payment', desc: 'bKash, Nagad & COD supported' },
    { icon: Zap, title: 'Best Prices', desc: 'Unbeatable deals daily' },
    { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Always here to help you' },
  ]

  return (
    <>
      <Helmet>
        <title>Atik Technology — Bangladesh's Technology eCommerce Store</title>
        <meta name="description" content="Shop the latest tech products at Atik Technology. Fast delivery across Bangladesh, secure payments with bKash, Nagad & COD." />
      </Helmet>

      {/* Hero Banner */}
      <section className="relative overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center bg-slate-900">
        {loading ? (
          /* Initial loading state placeholder */
          <div className="absolute inset-0 bg-slate-950 animate-pulse" />
        ) : currentBanner ? (
          <>
            <img
              src={currentBanner.image_url}
              alt={currentBanner.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
            <div className="relative container-wide py-20">
              <div className="max-w-xl animate-fade-in">
                <p className="text-blue-400 font-medium text-sm mb-3 uppercase tracking-widest">Special Offer</p>
                <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight mb-4">
                  {currentBanner.title}
                </h1>
                {currentBanner.subtitle && (
                  <p className="text-slate-300 text-lg mb-8">{currentBanner.subtitle}</p>
                )}
                <Link
                  to={currentBanner.link || '/products'}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:gap-3"
                >
                  Shop Now <ArrowRight size={18} />
                </Link>
              </div>
            </div>
            {/* Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setBannerIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === bannerIdx ? 'bg-blue-400 w-6' : 'bg-slate-500'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Default hero when no banners */
          <div className="relative w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-orange-950/30" />
            {/* Decorative orbs */}
            <div className="absolute top-20 right-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-60 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl" />
            <div className="relative container-wide py-24 md:py-32">
              <div className="max-w-2xl animate-fade-in">
                <span className="inline-block bg-blue-500/15 border border-blue-500/30 text-blue-400 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
                  🚀 Bangladesh's #1 Tech Store
                </span>
                <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-none mb-5">
                  Tech at Your<br />
                  <span className="gradient-text">Fingertips</span>
                </h1>
                <p className="text-slate-300 text-xl mb-10 leading-relaxed">
                  Shop the latest gadgets, electronics & accessories. Fast delivery, best prices, genuine products.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 shadow-xl shadow-blue-600/30 hover:gap-3"
                  >
                    Shop Now <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/categories"
                    className="inline-flex items-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200"
                  >
                    Browse Categories
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features Bar */}
      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="container-wide py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-wide space-y-16 py-14">
        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <SectionHeader title="Shop by Category" subtitle="Explore our wide range of product categories" link="/categories" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-300 group-hover:text-blue-400 transition-colors line-clamp-2">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section>
          <SectionHeader title="Featured Products" subtitle="Hand-picked products just for you" link="/products?filter=featured" />
          <div className="mt-6">
            {loading ? <SkeletonGrid count={8} /> : (
              featured.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {featured.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <EmptyState message="No featured products yet" />
              )
            )}
          </div>
        </section>

        {/* Promo Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 to-slate-900 p-10 md:p-14">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-blue-300 font-medium text-sm mb-2 uppercase tracking-wider">Limited Time Offer</p>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4">
              Get Up to <span className="text-orange-400">40% Off</span><br />on Trending Products
            </h2>
            <p className="text-slate-300 mb-7 max-w-md">
              Don't miss out on the best deals in tech. Shop trending items at unbeatable prices.
            </p>
            <Link
              to="/products?filter=trending"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-7 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-xl shadow-orange-500/25 hover:gap-3"
            >
              Shop Trending <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Trending Products */}
        <section>
          <SectionHeader title="Trending Now" subtitle="What everyone is buying right now" link="/products?filter=trending" />
          <div className="mt-6">
            {loading ? <SkeletonGrid count={8} /> : (
              trending.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {trending.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <EmptyState message="No trending products yet" />
              )
            )}
          </div>
        </section>
      </div>
    </>
  )
}

function SectionHeader({ title, subtitle, link }: { title: string; subtitle?: string; link?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {link && (
        <Link to={link} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap">
          View all <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center text-slate-500">
      <p className="text-4xl mb-3">📦</p>
      <p>{message}</p>
    </div>
  )
}
