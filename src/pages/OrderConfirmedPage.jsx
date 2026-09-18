import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Check, Package, ArrowRight, ShoppingBag, Truck, CreditCard, ShieldCheck } from 'lucide-react'
import { clarityEvent, clarityTag } from '../lib/analytics'

export default function OrderConfirmedPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showCheck, setShowCheck] = useState(false)

  const orderId = searchParams.get('orderId') || 'N/A'
  const total = searchParams.get('total') || '0'
  const method = searchParams.get('method') || 'COD'
  const paymentId = searchParams.get('paymentId') || null

  // Trigger the checkmark animation after a slight delay on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowCheck(true), 300)
    clarityTag('order_confirmed_id', orderId)
    clarityTag('order_confirmed_total', total)
    clarityTag('order_confirmed_method', method)
    clarityEvent('view_order_confirmed_page')
    return () => clearTimeout(timer)
  }, [orderId, total, method])

  return (
    <>
      {/* Inline keyframe animation styles */}
      <style>{`
        @keyframes checkBounceIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.9;
          }
          70% {
            transform: scale(0.92);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes checkStroke {
          0% {
            stroke-dashoffset: 30;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        .check-circle-animate {
          animation: checkBounceIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .check-stroke-animate {
          animation: checkStroke 0.4s ease-out 0.5s forwards;
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          opacity: 0;
        }
        @keyframes fadeInUp {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .fade-in-up-1 {
          animation: fadeInUp 0.5s ease-out 0.6s forwards;
          opacity: 0;
        }
        .fade-in-up-2 {
          animation: fadeInUp 0.5s ease-out 0.8s forwards;
          opacity: 0;
        }
        .fade-in-up-3 {
          animation: fadeInUp 0.5s ease-out 1.0s forwards;
          opacity: 0;
        }
        .fade-in-up-4 {
          animation: fadeInUp 0.5s ease-out 1.2s forwards;
          opacity: 0;
        }
      `}</style>

      <div className="min-h-screen bg-obsidian text-cream flex flex-col selection:bg-gold selection:text-obsidian">
        {/* Main Content — Centered */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="mx-auto max-w-md w-full text-center">
            {/* Animated Green Checkmark Circle */}
            <div className="flex justify-center mb-6">
              <div
                className={`h-24 w-24 rounded-full flex items-center justify-center ${
                  showCheck ? 'check-circle-animate' : 'opacity-0 scale-0'
                }`}
                style={{ backgroundColor: '#22c55e' }}
              >
                <svg
                  className={showCheck ? 'check-stroke-animate' : 'opacity-0'}
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 12 10 16 18 8" />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-cream tracking-tight fade-in-up-1">
              Order Confirmed!
            </h1>

            {/* Order Number in Gold */}
            <p className="mt-3 text-sm sm:text-base font-bold text-gold tracking-wider fade-in-up-1">
              Order #{orderId}
            </p>

            {/* Thank you subtitle */}
            <p className="mt-2 text-sm text-cream-muted/80 fade-in-up-1">
              Thank you for choosing Smiths Jewellery!
            </p>

            {/* Summary Card */}
            <div className="mt-8 rounded-2xl border border-gold/20 bg-charcoal/70 p-5 sm:p-6 text-left space-y-4 backdrop-blur-sm fade-in-up-2">
              {/* Order Number */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-gold" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-cream-muted">Order Number</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-cream font-mono">#{orderId}</span>
              </div>

              {/* Divider */}
              <div className="border-t border-charcoal-light/70" />

              {/* Total Amount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-4 w-4 text-gold" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-cream-muted">Total Amount</span>
                </div>
                <span className="text-sm sm:text-base font-extrabold text-gold">
                  ₹{Number(total).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-charcoal-light/70" />

              {/* Payment Method / Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-full ${paymentId ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-gold/15 border-gold/30'} border flex items-center justify-center shrink-0`}>
                    {paymentId ? <Check className="h-4 w-4 text-emerald-400" /> : <Check className="h-4 w-4 text-gold" />}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-cream-muted">Payment Status</span>
                </div>
                {paymentId ? (
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 block">
                      Paid & Verified (Razorpay)
                    </span>
                    <span className="text-[10px] text-cream-muted/70 font-mono tracking-tight">
                      ID: {paymentId}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-cream">
                    {method === 'COD' ? 'Cash on Delivery (Pay at door)' : method}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-charcoal-light/70" />

              {/* Estimated Delivery */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                    <Truck className="h-4 w-4 text-gold" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-cream-muted">Estimated Delivery</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-cream">5-7 Business Days</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 space-y-3 fade-in-up-3">
              {/* Track Your Order — Gold CTA */}
              <Link
                to={`/track-order?orderId=${orderId}`}
                className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-gold/25"
              >
                <Truck className="h-4 w-4" />
                <span>Track Your Order</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Continue Shopping — Outlined Gold Border */}
              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-gold/30 bg-obsidian/60 hover:bg-charcoal hover:border-gold py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-gold transition-all duration-300"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-charcoal-light py-4 text-center text-xs text-cream-muted/40 fade-in-up-4">
          © 2026 Smiths Jewellery. All rights reserved.
        </footer>
      </div>
    </>
  )
}
