import { useEffect, useState } from 'react'
import { Save, Globe, Phone, Mail, Truck, Image } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Helmet } from 'react-helmet-async'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      const map: Record<string, string> = {}
      for (const s of data || []) map[s.key] = s.value
      setSettings(map)
      setLoading(false)
    })
  }, [])

  async function save() {
    setSaving(true)
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' })
    }
    toast.success('Settings saved!')
    setSaving(false)
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings(s => ({ ...s, [key]: e.target.value }))

  const sections = [
    {
      icon: Globe,
      title: 'Website',
      fields: [
        { key: 'site_name', label: 'Site Name', placeholder: 'Atik Technology' },
        { key: 'site_tagline', label: 'Tagline', placeholder: 'Bangladesh\'s Tech Store' },
        { key: 'logo_url', label: 'Logo URL', placeholder: 'https://…' },
      ]
    },
    {
      icon: Phone,
      title: 'Contact',
      fields: [
        { key: 'contact_phone', label: 'Phone', placeholder: '+880 1XXX-XXXXXX' },
        { key: 'contact_email', label: 'Email', placeholder: 'atikahmed680@gmail.com' },
        { key: 'contact_address', label: 'Address', placeholder: 'Dhaka, Bangladesh' },
      ]
    },
    {
      icon: Truck,
      title: 'Delivery',
      fields: [
        { key: 'delivery_charge_dhaka', label: 'Dhaka Charge (৳)', placeholder: '60' },
        { key: 'delivery_charge_outside', label: 'Outside Dhaka (৳)', placeholder: '120' },
        { key: 'free_delivery_min', label: 'Free Delivery Above (৳)', placeholder: '2000' },
      ]
    },
    {
      icon: Image,
      title: 'Payment Numbers',
      fields: [
        { key: 'bkash_number', label: 'bKash Number', placeholder: '01XXXXXXXXX' },
        { key: 'nagad_number', label: 'Nagad Number', placeholder: '01XXXXXXXXX' },
      ]
    },
  ]

  return (
    <>
      <Helmet><title>Settings — Admin</title></Helmet>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Configure your store settings</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-slate-800/40 border border-slate-700/50 animate-pulse" />)}
          </div>
        ) : (
          sections.map(({ icon: Icon, title, fields }) => (
            <div key={title} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Icon size={16} className="text-blue-400" /> {title}
              </h2>
              {fields.map(f => (
                <Input
                  key={f.key}
                  id={f.key}
                  label={f.label}
                  placeholder={f.placeholder}
                  value={settings[f.key] || ''}
                  onChange={set(f.key)}
                />
              ))}
            </div>
          ))
        )}

        <Button onClick={save} loading={saving} size="lg" className="gap-2">
          <Save size={16} /> Save All Settings
        </Button>
      </div>
    </>
  )
}
