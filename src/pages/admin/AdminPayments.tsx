import { useEffect, useState } from 'react'
import { Check, X, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'
import { formatPrice, timeAgo } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'
import { Skeleton } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'

export default function AdminPayments() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, profile:profiles(full_name, phone)')
      .in('payment_method', ['bkash', 'nagad'])
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [])

  async function updatePayment(id: string, status: 'approved' | 'rejected') {
    await supabase.from('orders').update({ payment_status: status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: status } : o))
    toast.success(`Payment ${status}`)
  }

  const pending = orders.filter(o => o.payment_status === 'pending')
  const processed = orders.filter(o => o.payment_status !== 'pending')

  return (
    <>
      <Helmet><title>Payments — Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Payment Verification</h1>
          <p className="text-slate-400 text-sm mt-1">Verify bKash & Nagad manual payments</p>
        </div>

        {/* Pending */}
        <div>
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" /> Pending Verification ({pending.length})
          </h2>
          <div className="space-y-3">
            {loading ? Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-24 rounded-2xl" />) :
              pending.length === 0 ? <p className="text-slate-500 text-sm py-4">No pending payments</p> :
              pending.map(order => <PaymentRow key={order.id} order={order} onApprove={() => updatePayment(order.id, 'approved')} onReject={() => updatePayment(order.id, 'rejected')} />)
            }
          </div>
        </div>

        {/* Processed */}
        {processed.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Processed ({processed.length})</h2>
            <div className="space-y-3">
              {processed.map(order => <PaymentRow key={order.id} order={order} />)}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function PaymentRow({ order, onApprove, onReject }: { order: Order; onApprove?: () => void; onReject?: () => void }) {
  const isPending = order.payment_status === 'pending'
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm text-slate-300">#{order.id.slice(0,8).toUpperCase()}</span>
          <Badge variant={order.payment_method === 'bkash' ? 'info' : 'purple'}>{order.payment_method}</Badge>
          <Badge variant={order.payment_status === 'approved' ? 'success' : order.payment_status === 'rejected' ? 'danger' : 'warning'}>
            {order.payment_status}
          </Badge>
        </div>
        <p className="text-sm text-slate-400">{(order.profile as any)?.full_name} · {order.phone}</p>
        {order.transaction_id && (
          <p className="text-xs font-mono bg-slate-700/50 inline-block px-2 py-0.5 rounded text-yellow-300">
            TxID: {order.transaction_id}
          </p>
        )}
        <p className="text-xs text-slate-500">{timeAgo(order.created_at)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-white">{formatPrice(order.total + order.delivery_charge)}</p>
      </div>
      {isPending && (
        <div className="flex gap-2">
          <button onClick={onApprove} className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl text-sm font-medium transition-colors">
            <Check size={14} /> Approve
          </button>
          <button onClick={onReject} className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-colors">
            <X size={14} /> Reject
          </button>
        </div>
      )}
    </div>
  )
}
