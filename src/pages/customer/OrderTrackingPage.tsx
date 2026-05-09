import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search, Package, MapPin, Phone, CreditCard,
  Clock, CheckCircle, Truck, XCircle, ClipboardList
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'

const STATUS_STEPS = [
  {
    key: 'pending',
    label: 'Order Placed',
    desc: 'We have received your order',
    icon: ClipboardList,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500',
    glow: 'shadow-yellow-500/30',
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    desc: 'Your order is confirmed & being prepared',
    icon: CheckCircle,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500',
    glow: 'shadow-blue-500/30',
  },
  {
    key: 'shipped',
    label: 'Shipped',
    desc: 'Your order is on the way',
    icon: Truck,
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500',
    glow: 'shadow-purple-500/30',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    desc: 'Successfully delivered to you',
    icon: Package,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500',
    glow: 'shadow-green-500/30',
  },
]

function getStepIndex(status: string) {
  const idx = STATUS_STEPS.findIndex(s => s.key === status)
  return idx === -1 ? 0 : idx
}

function getStatusBarWidth(stepIndex: number) {
  if (stepIndex === 0) return '0%'
  return `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%`
}

export default function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [inputId, setInputId] = useState(searchParams.get('id') || '')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  // Auto-search if id is in URL
  useEffect(() => {
    const idFromUrl = searchParams.get('id')
    if (idFromUrl) {
      setInputId(idFromUrl)
      searchOrder(idFromUrl)
    }
  }, [])

  async function searchOrder(orderId?: string) {
    const rawId = (orderId ?? inputId).trim()
    if (!rawId) {
      setError('Please enter an Order ID')
      return
    }
    setLoading(true)
    setError('')
    setOrder(null)
    setSearched(true)

    try {
      // If user entered a short ID (no dashes), resolve it to a full UUID via RPC
      let finalId = rawId
      if (!rawId.includes('-')) {
        const { data: resolvedId, error: rpcError } = await supabase
          .rpc('find_order_id_by_prefix', { search_prefix: rawId })

        if (rpcError || !resolvedId) {
          setError('No order found with this ID. Please check and try again.')
          setLoading(false)
          return
        }
        finalId = resolvedId as string
        setInputId(finalId) // Show the full UUID in the input
      }

      const { data, error: dbError } = await supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(name, images))')
        .eq('id', finalId)
        .maybeSingle()

      if (dbError || !data) {
        setError('No order found with this ID. Please check and try again.')
      } else {
        setOrder(data)
        setSearchParams({ id: finalId })
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stepIndex = order ? getStepIndex(order.status) : 0
  const cancelled = order?.status === 'cancelled'
  const activeStep = !cancelled ? STATUS_STEPS[stepIndex] : null

  return (
    <>
      <Helmet>
        <title>Track Order — Atik Technology</title>
        <meta name="description" content="Track your order status with your Order ID" />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/15 border border-blue-500/30 rounded-2xl mb-4">
              <Package size={28} className="text-blue-400" />
            </div>
            <h1 className="text-3xl font-display font-black text-white mb-2">Track Your Order</h1>
            <p className="text-slate-400">Enter your Order ID to see real-time delivery status</p>
          </div>

          {/* Search box */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Order ID</label>
            <div className="flex gap-3">
              <input
                id="order-id-input"
                type="text"
                value={inputId}
                onChange={e => { setInputId(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && searchOrder()}
                placeholder="Short ID (e.g. 343667A0) or full Order ID…"
                className="flex-1 bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              <button
                id="track-order-btn"
                onClick={() => searchOrder()}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 shrink-0"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                {loading ? 'Searching…' : 'Track'}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <XCircle size={14} /> {error}
              </p>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Enter your <span className="text-slate-400 font-medium">Short ID</span> (8 characters shown on the confirmation page) or the full Order ID.
            </p>
          </div>

          {/* Result */}
          {order && (
            <div className="space-y-5 animate-fade-in">

              {/* Status header */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                {/* Top stripe */}
                <div className={`h-1 w-full ${cancelled ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-green-500'}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Order ID</p>
                      <p className="font-mono text-xs text-slate-400 break-all">{order.id}</p>
                    </div>
                    {cancelled ? (
                      <span className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold rounded-full uppercase shrink-0">
                        Cancelled
                      </span>
                    ) : (
                      <span className={`px-3 py-1.5 ${activeStep?.bg} border ${activeStep?.border}/40 ${activeStep?.color} text-xs font-bold rounded-full uppercase shrink-0 capitalize`}>
                        {order.status}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {!cancelled && (
                    <>
                      {/* Desktop: horizontal steps */}
                      <div className="hidden sm:block">
                        <div className="relative mb-2">
                          {/* Base track */}
                          <div className="absolute top-5 left-5 right-5 h-1 bg-slate-700 rounded-full" />
                          {/* Filled track */}
                          <div
                            className="absolute top-5 left-5 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-1000"
                            style={{ width: `calc(${getStatusBarWidth(stepIndex)} - 10px)` }}
                          />
                          {/* Nodes */}
                          <div className="relative flex justify-between">
                            {STATUS_STEPS.map((step, i) => {
                              const done = i <= stepIndex
                              const active = i === stepIndex
                              const Icon = step.icon
                              return (
                                <div key={step.key} className="flex flex-col items-center" style={{ width: '25%' }}>
                                  <div className={`
                                    w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500
                                    ${done
                                      ? active
                                        ? `${step.border} ${step.bg} shadow-lg ${step.glow}`
                                        : 'border-green-500 bg-green-500/20'
                                      : 'border-slate-600 bg-slate-800'}
                                  `}>
                                    <Icon size={16} className={done ? (active ? step.color : 'text-green-400') : 'text-slate-600'} />
                                  </div>
                                  <p className={`text-xs font-semibold mt-2 text-center ${done ? 'text-white' : 'text-slate-600'}`}>
                                    {step.label}
                                  </p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Mobile: vertical steps */}
                      <div className="sm:hidden space-y-0">
                        {STATUS_STEPS.map((step, i) => {
                          const done = i <= stepIndex
                          const active = i === stepIndex
                          const Icon = step.icon
                          const isLast = i === STATUS_STEPS.length - 1
                          return (
                            <div key={step.key} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`
                                  w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                                  ${done
                                    ? active
                                      ? `${step.border} ${step.bg} shadow-md ${step.glow}`
                                      : 'border-green-500 bg-green-500/20'
                                    : 'border-slate-600 bg-slate-800'}
                                `}>
                                  <Icon size={14} className={done ? (active ? step.color : 'text-green-400') : 'text-slate-600'} />
                                </div>
                                {!isLast && (
                                  <div className={`w-0.5 flex-1 my-1 ${done ? 'bg-green-500/40' : 'bg-slate-700'}`} style={{ minHeight: 24 }} />
                                )}
                              </div>
                              <div className="pb-5 pt-1.5">
                                <p className={`text-sm font-semibold ${done ? 'text-white' : 'text-slate-600'}`}>{step.label}</p>
                                <p className={`text-xs ${done ? 'text-slate-400' : 'text-slate-700'}`}>{step.desc}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Current status message */}
                      {activeStep && (
                        <div className={`mt-4 flex items-center gap-3 ${activeStep.bg} border ${activeStep.border}/30 rounded-xl p-3`}>
                          <Clock size={14} className={activeStep.color} />
                          <p className={`text-sm font-medium ${activeStep.color}`}>{activeStep.desc}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Order details */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Order Information</h2>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-slate-900/40 rounded-xl p-4 flex gap-3">
                    <MapPin size={15} className="text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Delivery Address</p>
                      <p className="text-sm text-slate-200">{order.address}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-4 flex gap-3">
                    <Phone size={15} className="text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                      <p className="text-sm text-slate-200">{order.phone}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-4 flex gap-3">
                    <CreditCard size={15} className="text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Payment</p>
                      <p className="text-sm text-slate-200 uppercase font-medium">{order.payment_method}</p>
                      <p className={`text-xs font-medium mt-0.5 ${
                        order.payment_status === 'approved' ? 'text-green-400' :
                        order.payment_status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                      }`}>{order.payment_status}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Items</p>
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-slate-900/40 rounded-xl p-3">
                        <img
                          src={(item.product as any)?.images?.[0] || 'https://placehold.co/48x48/1e293b/475569?text=P'}
                          alt={(item.product as any)?.name}
                          className="w-11 h-11 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 line-clamp-1">{(item.product as any)?.name}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-white shrink-0">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
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
                    <span className="text-white">Total</span>
                    <span className="text-white">{formatPrice(order.total + order.delivery_charge)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state after search */}
          {searched && !loading && !order && !error && (
            <div className="text-center py-12 text-slate-500">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p>No order found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
