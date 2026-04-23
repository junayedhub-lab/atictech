import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronDown } from 'lucide-react'
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
    const { data } = await supabase
      .from('orders')
      .select('*, profile:profiles(full_name, phone)')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const filtered = orders.filter(o => {
    const matchSearch = o.id.includes(search) || (o.profile as any)?.full_name?.toLowerCase().includes(search.toLowerCase()) || o.phone?.includes(search)
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

  return (
    <>
      <Helmet><title>Orders — Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Orders</h1>
          <p className="text-slate-400 text-sm mt-1">{orders.length} total orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, name, phone…"
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-64" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none">
            <option value="">All Status</option>
            {statuses.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Order', 'Customer', 'Items', 'Payment', 'Status', 'Total', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><Skeleton className="h-10 rounded" /></td></tr>
                )) : filtered.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">#{order.id.slice(0,8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-200 text-xs font-medium">{(order.profile as any)?.full_name || '—'}</p>
                      <p className="text-slate-500 text-xs">{order.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{(order as any).items?.length || '—'} items</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-medium text-slate-300 uppercase">{order.payment_method}</p>
                        <select
                          value={order.payment_status}
                          onChange={e => updatePaymentStatus(order.id, e.target.value)}
                          className="mt-1 bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                        disabled={updatingId === order.id}
                        className={`text-xs font-medium px-2 py-1 rounded-lg border-0 focus:outline-none cursor-pointer bg-slate-800 ${getOrderStatusColor(order.status)}`}
                      >
                        {statuses.map(s => <option key={s} value={s} className="bg-slate-800 text-white capitalize">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-white font-medium text-xs whitespace-nowrap">
                      {formatPrice(order.total + order.delivery_charge)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{timeAgo(order.created_at)}</td>
                    <td className="px-4 py-3">
                      {order.transaction_id && (
                        <p className="text-xs text-yellow-400 font-mono" title="Transaction ID">
                          TxID: {order.transaction_id.slice(0, 8)}…
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <div className="py-12 text-center text-slate-500">No orders found</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
