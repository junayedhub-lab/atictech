import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Helmet } from 'react-helmet-async'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.full_name.trim()) errs.full_name = 'Name is required'
    if (!form.email) errs.email = 'Email is required'
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.full_name)
    if (error) {
      toast.error(error.message || 'Signup failed')
    } else {
      toast.success('Account created! Please check your email to verify.')
      navigate('/login')
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet><title>Create Account — AtikTech</title></Helmet>
      <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-slate-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">A</span>
              </div>
              <span className="font-display font-bold text-xl text-white">Atik<span className="text-blue-400">Tech</span></span>
            </Link>
            <h1 className="text-2xl font-display font-bold text-white mt-6 mb-1">Create account</h1>
            <p className="text-slate-400 text-sm">Join AtikTech and start shopping</p>
          </div>

          <div className="glass bg-slate-900/60 border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/40">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input id="full_name" label="Full Name" placeholder="Your full name" value={form.full_name} onChange={set('full_name')} error={errors.full_name} icon={<User size={15} />} />
              <Input id="email" type="email" label="Email Address" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} icon={<Mail size={15} />} />
              <div className="relative">
                <Input id="password" type={showPw ? 'text' : 'password'} label="Password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} error={errors.password} icon={<Lock size={15} />} />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-8 text-slate-400 hover:text-slate-200">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <Input id="confirm" type="password" label="Confirm Password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} icon={<Lock size={15} />} />
              <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
                Create Account
              </Button>
            </form>
            <div className="mt-6 pt-5 border-t border-slate-700/50 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
