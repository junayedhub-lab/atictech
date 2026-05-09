import { useEffect, useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product, Category } from '@/types'
import { formatPrice, slugify } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'
import { Skeleton } from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const emptyForm = {
  name: '', slug: '', description: '', price: '', discount_price: '',
  stock: '', category_id: '', tags: '', is_featured: false, is_trending: false,
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProducts()
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []))
  }, [])

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  function openModal(product?: Product) {
    if (product) {
      setEditId(product.id)
      setForm({
        name: product.name, slug: product.slug,
        description: product.description, price: String(product.price),
        discount_price: product.discount_price ? String(product.discount_price) : '',
        stock: String(product.stock), category_id: product.category_id,
        tags: product.tags?.join(', ') || '',
        is_featured: product.is_featured, is_trending: product.is_trending,
      })
      setImages(product.images || [])
    } else {
      setEditId(null)
      setForm(emptyForm)
      setImages([])
    }
    setModalOpen(true)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    const uploaded: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
    }
    setImages(prev => [...prev, ...uploaded])
    setUploading(false)
    toast.success(`${uploaded.length} image(s) uploaded`)
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.stock || !form.category_id) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      price: Number(form.price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      stock: Number(form.stock),
      category_id: form.category_id,
      images,
      tags: (form as any).tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      is_featured: form.is_featured,
      is_trending: form.is_trending,
    }

    if (editId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editId)
      if (error) { toast.error(`Update failed: ${error.message}`); setSaving(false); return }
      toast.success('Product updated!')
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { toast.error(`Create failed: ${error.message}`); setSaving(false); return }
      toast.success('Product created!')
    }
    setModalOpen(false)
    loadProducts()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    toast.success('Product deleted')
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  return (
    <>
      <Helmet><title>Products — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Products</h1>
            <p className="text-slate-400 text-sm mt-1">{products.length} total products</p>
          </div>
          <Button onClick={() => openModal()} className="gap-2">
            <Plus size={16} /> Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Table */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-10 rounded-lg" /></td></tr>
                )) : filtered.map(product => (
                  <tr key={product.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || 'https://placehold.co/48x48/1e293b/475569?text=P'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                        />
                        <div>
                          <p className="font-medium text-slate-200 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{(product as any).category?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{formatPrice(product.discount_price ?? product.price)}</p>
                      {product.discount_price && <p className="text-xs text-slate-500 line-through">{formatPrice(product.price)}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-sm font-medium', product.stock === 0 ? 'text-red-400' : product.stock <= 10 ? 'text-orange-400' : 'text-green-400')}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {product.is_featured && <span className="px-2 py-0.5 bg-blue-500/15 text-blue-400 text-xs rounded-full">Featured</span>}
                        {product.is_trending && <span className="px-2 py-0.5 bg-orange-500/15 text-orange-400 text-xs rounded-full">Trending</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openModal(product)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <div className="py-16 text-center text-slate-500">No products found</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-lg font-semibold text-white">{editId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input id="name" label="Product Name *" value={form.name} onChange={e => { set('name')(e); setForm(f => ({ ...f, slug: slugify(e.target.value) })) }} placeholder="Product name" />
                <Input id="slug" label="Slug" value={form.slug} onChange={set('slug')} placeholder="auto-generated" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  rows={5}
                  placeholder="Product description…"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input id="price" label="Price (৳) *" type="number" value={form.price} onChange={set('price')} placeholder="0" />
                <Input id="discount_price" label="Discount Price (৳)" type="number" value={form.discount_price} onChange={set('discount_price')} placeholder="0" />
                <Input id="stock" label="Stock *" type="number" value={form.stock} onChange={set('stock')} placeholder="0" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Category *</label>
                <select value={form.category_id} onChange={set('category_id')} className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <Input 
                id="tags" 
                label="Tags (comma separated)" 
                value={(form as any).tags} 
                onChange={set('tags')} 
                placeholder="e.g. gaming, laptop, accessories" 
              />

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={set('is_featured')} className="w-4 h-4 rounded accent-blue-500" />
                  <span className="text-sm text-slate-300">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_trending} onChange={set('is_trending')} className="w-4 h-4 rounded accent-orange-500" />
                  <span className="text-sm text-slate-300">Trending</span>
                </label>
              </div>

              {/* Images */}
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Product Images</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-600 hover:border-blue-500 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {uploading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Upload size={18} />}
                    <span className="text-xs">{uploading ? 'Uploading' : 'Upload'}</span>
                  </button>
                </div>
                <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} loading={saving} className="flex-1">
                  {editId ? 'Save Changes' : 'Create Product'}
                </Button>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
