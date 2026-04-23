import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Users,
  Image, CreditCard, Settings, LogOut, Menu, X, ChevronRight, Bell
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
  { icon: Package, label: 'Products', to: '/admin/products' },
  { icon: Tags, label: 'Categories', to: '/admin/categories' },
  { icon: ShoppingBag, label: 'Orders', to: '/admin/orders' },
  { icon: Users, label: 'Users', to: '/admin/users' },
  { icon: Image, label: 'Banners', to: '/admin/banners' },
  { icon: CreditCard, label: 'Payments', to: '/admin/payments' },
  { icon: Settings, label: 'Settings', to: '/admin/settings' },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-900 border-r border-slate-800 fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent navItems={navItems} profile={profile} onSignOut={handleSignOut} />
      </aside>

      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-slate-900 border-r border-slate-800 flex flex-col animate-slide-in-left">
            <SidebarContent navItems={navItems} profile={profile} onSignOut={handleSignOut} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1 text-sm text-slate-500 hidden lg:flex">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-slate-300 capitalize">Panel</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                {profile?.full_name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-medium text-slate-300 hidden sm:block">{profile?.full_name || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ navItems, profile, onSignOut, onClose }: any) {
  return (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <span className="font-display font-bold text-white">Admin Panel</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, to }: any) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
            {profile?.full_name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-slate-500 truncate">Administrator</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition-colors"
        >
          <LogOut size={15} /> Sign Out
        </button>
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
        >
          ← Back to Store
        </NavLink>
      </div>
    </>
  )
}
