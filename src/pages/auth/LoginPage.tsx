import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Helmet } from 'react-helmet-async'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import logo from '@/assets/logo.png'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!email) errs.email = 'Email is required'
    if (!password) errs.password = 'Password is required'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error('Invalid email or password')
      setErrors({ password: 'Invalid credentials' })
    } else {
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Sign In — Atik Technology</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-slate-950">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <img src={logo} alt="Atik Technology" className="w-10 h-10 object-contain" />
              <span className="font-display font-bold text-xl text-white">
                Atik <span className="text-blue-400">Technology</span>
              </span>
            </Link>
            <h1 className="text-2xl font-display font-bold text-white mt-6 mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your account to continue</p>
          </div>

          <div className="glass bg-slate-900/60 border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/40">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={errors.email}
                icon={<Mail size={15} />}
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  label="Password"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  error={errors.password}
                  icon={<Lock size={15} />}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" fullWidth size="lg" loading={loading}>
                <Zap size={16} /> Sign In
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-700/50 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
