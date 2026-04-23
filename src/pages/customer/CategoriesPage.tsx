import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types'
import { Helmet } from 'react-helmet-async'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('name')
      setCategories(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <Helmet>
        <title>All Categories — AtikTech</title>
        <meta name="description" content="Browse all product categories on AtikTech." />
      </Helmet>

      <div className="container-wide py-12">
        <div className="max-w-2xl mb-12">
          <h1 className="text-3xl md:text-5xl font-display font-black text-white mb-4">
            Shop by <span className="gradient-text">Category</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Find exactly what you're looking for by browsing our curated collections of premium technology and gadgets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-800/40 border border-slate-700/50 animate-pulse" />
            ))
          ) : (
            categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group relative h-64 rounded-3xl overflow-hidden border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={cat.image_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-slate-300 text-sm line-clamp-2 mb-4 group-hover:text-slate-200 transition-colors">
                      {cat.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold group-hover:gap-3 transition-all">
                    Explore Items <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  )
}
