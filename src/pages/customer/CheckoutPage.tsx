import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Phone, MapPin, User, FileText, CheckCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import type { PaymentMethod } from '@/types'
import { Helmet } from 'react-helmet-async'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const DELIVERY_CHARGE = 80

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    notes: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.address.trim()) e.address = 'Address is required'
    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !transactionId.trim()) {
      e.transactionId = 'Transaction ID is required for this payment method'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !user) return
    setLoading(true)

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
          transaction_id: transactionId || null,
          total: total,
          delivery_charge: DELIVERY_CHARGE,
          address: form.address,
          phone: form.phone,
          notes: form.notes || null,
        })
        .select()
        .single()

      if (orderError || !order) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product!.discount_price ?? item.product!.price,
      }))

      await supabase.from('order_items').insert(orderItems)

      // Clear cart
      await clearCart()

      toast.success('Order placed successfully! 🎉')
      navigate(`/order-success/${order.id}`)
    } catch {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const paymentOptions: { value: PaymentMethod; label: string; icon: string; desc: string }[] = [
    { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive your order' },
    { value: 'bkash', label: 'bKash', icon: '📱', desc: 'Send to 01XXXXXXXXX · Personal' },
    { value: 'nagad', label: 'Nagad', icon: '💳', desc: 'Send to 01XXXXXXXXX · Personal' },
  ]

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <>
      <Helmet>
        <title>Checkout — AtikTech</title>
      </Helmet>

      <div className="container-wide py-10">
        <h1 className="text-2xl font-display font-bold text-white mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-3 space-y-7">
              {/* Delivery Info */}
              <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <MapPin size={16} className="text-blue-400" /> Delivery Information
                </h2>
                <Input
                  id="full_name"
                  label="Full Name"
                  placeholder="Your full name"
                  value={form.full_name}
                  onChange={set('full_name')}
                  error={errors.full_name}
                  icon={<User size={15} />}
                />
                <Input
                  id="phone"
                  label="Phone Number"
                  placeholder="01XXXXXXXXX"
                  value={form.phone}
                  onChange={set('phone')}
                  error={errors.phone}
                  icon={<Phone size={15} />}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Delivery Address</label>
                  <textarea
                    placeholder="House no, Road no, Area, City"
                    value={form.address}
                    onChange={set('address')}
                    rows={3}
                    className={cn(
                      'w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all',
                      errors.address && 'border-red-500'
                    )}
                  />
                  {errors.address && <p className="text-xs text-red-400">{errors.address}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Order Notes <span className="text-slate-500">(optional)</span></label>
                  <textarea
                    placeholder="Any special instructions for delivery…"
                    value={form.notes}
                    onChange={set('notes')}
                    rows={2}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </section>

              {/* Payment */}
              <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <CreditCard size={16} className="text-blue-400" /> Payment Method
                </h2>
                <div className="space-y-3">
                  {paymentOptions.map(opt => (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                        paymentMethod === opt.value
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{opt.label}</p>
                        <p className="text-xs text-slate-400">{opt.desc}</p>
                      </div>
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 transition-all',
                        paymentMethod === opt.value ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                      )} />
                    </label>
                  ))}
                </div>

                {/* Transaction ID for bKash / Nagad */}
                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-yellow-200">
                      <strong>Instructions:</strong> Send {formatPrice(total + DELIVERY_CHARGE)} to{' '}
                      <span className="font-mono font-bold">01XXXXXXXXX</span> ({paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} · Personal).
                      Then enter the Transaction ID below.
                    </p>
                    <Input
                      id="transaction_id"
                      label="Transaction ID (TrxID)"
                      placeholder="e.g. ABC123DEF456"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      error={errors.transactionId}
                      icon={<FileText size={15} />}
                    />
                  </div>
                )}
              </section>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 sticky top-24 space-y-5">
                <h2 className="font-semibold text-white">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map(item => {
                    const product = item.product!
                    const price = product.discount_price ?? product.price
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={product.images?.[0] || 'https://placehold.co/64x64/1e293b/475569?text=P'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                          />
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 line-clamp-2">{product.name}</p>
                        </div>
                        <p className="text-sm font-medium text-white shrink-0">{formatPrice(price * item.quantity)}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-slate-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-slate-200">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Delivery</span>
                    <span className="text-slate-200">{formatPrice(DELIVERY_CHARGE)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-slate-700">
                    <span className="text-white">Total</span>
                    <span className="text-xl text-white">{formatPrice(total + DELIVERY_CHARGE)}</span>
                  </div>
                </div>

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  <CheckCircle size={18} /> Place Order
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
