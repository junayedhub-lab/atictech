import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Banner } from '@/types'
import { Helmet } from 'react-helmet-async'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ImageUpload from '@/components/ui/ImageUpload'
import toast from 'react-hot-toast'

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', link: '', sort_order: '0', is_active: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('banners').select('*').order('sort_order')
    setBanners(data || [])
    setLoading(false)
  }

  function openModal(b?: Banner) {
    if (b) {
      setEditId(b.id)
      setForm({ title: b.title, subtitle: b.subtitle || '', image_url: b.image_url, link: b.link || '', sort_order: String(b.sort_order), is_active: b.is_active })
    } else {
      setEditId(null)
      setForm({ title: '', subtitle: '', image_url: '', link: '', sort_order: String(banners.length), is_active: true })
    }
    setModalOpen(true)
  }

  async function save() {
    if (!form.title || !form.image_url) { toast.error('Title and image URL are required'); return }
    setSaving(true)
    const payload = { ...form, sort_order: Number(form.sort_order) }
    if (editId) {
      await supabase.from('banners').update(payload).eq('id', editId)
      toast.success('Banner updated!')
    } else {
      await supabase.from('banners').insert(payload)
      toast.success('Banner created!')
    }
    setModalOpen(false)
    load()
    setSaving(false)
  }

  async function toggleActive(b: Banner) {
    await supabase.from('banners').update({ is_active: !b.is_active }).eq('id', b.id)
    setBanners(prev => prev.map(x => x.id === b.id ? { ...x, is_active: !x.is_active } : x))
    toast.success(b.is_active ? 'Banner hidden' : 'Banner visible')
  }

  async function del(id: string) {
    if (!confirm('Delete this banner?')) return
    await supabase.from('banners').delete().eq('id', id)
    setBanners(prev => prev.filter(b => b.id !== id))
    toast.success('Banner deleted')
  }

  return (
    <>
      <Helmet><title>Banners — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-white">Banners</h1>
          <Button onClick={() => openModal()}><Plus size={16} /> Add Banner</Button>
        </div>

        <div className="grid gap-4">
          {loading ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-800/40 border border-slate-700/50 animate-pulse" />
          )) : banners.map(banner => (
            <div key={banner.id} className={`relative rounded-2xl overflow-hidden border transition-all ${banner.is_active ? 'border-blue-500/30' : 'border-slate-700/50 opacity-60'}`}>
              <div className="absolute inset-0">
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-transparent" />
              </div>
              <div className="relative flex items-center justify-between p-5 h-36">
                <div>
                  <p className="font-semibold text-white text-lg">{banner.title}</p>
                  {banner.subtitle && <p className="text-slate-300 text-sm">{banner.subtitle}</p>}
                  <p className="text-slate-500 text-xs mt-1">Order: {banner.sort_order}{banner.link && ` · ${banner.link}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(banner)} className={`p-2 rounded-lg transition-colors ${banner.is_active ? 'text-blue-400 hover:bg-blue-500/10' : 'text-slate-500 hover:bg-slate-700'}`}>
                    {banner.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => openModal(banner)} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => del(banner.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
          {!loading && banners.length === 0 && (
            <div className="py-16 text-center bg-slate-800/40 border border-slate-700/50 rounded-2xl text-slate-500">
              No banners yet. Add one to display on the homepage.
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">{editId ? 'Edit Banner' : 'Add Banner'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <Input id="b-title" label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Banner title" />
            <Input id="b-subtitle" label="Subtitle" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Optional subtitle" />
            <ImageUpload 
              label="Banner Image *" 
              value={form.image_url} 
              onChange={url => setForm(f => ({ ...f, image_url: url }))}
              bucket="banner-images"
            />
            <Input id="b-link" label="Link URL" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="/products or external URL" />
            <Input id="b-order" label="Sort Order" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-blue-500" />
              <span className="text-sm text-slate-300">Active (visible on homepage)</span>
            </label>
            <Button onClick={save} loading={saving} fullWidth>{editId ? 'Save Changes' : 'Create Banner'}</Button>
          </div>
        </div>
      )}
    </>
  )
}
