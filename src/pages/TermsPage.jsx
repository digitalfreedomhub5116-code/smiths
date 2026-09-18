import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Scale, ShieldAlert, FileText, CheckCircle2, Phone, Mail, ArrowLeft, AlertTriangle, Sparkles, Layers } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import WishlistDrawer from '../components/WishlistDrawer'

export default function TermsPage() {
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
            <Scale className="w-3.5 h-3.5 text-gold" />
            <span>Official Client Agreement</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-cream">
            Terms of Service & Usage Agreement
          </h1>
          <p className="mt-4 text-sm sm:text-base text-cream-muted leading-relaxed max-w-2xl">
            Governing the access, registration, authentication, and purchasing of fine 925 sterling silver jewellery crafted by Smiths Jewellery.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-gold/80">
            <span>Effective Date: September 2026</span>
            <span>•</span>
            <span>Version: 3.4 Master</span>
            <span>•</span>
            <span>Support Helpline: 7470012222</span>
          </div>
        </header>

        {/* Binding Consent Alert Box */}
        <div className="rounded-2xl border border-gold/40 bg-charcoal/90 p-6 sm:p-8 mb-12 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gold/15 text-gold border border-gold/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-cream">
                Binding Legal Agreement Upon Account Access & Orders
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-cream-muted leading-relaxed">
                <strong className="text-gold font-bold">PLEASE READ CAREFULLY:</strong> By accessing, browsing, registering an account, authenticating via email OTP or Google Sign-In, or placing an order (prepaid or Cash on Delivery) with Smiths Jewellery, you expressly, voluntarily, and unconditionally agree to be legally bound by every provision, covenant, and restriction contained within these Terms of Service. If you do not agree with any clause of these terms, you must immediately discontinue use of this platform and abstain from placing orders.
              </p>
            </div>
          </div>
        </div>

        {/* Comprehensive Terms Clauses */}
        <article className="space-y-10 text-sm leading-relaxed text-cream-muted/90">
          {/* Clause 1 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">01.</span>
              <span>Account Creation, Authentication & Client Obligations</span>
            </h2>
            <p>
              By creating an account, logging in, or maintaining an active profile on Smiths Jewellery, you warrant that you are at least 18 years of age (or possess valid parental/guardian supervision if a minor) and that all information submitted during account registration and checkout is truthful, accurate, and up to date.
            </p>
            <p>
              You assume full legal and operational responsibility for maintaining the confidentiality of your login credentials, magic link tokens, and browser session access. Any activity originating from your authenticated session or verified mobile telephone number shall be deemed authorized by you. If you suspect unauthorized access to your account, you must immediately contact our studio support helpline at <strong className="text-gold font-mono">7470012222</strong>.
            </p>
          </section>

          {/* Clause 2 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">02.</span>
              <span>Intellectual Property & Proprietary Designs</span>
            </h2>
            <p>
              Smiths Jewellery conceives, crafts, and presents proprietary silver jewellery designs. All custom CAD models, casting molds, rhodium finishing techniques, hallmark engravings, product photography, editorial typography, brand hallmarks, and digital user interfaces are the proprietary intellectual property of Smiths Jewellery.
            </p>
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
              <strong className="font-bold text-rose-200 uppercase tracking-wider block mb-1">
                Strict Prohibition Against Duplication & Resale:
              </strong>
              You may not mold, cast, clone, copy, or counterfeit any Smiths Jewellery physical piece or digital asset without prior explicit written commercial licensing signed by our executive directors.
            </div>
          </section>

          {/* Clause 3 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">03.</span>
              <span>Solid 925 Sterling Silver & Hand-Finished Tolerances</span>
            </h2>
            <p>
              Unlike generic mass-produced fast-fashion alloys, every single Smiths Jewellery piece is crafted using genuine 925 sterling silver, followed by meticulous hand-polishing, rhodium anti-tarnish plating, and precision gemstone setting.
            </p>
            <p>
              As a client, you understand and celebrate that handcrafted fine jewellery inherently exhibits microscopic artisanal tolerances and subtle hand-burnished metallic luster gradients. These characteristics are hallmarks of authentic smithing and purity; they do not constitute defects or non-conformance.
            </p>
          </section>

          {/* Clause 4 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">04.</span>
              <span>Pricing, Payments & Currency</span>
            </h2>
            <p>
              All prices displayed on the store are denominated in Indian National Rupees (INR - ₹) and include all statutory taxes unless explicitly broken down on the checkout summary. We reserve the absolute right to revise catalog pricing, apply drop-exclusive discounts, or discontinue product lines without prior announcement.
            </p>
            <p>
              In the event that an item is listed at an incorrect price due to typographical or technological system failure, Smiths Jewellery reserves the right to decline, halt, or cancel orders placed for such mispriced items, with prompt issuance of an immediate 100% refund.
            </p>
          </section>

          {/* Clause 5 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">05.</span>
              <span>Cash on Delivery (COD) Rules & Strict Anti-Fraud Policy</span>
            </h2>
            <p>
              To provide maximum accessibility across India, Smiths Jewellery offers Cash on Delivery (COD) on eligible domestic postal pin codes. By choosing Cash on Delivery:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-cream-muted">
              <li>
                You confirm that the recipient name, phone number, and physical door address provided are authentic, complete, and manned by an authorized recipient during daytime courier hours.
              </li>
              <li>
                You agree to pay the exact invoiced cash or digital courier UPI amount upon physical handover of the parcel.
              </li>
              <li>
                <strong className="text-rose-400">Willful Rejection Policy:</strong> Because our jewellery pieces are handcrafted and courier forward/return freight incurs substantial real costs, deliberate or frivolous rejection of verified COD packages at doorstep delivery constitutes bad faith. We reserve the right to immediately blacklist offending addresses and telephone numbers across all our networks and pursue statutory delivery freight recovery.
              </li>
            </ul>
          </section>

          {/* Clause 6 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">06.</span>
              <span>Fulfillment, Dispatch SLAs & Courier Logistics</span>
            </h2>
            <p>
              Orders are typically queued for crafting, hand-polishing, rhodium lustering, and multi-point quality inspection within 24 to 48 working hours. Once packaged in our signature midnight velvet presentation boxes, parcels are handed over to national express logistics aggregators (Shiprocket / Delhivery / BlueDart / DTDC / Xpressbees).
            </p>
            <p>
              Standard transit timelines range between 3 to 7 business days depending on destination geography (Metropolitan cities versus remote northeast/island regions). Smiths Jewellery provides real-time digital tracking links and Air Waybill (AWB) numbers. Delays caused by force majeure, severe weather disruptions, festive courier backlog, or regional transit restrictions lie outside our direct control, and buyers agree not to hold the Studio liable for carrier delays once custody is transferred.
            </p>
          </section>

          {/* Clause 7 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">07.</span>
              <span>Damaged in Transit & Unboxing Video Protocol</span>
            </h2>
            <p>
              Because each jewellery piece is curated and finished with utmost precision, we do not accept returns for subjective &ldquo;change of mind&rdquo; or customer remorse.
            </p>
            <p>
              However, we guarantee complete replacement protection against transit damage or incorrect model dispatch under our strict Unboxing Verification Protocol:
            </p>
            <div className="rounded-xl border border-gold/30 bg-charcoal/60 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gold font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Mandatory Continuous Unboxing Video:</span>
              </div>
              <p className="text-cream-muted">
                In the rare event of transit breakage or packaging compromise, customers MUST record an unedited, continuous, single-shot video beginning from the uncut, sealed exterior courier mailer bag, clearly showing the shipping label, package opening, and defect inspection.
              </p>
              <p className="text-cream-muted">
                Submit the unboxing recording within 48 hours of delivery to <strong className="text-gold">support@smithsjewellery.com</strong> or WhatsApp helpline <strong className="text-gold">7470012222</strong>. Verified damage claims will receive an immediate free replacement dispatched with express air priority.
              </p>
            </div>
          </section>

          {/* Clause 8 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">08.</span>
              <span>Order Cancellation by Customer or Seller</span>
            </h2>
            <p>
              <strong>Customer Cancellations:</strong> Orders may be cancelled by the customer only prior to the allocation of an Air Waybill (AWB) and dispatch handover. Once an order enters final preparation or has been handed to courier logistics, cancellations cannot be accepted.
            </p>
            <p>
              <strong>Seller Cancellations:</strong> Smiths Jewellery reserves the right to cancel any order if verification checks fail, suspected fraudulent payment patterns arise, the shipping address is undeliverable by all courier partners, or product availability ceases. In all seller-initiated cancellations, the buyer will receive an immediate notification and 100% full refund to the original payment source within 24–48 hours.
            </p>
          </section>

          {/* Clause 9 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">09.</span>
              <span>Limitation of Liability & Indemnification</span>
            </h2>
            <p>
              To the fullest extent permissible under Indian jurisprudence, Smiths Jewellery, its founders, silversmiths, artisans, and supply chain partners shall not be held liable for any incidental, consequential, special, or indirect damages arising out of the use, misuse, or inability to use our products or web interface. Our total aggregate liability for any claim arising under these terms shall strictly not exceed the total rupee amount paid by the customer for the specific order giving rise to the claim.
            </p>
            <p>
              You agree to indemnify, defend, and hold harmless Smiths Jewellery from and against any third-party claims, liabilities, losses, damages, or legal expenses resulting from your violation of these Terms or your infringement of any rights of a third party.
            </p>
          </section>

          {/* Clause 10 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">10.</span>
              <span>Governing Law & Exclusive Legal Jurisdiction</span>
            </h2>
            <p>
              These Terms of Service and any contractual relationship formed between Smiths Jewellery and the client shall be governed exclusively by, and interpreted strictly in accordance with, the laws of the Republic of India.
            </p>
            <p>
              Any legal dispute, arbitration, claim, or controversy arising directly or indirectly out of these terms, order fulfillment, or product condition shall be submitted to the exclusive jurisdiction of the competent judicial courts located in Maharashtra, India.
            </p>
          </section>

          {/* Clause 11 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">11.</span>
              <span>Customer Helpline & Grievance Officer</span>
            </h2>
            <p>
              In accordance with the Consumer Protection (E-Commerce) Rules, 2020, and the Information Technology Act, you may address any concerns or contractual inquiries directly to our designated support desk:
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
                <span className="text-cream font-medium">Official Legal & Support Email:</span>
                <a href="mailto:support@smithsjewellery.com" className="text-gold font-bold hover:underline font-mono">
                  support@smithsjewellery.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-xs text-cream-muted">
                <FileText className="h-4 w-4 text-gold shrink-0" />
                <span>Operating Hours: Monday – Saturday · 10:00 AM – 7:00 PM IST</span>
              </div>
            </div>
          </section>
        </article>

        {/* Bottom Call to Action */}
        <div className="mt-14 pt-8 border-t border-gold/15 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/privacy"
            className="text-xs font-semibold text-gold hover:text-gold-light transition-colors flex items-center gap-1.5"
          >
            <span>Review Privacy Policy</span>
            <span>→</span>
          </Link>
          <Link
            to="/shipping-policy"
            className="text-xs font-semibold text-gold hover:text-gold-light transition-colors flex items-center gap-1.5"
          >
            <span>Review Shipping Policy</span>
            <span>→</span>
          </Link>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <WishlistDrawer />
    </div>
  )
}
