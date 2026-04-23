import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types'
import { slugify } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ImageUpload from '@/components/ui/ImageUpload'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
    setLoading(false)
  }

  function openModal(cat?: Category) {
    if (cat) {
      setEditId(cat.id)
      setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image_url: cat.image_url || '' })
    } else {
      setEditId(null)
      setForm({ name: '', slug: '', description: '', image_url: '' })
    }
    setModalOpen(true)
  }

  async function save() {
    if (!form.name) { toast.error('Name is required'); return }
    setSaving(true)
    const payload = { name: form.name, slug: form.slug || slugify(form.name), description: form.description, image_url: form.image_url || null }
    if (editId) {
      await supabase.from('categories').update(payload).eq('id', editId)
      toast.success('Category updated!')
    } else {
      await supabase.from('categories').insert(payload)
      toast.success('Category created!')
    }
    setModalOpen(false)
    load()
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm('Delete this category?')) return
    await supabase.from('categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
    toast.success('Category deleted')
  }

  return (
    <>
      <Helmet><title>Categories — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-white">Categories</h1>
          <Button onClick={() => openModal()}><Plus size={16} /> Add Category</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-800/40 border border-slate-700/50 animate-pulse" />
          )) : categories.map(cat => (
            <div key={cat.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 group hover:border-slate-600 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden">
                  {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(cat)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => del(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-white text-sm">{cat.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{cat.slug}</p>
              {cat.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cat.description}</p>}
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-white">{editId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <Input id="cat-name" label="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="Category name" />
            <Input id="cat-slug" label="Slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" />
            <ImageUpload 
              label="Category Image" 
              value={form.image_url} 
              onChange={url => setForm(f => ({ ...f, image_url: url }))}
              bucket="category-images"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional description…"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <Button onClick={save} loading={saving} fullWidth>{editId ? 'Save' : 'Create'}</Button>
          </div>
        </div>
      )}
    </>
  )
}
