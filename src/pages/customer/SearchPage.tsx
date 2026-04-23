import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import ProductCard from '@/components/product/ProductCard'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Helmet } from 'react-helmet-async'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .ilike('name', `%${q}%`)
      .limit(48)
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [q])

  return (
    <>
      <Helmet>
        <title>Search: {q} — AtikTech</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search size={20} className="text-blue-400" />
            <h1 className="text-2xl font-display font-bold text-white">Search Results</h1>
          </div>
          <p className="text-slate-400">
            {loading ? 'Searching…' : `${products.length} result${products.length !== 1 ? 's' : ''} for "${q}"`}
          </p>
        </div>

        {loading ? <SkeletonGrid count={8} /> : products.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-white mb-2">No results found</h2>
            <p className="text-slate-400">Try different keywords or browse our categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </>
  )
}
