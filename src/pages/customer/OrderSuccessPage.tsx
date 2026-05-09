import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  CheckCircle, Package, ArrowRight, Copy, Check,
  MapPin, Phone, CreditCard, Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'

const STATUS_STEPS = [
  { key: 'pending',   label: 'Order Placed',  icon: '📋', desc: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed',      icon: '✅', desc: 'Order confirmed by store' },
  { key: 'shipped',   label: 'Shipped',        icon: '🚚', desc: 'On the way to you' },
  { key: 'delivered', label: 'Delivered',      icon: '🎉', desc: 'Successfully delivered' },
]

function getStepIndex(status: string) {
  const idx = STATUS_STEPS.findIndex(s => s.key === status)
  return idx === -1 ? 0 : idx
}

function OrderSuccessPageContent() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(name, images))')
      .eq('id', id)
      .single()
      .then(({ data }) => setOrder(data))
  }, [id])

  const copyOrderId = () => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Short ID = first 8 chars uppercase — works in the Track Order page
  const shortId = id ? id.slice(0, 8).toUpperCase() : ''

  const stepIndex = order ? getStepIndex(order.status) : 0
  const cancelled = order?.status === 'cancelled'

  return (
    <>
      <Helmet><title>Order Confirmed — Atik Technology</title></Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Hero success card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/10 border border-green-500/30 rounded-3xl p-8 text-center">
            {/* Radial glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
            </div>

            {/* Animated icon */}
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
              <div className="relative w-20 h-20 bg-green-500/15 border-2 border-green-500/40 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-green-400" />
              </div>
            </div>

            <h1 className="text-3xl font-display font-black text-white mb-2">Order Placed! 🎉</h1>
            <p className="text-slate-300 mb-6">
              Thank you for shopping with us. We'll contact you shortly to confirm delivery.
            </p>

            {/* Order ID card */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 max-w-md mx-auto">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-3 font-medium">Your Order ID</p>

              {/* Short ID — big & easy to remember */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3 mb-3 text-center">
                <p className="text-xs text-blue-400 mb-1 font-medium">Short ID (for tracking)</p>
                <p className="font-mono text-3xl text-white font-black tracking-widest">{shortId}</p>
              </div>

              {/* Full UUID */}
              <p className="font-mono text-xs text-slate-400 break-all text-center mb-3">{id}</p>

              <button
                onClick={copyOrderId}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white text-sm px-4 py-2 rounded-xl transition-all font-medium"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Full Order ID'}
              </button>
              <p className="text-xs text-slate-500 mt-3 text-center">
                💡 Use the <span className="text-blue-400 font-mono font-semibold">{shortId}</span> short code to track anytime — no login needed
              </p>
            </div>
          </div>

          {/* Progress tracker */}
          {order && !cancelled && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Clock size={14} className="text-blue-400" /> Order Progress
              </h2>
              <div className="relative">
                {/* Track line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-700" />
                <div
                  className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-700"
                  style={{ width: `${stepIndex === 0 ? 0 : (stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= stepIndex
                    const active = i === stepIndex
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2" style={{ width: '25%' }}>
                        <div className={`
                          w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all duration-500
                          ${done
                            ? active
                              ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/30'
                              : 'border-green-500 bg-green-500/20'
                            : 'border-slate-600 bg-slate-800'}
                        `}>
                          {done ? (active ? step.icon : '✓') : <span className="text-slate-600 text-sm">{i + 1}</span>}
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-semibold ${done ? 'text-white' : 'text-slate-500'}`}>{step.label}</p>
                          <p className="text-xs text-slate-600 hidden sm:block">{step.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {cancelled && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-center">
              <p className="text-red-300 font-semibold">❌ This order has been cancelled</p>
              <p className="text-slate-400 text-sm mt-1">Please contact support for assistance.</p>
            </div>
          )}

          {/* Order details */}
          {order ? (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Order Details</h2>

              {/* Delivery info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/40 rounded-xl p-4 flex gap-3">
                  <MapPin size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Delivery Address</p>
                    <p className="text-sm text-slate-200">{order.address}</p>
                  </div>
                </div>
                <div className="bg-slate-900/40 rounded-xl p-4 flex gap-3">
                  <Phone size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Phone</p>
                    <p className="text-sm text-slate-200">{order.phone}</p>
                  </div>
                </div>
                <div className="bg-slate-900/40 rounded-xl p-4 flex gap-3">
                  <CreditCard size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Payment</p>
                    <p className="text-sm text-slate-200 uppercase font-medium">{order.payment_method}</p>
                    {order.transaction_id && (
                      <p className="text-xs text-yellow-400 font-mono mt-0.5">TrxID: {order.transaction_id}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Items Ordered</p>
                {order.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-slate-900/40 rounded-xl p-3">
                    <img
                      src={(item.product as any)?.images?.[0] || 'https://placehold.co/48x48/1e293b/475569?text=P'}
                      alt={(item.product as any)?.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 line-clamp-1">{(item.product as any)?.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-white shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-slate-700 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-slate-200">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery</span>
                  <span className="text-slate-200">{formatPrice(order.delivery_charge)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-700">
                  <span className="text-white">Total Paid</span>
                  <span className="text-white text-lg">{formatPrice(order.total + order.delivery_charge)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-pulse bg-slate-800/40 border border-slate-700/50 rounded-2xl h-48" />
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/track-order?id=${id}`}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/25"
            >
              <Package size={18} /> Track My Order
            </Link>
            <Link
              to="/products"
              className="flex-1 flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-6 py-3.5 rounded-xl font-semibold transition-all"
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>

              <p className="text-center text-xs text-slate-600">
            Order ID: <span className="font-mono text-slate-500">{id}</span>
          </p>
        </div>
      </div>
    </>
  )
}

import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'

function ErrorFallback({ error }: FallbackProps) {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-4">🚨</div>
      <h1 className="text-2xl font-display font-bold text-red-500 mb-3">Order Success Page Error</h1>
      <p className="text-slate-400 mb-6 font-mono text-sm break-all">{(error as any)?.message || 'Something went wrong'}</p>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <OrderSuccessPageContent />
    </ErrorBoundary>
  )
}
