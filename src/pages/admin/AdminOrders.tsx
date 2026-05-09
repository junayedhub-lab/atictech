import { useEffect, useState } from 'react'
import { Search, RefreshCw, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/types'
import { formatPrice, getOrderStatusColor, timeAgo } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

const statuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*, profile:profiles(full_name, phone), items:order_items(id)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('AdminOrders load error:', error)
      toast.error(`Error: ${error.message}`)
    }
    setOrders(data || [])
    setLoading(false)
  }

  // Get display name: prefer profile (logged-in user), fallback to customer_name (guest)
  function getCustomerName(order: any): string {
    return (order.profile as any)?.full_name || order.customer_name || '—'
  }

  function getCustomerPhone(order: any): string {
    return (order.profile as any)?.phone || order.phone || '—'
  }

  const filtered = orders.filter(o => {
    const name = getCustomerName(o).toLowerCase()
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      name.includes(search.toLowerCase()) ||
      (o.phone || '').includes(search)
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId)
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) { toast.error('Update failed') }
    else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      toast.success(`Status updated to ${status}`)
    }
    setUpdatingId(null)
  }

  async function updatePaymentStatus(orderId: string, paymentStatus: string) {
    const { error } = await supabase.from('orders').update({ payment_status: paymentStatus }).eq('id', orderId)
    if (error) { toast.error('Update failed') }
    else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: paymentStatus as any } : o))
      toast.success('Payment status updated')
    }
  }

  const statusCounts = statuses.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <Helmet><title>Orders — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Orders</h1>
            <p className="text-slate-400 text-sm mt-1">{orders.length} total orders</p>
          </div>
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-xl transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Status summary chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !statusFilter ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            All ({orders.length})
          </button>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === s ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {s} ({statusCounts[s] || 0})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, name, phone…"
            className="pl-9 pr-4 py-2 w-full bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Table */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Order ID', 'Customer', 'Items', 'Payment', 'Status', 'Total', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-10 rounded" /></td></tr>
                  ))
                  : filtered.map(order => (
                    <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                      {/* Order ID */}
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-slate-300">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="font-mono text-xs text-slate-600 truncate max-w-[120px]" title={order.id}>{order.id}</p>
                        {!(order as any).user_id && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-400 mt-0.5">
                            <User size={10} /> Guest
                          </span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <p className="text-slate-200 text-xs font-medium">{getCustomerName(order)}</p>
                        <p className="text-slate-500 text-xs">{getCustomerPhone(order)}</p>
                      </td>

                      {/* Items count */}
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {(order as any).items?.length ?? '—'} item{(order as any).items?.length !== 1 ? 's' : ''}
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-slate-300 uppercase">{order.payment_method}</p>
                        {order.transaction_id && (
                          <p className="text-xs text-yellow-400 font-mono mt-0.5" title={order.transaction_id}>
                            {order.transaction_id.slice(0, 10)}…
                          </p>
                        )}
                        <select
                          value={order.payment_status}
                          onChange={e => updatePaymentStatus(order.id, e.target.value)}
                          className="mt-1 bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                          disabled={updatingId === order.id}
                          className={`text-xs font-medium px-2 py-1.5 rounded-lg border-0 focus:outline-none cursor-pointer bg-slate-800 ${getOrderStatusColor(order.status)}`}
                        >
                          {statuses.map(s => (
                            <option key={s} value={s} className="bg-slate-800 text-white capitalize">{s}</option>
                          ))}
                        </select>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-white font-semibold text-xs whitespace-nowrap">
                        {formatPrice(order.total + order.delivery_charge)}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {timeAgo(order.created_at)}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-slate-500 text-sm">No orders found</p>
                {search && <p className="text-slate-600 text-xs mt-1">Try clearing your search</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
