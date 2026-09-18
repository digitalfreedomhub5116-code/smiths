import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Truck, Package, Clock, ShieldCheck, MapPin, Phone, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import WishlistDrawer from '../components/WishlistDrawer'

export default function ShippingPolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="min-h-screen bg-obsidian text-cream flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-cream-muted hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Store</span>
          </Link>
        </div>

        {/* Hero Header */}
        <header className="border-b border-gold/20 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Truck className="w-3.5 h-3.5 text-gold" />
            <span>Nationwide Express Logistics</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-cream">
            Shipping & Delivery Policy
          </h1>
          <p className="mt-4 text-sm sm:text-base text-cream-muted leading-relaxed max-w-2xl">
            Everything you need to know about our silver craftsmanship, artisan hand-polishing, luxury gift packaging standards, and express courier transit across 29,000+ Indian pincodes.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-gold/80">
            <span>Last Updated: September 2026</span>
            <span>•</span>
            <span>Dispatch Hub: Maharashtra Central Sort Center</span>
            <span>•</span>
            <span>Support: 7470012222</span>
          </div>
        </header>

        {/* Quick Highlights Grid */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <div className="rounded-2xl border border-gold/30 bg-charcoal/80 p-5 backdrop-blur-md">
            <div className="p-2.5 rounded-xl bg-gold/15 text-gold border border-gold/30 w-fit mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="font-heading text-base font-bold text-cream">24–48 Hr Dispatch</h2>
            <p className="text-xs text-cream-muted mt-1.5 leading-relaxed">
              Handcrafted, quality-inspected, and packed within 24 to 48 hours of order confirmation.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/30 bg-charcoal/80 p-5 backdrop-blur-md">
            <div className="p-2.5 rounded-xl bg-gold/15 text-gold border border-gold/30 w-fit mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="font-heading text-base font-bold text-cream">3–7 Days Delivery</h2>
            <p className="text-xs text-cream-muted mt-1.5 leading-relaxed">
              Express domestic courier delivery via Delhivery, BlueDart, DTDC, and Xpressbees.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/30 bg-charcoal/80 p-5 backdrop-blur-md">
            <div className="p-2.5 rounded-xl bg-gold/15 text-gold border border-gold/30 w-fit mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="font-heading text-base font-bold text-cream">Shockproof Shield</h2>
            <p className="text-xs text-cream-muted mt-1.5 leading-relaxed">
              Signature midnight velvet gift boxes ensuring zero transit damage to fine silver craftsmanship.
            </p>
          </div>
        </div>

        {/* Structured Policy Details */}
        <article className="space-y-10 text-sm leading-relaxed text-cream-muted/90">
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">01.</span>
              <span>Order Processing & Workshop Queue</span>
            </h2>
            <p>
              Each Smiths Jewellery piece is crafted using 925 sterling silver, followed by meticulous hand-polishing, rhodium lustering, and gemstone inspection.
            </p>
            <p>
              Orders confirmed before 2:00 PM IST on working business days enter the print queue on the same day. Standard turnaround from queue entry to courier handover is 24 to 48 hours. During limited drop windows or high-volume festive seasons, please allow up to 72 hours for careful artisanal inspection before dispatch.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">02.</span>
              <span>Domestic Shipping Rates & Thresholds</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 pl-2 text-cream-muted">
              <li>
                <strong className="text-cream">Orders Above ₹999:</strong> Free Express Surface/Air Shipping across all serviceable Indian pincodes.
              </li>
              <li>
                <strong className="text-cream">Standard Prepaid Orders (Under ₹999):</strong> Flat nominal logistics fee of ₹60 calculated transparently at checkout.
              </li>
              <li>
                <strong className="text-cream">Cash on Delivery (COD):</strong> Available on eligible pincodes with an optional ₹40 courier handling fee for cash verification services.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">03.</span>
              <span>Real-Time Live Tracking</span>
            </h2>
            <p>
              The moment your parcel is assigned an Air Waybill (AWB) number and manifests with our logistics hub, you will receive:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-cream-muted">
              <li>An automated SMS / WhatsApp confirmation containing your direct courier tracking link.</li>
              <li>Live interactive tracking anytime right on our store via <Link to="/track-order" className="text-gold font-semibold underline">Order Tracking Portal</Link> using your Order ID or phone number.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">04.</span>
              <span>Damaged or Delayed Parcels</span>
            </h2>
            <p>
              If your parcel arrives with visible exterior packaging trauma, please record a continuous unboxing video as outlined in our Terms of Service. In case of courier transit delays beyond 7 business days, our logistics coordinator will promptly investigate with the carrier hub and escalate for expedited delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">05.</span>
              <span>Helpline & Logistics Support</span>
            </h2>
            <p>
              Need an address update or urgent shipment intervention? Contact our dispatch coordinator directly:
            </p>
            <div className="rounded-2xl border border-gold/30 bg-charcoal/80 p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <span className="text-cream font-medium">Customer Support Helpline:</span>
                <a href="tel:7470012222" className="text-gold font-bold hover:underline font-mono">
                  7470012222
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold shrink-0" />
                <span className="text-cream font-medium">Dispatch Desk Email:</span>
                <a href="mailto:support@smithsjewellery.com" className="text-gold font-bold hover:underline font-mono">
                  support@smithsjewellery.com
                </a>
              </div>
            </div>
          </section>
        </article>
      </main>

      <Footer />
      <CartDrawer />
      <WishlistDrawer />
    </div>
  )
}
