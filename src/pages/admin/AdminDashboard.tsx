import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Users, Package, DollarSign, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice, getOrderStatusColor, timeAgo } from '@/lib/utils'
import type { Order } from '@/types'
import { Helmet } from 'react-helmet-async'
import { Skeleton } from '@/components/ui/Skeleton'

interface Stats {
  orders: number
  revenue: number
  users: number
  products: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ orders: 0, revenue: 0, users: 0, products: 0 })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [ordersRes, usersRes, productsRes, recentRes] = await Promise.all([
        supabase.from('orders').select('total, delivery_charge'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('*, profile:profiles(full_name)').order('created_at', { ascending: false }).limit(8),
      ])

      const orders = ordersRes.data || []
      const revenue = orders.reduce((s, o) => s + o.total + o.delivery_charge, 0)
      setStats({
        orders: orders.length,
        revenue,
        users: usersRes.count || 0,
        products: productsRes.count || 0,
      })
      setRecentOrders(recentRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { icon: ShoppingBag, label: 'Total Orders', value: stats.orders, color: 'blue', link: '/admin/orders' },
    { icon: DollarSign, label: 'Total Revenue', value: formatPrice(stats.revenue), color: 'green', link: '/admin/payments' },
    { icon: Users, label: 'Total Users', value: stats.users, color: 'purple', link: '/admin/users' },
    { icon: Package, label: 'Total Products', value: stats.products, color: 'orange', link: '/admin/products' },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/15 text-blue-400',
    green: 'bg-green-500/15 text-green-400',
    purple: 'bg-purple-500/15 text-purple-400',
    orange: 'bg-orange-500/15 text-orange-400',
  }

  return (
    <>
      <Helmet><title>Dashboard — Admin</title></Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Overview of your store performance</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ icon: Icon, label, value, color, link }) => (
            <Link
              key={label}
              to={link}
              className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                  <Icon size={18} />
                </div>
                <TrendingUp size={14} className="text-slate-600 group-hover:text-green-400 transition-colors" />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
              )}
              <p className="text-xs text-slate-400">{label}</p>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock size={16} className="text-blue-400" /> Recent Orders
            </h2>
            <Link to="/admin/orders" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No orders yet</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentOrders.map(order => (
                <Link
                  key={order.id}
                  to={`/admin/orders`}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-slate-300">#{order.id.slice(0,8).toUpperCase()}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(order.profile as any)?.full_name || 'Customer'} · {timeAgo(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-white">{formatPrice(order.total + order.delivery_charge)}</p>
                    <p className="text-xs text-slate-500 uppercase">{order.payment_method}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-600 group-hover:text-white transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
