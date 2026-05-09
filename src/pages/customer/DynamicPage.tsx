import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Helmet } from 'react-helmet-async'
import { Skeleton } from '@/components/ui/Skeleton'

interface PageData {
  title: string
  content: string
  meta_description?: string
}

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single()
      
      setPage(data)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 space-y-4">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-4 w-full rounded-xl" />
        <Skeleton className="h-4 w-full rounded-xl" />
        <Skeleton className="h-4 w-3/4 rounded-xl" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-display font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-slate-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{page.title} — Atik Technology</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-8 border-b border-slate-800 pb-8 tracking-tight">
          {page.title}
        </h1>
        
        <div 
          className="prose prose-invert prose-slate max-w-none 
            prose-headings:font-display prose-headings:font-bold prose-headings:text-white
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-ul:list-disc prose-li:text-slate-300"
          dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br />') }}
        />
      </div>
    </>
  )
}
