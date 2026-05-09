import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, MessageSquarePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Order } from '@/types'
import { formatPrice, getOrderStatusColor } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'
import { Skeleton } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={14} />,
  confirmed: <CheckCircle size={14} />,
  shipped: <Truck size={14} />,
  delivered: <CheckCircle size={14} />,
  cancelled: <XCircle size={14} />,
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(name, images))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || [])
        setLoading(false)
      })
  }, [user])

  return (
    <>
      <Helmet><title>My Orders — Atik Technology</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
          <Package className="text-blue-400" size={24} /> My Orders
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
            <p className="text-slate-400 mb-6">When you place orders, they'll appear here.</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="block bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/40 hover:bg-slate-800/70 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Order ID</p>
                    <p className="font-mono text-sm font-medium text-slate-200">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${getOrderStatusColor(order.status)}`}>
                      {statusIcons[order.status]} {order.status}
                    </span>
                    <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-2 mb-3">
                  {order.items?.slice(0, 4).map((item, i) => (
                    <img
                      key={i}
                      src={(item.product as any)?.images?.[0] || 'https://placehold.co/40x40/1e293b/475569?text=P'}
                      alt={(item.product as any)?.name || ''}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                    />
                  ))}
                  {(order.items?.length || 0) > 4 && (
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                      +{(order.items?.length || 0) - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>{new Date(order.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>·</span>
                    <span className="uppercase font-medium">{order.payment_method}</span>
                  </div>
                  <div className="flex items-center gap-3 font-semibold text-white">
                    {order.status === 'delivered' && (
                      <span className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        <MessageSquarePlus size={10} /> Review Available
                      </span>
                    )}
                    {formatPrice(order.total + order.delivery_charge)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
