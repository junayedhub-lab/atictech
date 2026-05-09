import { useState } from 'react'
import { User, Phone, MapPin, Save } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Helmet } from 'react-helmet-async'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'

export default function AccountPage() {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  })
  const [saving, setSaving] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-4xl mb-4">🔐</p>
          <h1 className="text-xl font-bold text-white mb-2">Sign in required</h1>
          <Link to="/login" className="text-blue-400 hover:underline">Go to Login</Link>
        </div>
      </div>
    )
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone, address: form.address })
      .eq('id', user?.id)
    if (error || !user) toast.error('Update failed')
    else toast.success('Profile updated!')
    setSaving(false)
  }

  return (
    <>
      <Helmet><title>My Account — Atik Technology</title></Helmet>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
          <User className="text-blue-400" size={24} /> My Account
        </h1>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link to="/account/orders" className="flex items-center gap-4 p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:border-blue-500/40 transition-all group">
            <div className="w-11 h-11 bg-blue-500/15 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">My Orders</p>
              <p className="text-xs text-slate-400">Track & view order history</p>
            </div>
          </Link>
        </div>

        <form onSubmit={save} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-white">Profile Information</h2>

          <div className="flex items-center gap-4 pb-4 border-b border-slate-700/50">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white">
              {form.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium text-white">{form.full_name || 'User'}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
              {profile?.role === 'admin' && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/15 text-purple-400 text-xs rounded-full font-medium">Admin</span>
              )}
            </div>
          </div>

          <Input id="full_name" label="Full Name" value={form.full_name} onChange={set('full_name')} icon={<User size={15} />} placeholder="Your full name" />
          <Input id="phone" label="Phone Number" value={form.phone} onChange={set('phone')} icon={<Phone size={15} />} placeholder="01XXXXXXXXX" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <MapPin size={14} className="text-slate-400" /> Delivery Address
            </label>
            <textarea
              value={form.address}
              onChange={set('address')}
              rows={3}
              placeholder="House, Road, Area, City"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>

          <Button type="submit" loading={saving} className="gap-2">
            <Save size={15} /> Save Changes
          </Button>
        </form>
      </div>
    </>
  )
}
