import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Package, Clock, Truck, CheckCircle, XCircle, MapPin, Phone, CreditCard } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'
import { formatPrice, getOrderStatusColor } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'
import { Skeleton } from '@/components/ui/Skeleton'

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={18} />,
  confirmed: <CheckCircle size={18} />,
  shipped: <Truck size={18} />,
  delivered: <CheckCircle size={18} />,
  cancelled: <XCircle size={18} />,
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(name, images, price, discount_price))')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setOrder(data)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
        <p className="text-slate-400 mb-6">We couldn't find the order you're looking for.</p>
        <Link to="/account/orders" className="text-blue-400 hover:underline flex items-center gap-1">
          <ChevronLeft size={16} /> Back to My Orders
        </Link>
      </div>
    )
  }

  return (
    <>
      <Helmet><title>Order #{order.id.slice(0, 8).toUpperCase()} — AtikTech</title></Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/account/orders" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-6">
          <ChevronLeft size={16} /> Back to My Orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Order Details</h1>
            <p className="text-sm text-slate-500 font-mono mt-1">#{order.id.toUpperCase()}</p>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold capitalize ${getOrderStatusColor(order.status)}`}>
            {statusIcons[order.status]}
            {order.status}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/50">
                <h3 className="font-semibold text-white">Order Items</h3>
              </div>
              <div className="divide-y divide-slate-700/50">
                {order.items?.map(item => (
                  <div key={item.id} className="p-6 flex items-center gap-4">
                    <img
                      src={(item.product as any)?.images?.[0] || 'https://placehold.co/64x64/1e293b/475569?text=P'}
                      alt={(item.product as any)?.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-1">{(item.product as any)?.name}</p>
                      <p className="text-xs text-slate-400 mt-1">Unit Price: {formatPrice(item.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800/20 p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-slate-200">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Delivery Charge</span>
                  <span className="text-slate-200">{formatPrice(order.delivery_charge)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-slate-700/50">
                  <span className="text-white">Total Amount</span>
                  <span className="text-blue-400">{formatPrice(order.total + order.delivery_charge)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-blue-400" /> Delivery
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Address</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{order.address}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Phone</p>
                  <p className="text-sm text-slate-300 flex items-center gap-2">
                    <Phone size={14} className="text-slate-500" /> {order.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-blue-400" /> Payment
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Method</p>
                  <p className="text-sm text-slate-300 uppercase font-medium">{order.payment_method}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${order.payment_status === 'approved' ? 'bg-green-500' : order.payment_status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    <p className="text-sm text-slate-300 capitalize">{order.payment_status}</p>
                  </div>
                </div>
                {order.transaction_id && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Transaction ID</p>
                    <p className="text-xs font-mono text-slate-400 bg-slate-900/50 px-2 py-1 rounded select-all">
                      {order.transaction_id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="px-6 text-center">
              <p className="text-[10px] text-slate-600">
                Order placed on {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
