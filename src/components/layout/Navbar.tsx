import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Search, User, Menu, X, ChevronDown, LogOut, Package, Settings, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price, discount_price, images')
        .ilike('name', `%${searchQuery}%`)
        .limit(6)
      setSearchResults((data as any) || [])
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
    { label: 'Categories', to: '/categories' },
  ]

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-800' : 'bg-transparent'
    )}>
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span className="font-display font-bold text-lg text-white">
              Atik<span className="text-blue-400">Tech</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  location.pathname === link.to
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search + Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div ref={searchRef} className="relative hidden sm:block">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products…"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
                    onFocus={() => setSearchOpen(true)}
                    className="pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 w-52 lg:w-64 transition-all duration-200"
                  />
                </div>
              </form>
              {/* Search Dropdown */}
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fade-in">
                  {searchResults.map(p => (
                    <Link
                      key={p.id}
                      to={`/products/${p.slug}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors"
                    >
                      <img
                        src={p.images?.[0] || '/placeholder.jpg'}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-700"
                      />
                      <div>
                        <p className="text-sm text-slate-200 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-blue-400">৳{(p.discount_price ?? p.price).toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to={`/search?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                    className="block px-4 py-2.5 text-xs text-blue-400 hover:bg-slate-800 border-t border-slate-700 transition-colors"
                  >
                    See all results for "{searchQuery}"
                  </Link>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              id="cart-icon"
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-fade-in">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(p => !p)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown size={14} className={cn('text-slate-400 transition-transform', isUserMenuOpen && 'rotate-180')} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-400 hover:bg-slate-800 transition-colors">
                          <LayoutDashboard size={15} /> Admin Panel
                        </Link>
                      )}
                      <Link to="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                        <User size={15} /> My Profile
                      </Link>
                      <Link to="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                        <Package size={15} /> My Orders
                      </Link>
                    </div>
                    <div className="border-t border-slate-700 py-1">
                      <button
                        onClick={signOut}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800 w-full text-left transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-600/20">
                <User size={15} /> Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(p => !p)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900/98 backdrop-blur-xl border-t border-slate-800 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </form>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  location.pathname === link.to ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                )}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link to="/login" className="block px-4 py-2.5 mt-2 bg-blue-600 text-white rounded-xl text-sm font-medium text-center">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
