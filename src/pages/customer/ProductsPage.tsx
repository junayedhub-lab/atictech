import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal, Grid, List, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product, Category } from '@/types'
import ProductCard from '@/components/product/ProductCard'
import { useCart } from '@/contexts/CartContext'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Helmet } from 'react-helmet-async'
import { cn } from '@/lib/utils'

type SortKey = 'latest' | 'price_asc' | 'price_desc' | 'popular'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [total, setTotal] = useState(0)

  const categorySlug = searchParams.get('category') || ''
  const filter = searchParams.get('filter') || ''
  const sort = (searchParams.get('sort') || 'latest') as SortKey
  const minPrice = Number(searchParams.get('min') || 0)
  const maxPrice = Number(searchParams.get('max') || 999999)

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    setSearchParams(p)
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('products').select('*, category:categories(*)', { count: 'exact' })

    if (categorySlug) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
      if (cat) query = query.eq('category_id', cat.id)
    }
    if (filter === 'featured') query = query.eq('is_featured', true)
    if (filter === 'trending') query = query.eq('is_trending', true)
    if (minPrice > 0) query = query.gte('price', minPrice)
    if (maxPrice < 999999) query = query.lte('price', maxPrice)

    switch (sort) {
      case 'price_asc': query = query.order('price', { ascending: true }); break
      case 'price_desc': query = query.order('price', { ascending: false }); break
      default: query = query.order('created_at', { ascending: false })
    }

    const { data, count } = await query.limit(48)
    setProducts(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [categorySlug, filter, sort, minPrice, maxPrice])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    supabase.from('categories').select('*').is('parent_id', null).then(({ data }) => setCategories(data || []))
  }, [])

  const sortOptions: { label: string; value: SortKey }[] = [
    { label: 'Latest', value: 'latest' },
    { label: 'Price: Low → High', value: 'price_asc' },
    { label: 'Price: High → Low', value: 'price_desc' },
  ]

  return (
    <>
      <Helmet>
        <title>Products — Atik Technology</title>
        <meta name="description" content="Browse all tech products on Atik Technology. Filter by category, price range, and more." />
      </Helmet>

      <div className="container-wide py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-white">
            {categorySlug ? categorySlug.replace(/-/g, ' ') : filter ? `${filter.charAt(0).toUpperCase() + filter.slice(1)} Products` : 'All Products'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{total} products found</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={cn(
            'w-60 shrink-0 space-y-6',
            'hidden lg:block'
          )}>
            <FiltersPanel
              categories={categories}
              categorySlug={categorySlug}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setParam={setParam}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 hover:text-white"
              >
                <SlidersHorizontal size={15} /> Filters
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={sort}
                  onChange={e => setParam('sort', e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {sortOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <div className="flex border border-slate-700 rounded-xl overflow-hidden">
                  <button onClick={() => setView('grid')} className={cn('p-2 transition-colors', view === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white')}>
                    <Grid size={15} />
                  </button>
                  <button onClick={() => setView('list')} className={cn('p-2 transition-colors', view === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white')}>
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? <SkeletonGrid count={12} /> : products.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-lg font-medium text-slate-400">No products found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className={cn(
                view === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'flex flex-col gap-3'
              )}>
                {products.map(p => (
                  view === 'grid' ? (
                    <ProductCard key={p.id} product={p} />
                  ) : (
                    <ProductListItem key={p.id} product={p} />
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <FiltersPanel
              categories={categories}
              categorySlug={categorySlug}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setParam={setParam}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
        </div>
      )}
    </>
  )
}

function FiltersPanel({ categories, categorySlug, minPrice, maxPrice, setParam, searchParams, setSearchParams }: any) {
  const [localMin, setLocalMin] = useState(minPrice || '')
  const [localMax, setLocalMax] = useState(maxPrice === 999999 ? '' : maxPrice || '')

  const applyPrice = () => {
    const p = new URLSearchParams(searchParams)
    if (localMin) p.set('min', localMin); else p.delete('min')
    if (localMax) p.set('max', localMax); else p.delete('max')
    setSearchParams(p)
  }

  const clearAll = () => {
    setSearchParams(new URLSearchParams())
    setLocalMin('')
    setLocalMax('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white text-sm">Filters</h3>
        <button onClick={clearAll} className="text-xs text-blue-400 hover:text-blue-300">Clear all</button>
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Category</p>
        <div className="space-y-1">
          <button
            onClick={() => setParam('category', '')}
            className={cn('block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', !categorySlug ? 'bg-blue-500/15 text-blue-400' : 'text-slate-300 hover:bg-slate-800')}
          >
            All Categories
          </button>
          {categories.map((cat: Category) => (
            <button
              key={cat.id}
              onClick={() => setParam('category', cat.slug)}
              className={cn('block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', categorySlug === cat.slug ? 'bg-blue-500/15 text-blue-400' : 'text-slate-300 hover:bg-slate-800')}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Price Range (৳)</p>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            placeholder="Min"
            value={localMin}
            onChange={e => setLocalMin(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-slate-500 text-xs">–</span>
          <input
            type="number"
            placeholder="Max"
            value={localMax}
            onChange={e => setLocalMax(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button onClick={applyPrice} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors">
          Apply
        </button>
      </div>

      {/* Filter presets */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Show</p>
        <div className="space-y-1">
          {[{ label: 'All Products', val: '' }, { label: 'Featured', val: 'featured' }, { label: 'Trending', val: 'trending' }].map(f => (
            <button
              key={f.val}
              onClick={() => setParam('filter', f.val)}
              className={cn('block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                (searchParams.get('filter') || '') === f.val ? 'bg-blue-500/15 text-blue-400' : 'text-slate-300 hover:bg-slate-800'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductListItem({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const discount = product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0

  return (
    <div className="flex gap-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all">
      <Link to={`/products/${product.slug}`} className="w-36 shrink-0">
        <img src={product.images?.[0] || 'https://placehold.co/200x200/1e293b/475569?text=Product'} alt={product.name} className="w-full h-full object-cover" />
      </Link>
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          {product.category && <p className="text-xs text-blue-400 mb-1">{product.category.name}</p>}
          <Link to={`/products/${product.slug}`}><h3 className="text-base font-medium text-slate-200 hover:text-white line-clamp-2">{product.name}</h3></Link>
          <p className="text-sm text-slate-400 line-clamp-2 mt-1">{product.description}</p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">৳{(product.discount_price ?? product.price).toLocaleString()}</span>
            {discount > 0 && <span className="text-xs text-slate-500 line-through">৳{product.price.toLocaleString()}</span>}
            {discount > 0 && <span className="text-xs text-orange-400 font-medium">-{discount}%</span>}
          </div>
          <button
            onClick={async () => { await addToCart(product) }}
            disabled={product.stock === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}


