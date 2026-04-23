import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'
import { formatPrice, getOrderStatusColor } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'

export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!id) return
    supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(name, images))')
      .eq('id', id)
      .single()
      .then(({ data }) => setOrder(data))
  }, [id])

  return (
    <>
      <Helmet><title>Order Confirmed — AtikTech</title></Helmet>
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Success animation */}
        <div className="w-24 h-24 bg-green-500/15 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-in">
          <CheckCircle size={44} className="text-green-400" />
        </div>
        <h1 className="text-3xl font-display font-black text-white mb-3">Order Placed!</h1>
        <p className="text-slate-400 mb-8">
          Thank you for your order. We'll contact you soon to confirm delivery.
        </p>

        {order ? (
          <>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 text-left mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500">Order ID</p>
                  <p className="font-mono text-sm text-slate-300">#{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getOrderStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {order.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={(item.product as any)?.images?.[0] || 'https://placehold.co/48x48/1e293b/475569?text=P'}
                      alt={(item.product as any)?.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 line-clamp-1">{(item.product as any)?.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-white">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method</span>
                  <span className="text-slate-200 uppercase font-medium">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Charge</span>
                  <span className="text-slate-200">{formatPrice(order.delivery_charge)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-1">
                  <span className="text-white">Total</span>
                  <span className="text-white">{formatPrice(order.total + order.delivery_charge)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={`/account/orders/${order.id}`}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/25"
              >
                <Package size={16} /> Track Order
              </Link>
              <Link
                to="/products"
                className="flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-7 py-3 rounded-xl font-medium transition-colors"
              >
                Continue Shopping <ArrowRight size={16} />
              </Link>
            </div>
          </>
        ) : (
          <div className="animate-pulse">
            <div className="h-48 bg-slate-800/40 border border-slate-700/50 rounded-2xl mb-8"></div>
            <div className="flex justify-center gap-3">
              <div className="h-12 w-32 bg-blue-600/20 rounded-xl"></div>
              <div className="h-12 w-32 bg-slate-700/20 rounded-xl"></div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
