import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Lock, EyeOff, Bell, UserCheck, Database, FileText, Phone, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import WishlistDrawer from '../components/WishlistDrawer'

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span>Official Data Protection Standard</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-cream">
            Privacy Policy & Data Security
          </h1>
          <p className="mt-4 text-sm sm:text-base text-cream-muted leading-relaxed max-w-2xl">
            Smiths Jewellery is fiercely committed to safeguarding the confidentiality, integrity, and sovereign privacy of every client who visits our store.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-gold/80">
            <span>Last Revised: September 2026</span>
            <span>•</span>
            <span>Version: 3.2 Enterprise Edition</span>
            <span>•</span>
            <span>Helpline: 7470012222</span>
          </div>
        </header>

        {/* Core Sovereignty Guarantee Alert */}
        <div className="rounded-2xl border border-gold/40 bg-charcoal/90 p-6 sm:p-8 mb-12 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gold/15 text-gold border border-gold/30 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-cream">
                Our Non-Negotiable Privacy Promise: Zero Data Sharing
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-cream-muted leading-relaxed">
                Your personal details, contact numbers, delivery addresses, and purchasing patterns belong exclusively to you. <strong className="text-gold font-semibold">Smiths Jewellery will NEVER sell, rent, monetize, loan, trade, or distribute your personal data to any external advertising agency, data broker, corporate aggregator, or third-party marketer.</strong> Your contact details may only be used internally by Smiths Jewellery to notify you regarding orders, shipping updates, and exclusive limited-edition collections.
              </p>
            </div>
          </div>
        </div>

        {/* Structured Legal Content */}
        <article className="space-y-10 text-sm leading-relaxed text-cream-muted/90">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">01.</span>
              <span>Scope & General Principles</span>
            </h2>
            <p>
              This Privacy Policy applies comprehensively to all visitors, registered account holders, and purchasing customers of Smiths Jewellery (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Studio&rdquo;) via our website, mobile interfaces, subdomains, and associated interactive communication channels.
            </p>
            <p>
              By accessing, browsing, interacting with, registering an account on, or submitting an order through Smiths Jewellery, you acknowledge the terms set forth herein and consent to the lawful processing, storage, and internal application of your information in absolute compliance with applicable Indian data protection frameworks, the Information Technology Act, 2000, and standard global cybersecurity best practices.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">02.</span>
              <span>Information We Collect From You</span>
            </h2>
            <p>
              In order to craft, verify, and safely dispatch fine silver jewellery and accessories to your doorstep, we collect only strictly necessary information under the following categories:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-cream-muted">
              <li>
                <strong className="text-cream">Personal Identity & Contact Information:</strong> Your legal name, shipping street address, apartment/suite number, landmark, city, state, postal PIN code, personal telephone/WhatsApp number, and verified email address.
              </li>
              <li>
                <strong className="text-cream">Account Authentication Data:</strong> When logging in through Google OAuth or magic email credentials, we securely receive your primary identity token, display name, and avatar URL provided by Google API services. We never receive or store your personal Google passwords.
              </li>
              <li>
                <strong className="text-cream">Transaction & Order Records:</strong> Detailed logs of items purchased, customized finishes selected (such as Rhodium luster), subtotal and shipping calculations, chosen payment method (Cash on Delivery or Prepaid), assigned Order Numbers, Air Waybill (AWB) tracking codes, and cancellation history.
              </li>
              <li>
                <strong className="text-cream">Technical & Device Telemetry:</strong> Anonymized IP addresses, approximate geographic region (for pincode verification), browser family, screen resolution, operating system, and session timestamps collected to optimize site performance and prevent automated fraud.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">03.</span>
              <span>How We Use Your Information (Internal Operations & Marketing)</span>
            </h2>
            <p>
              Every bit of data captured is utilized with extreme intentionality and care. Specifically, your data is processed exclusively for the following transparent purposes:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl border border-charcoal-light bg-charcoal/60 p-4">
                <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Physical Fulfillment</span>
                </div>
                <p className="text-xs text-cream-muted">
                  Transmitting exact delivery addresses and contact numbers to our verified courier network (Shiprocket, Delhivery, BlueDart, DTDC, Xpressbees) solely to ensure accurate door-to-door delivery.
                </p>
              </div>

              <div className="rounded-xl border border-charcoal-light bg-charcoal/60 p-4">
                <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider mb-2">
                  <Bell className="w-4 h-4 text-gold" />
                  <span>Exclusive Collection Marketing</span>
                </div>
                <p className="text-xs text-cream-muted">
                  Sending notifications about new collection drops, restocks, upcoming designs, and secret client privilege codes via email, WhatsApp, or SMS directly from Smiths Jewellery.
                </p>
              </div>

              <div className="rounded-xl border border-charcoal-light bg-charcoal/60 p-4">
                <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider mb-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Order Tracking & Verification</span>
                </div>
                <p className="text-xs text-cream-muted">
                  Issuing live order confirmation receipts, dispatch notifications, AWB live tracking links, delivery ETA updates, and Cash on Delivery phone/SMS verification.
                </p>
              </div>

              <div className="rounded-xl border border-charcoal-light bg-charcoal/60 p-4">
                <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider mb-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Studio Quality Optimization</span>
                </div>
                <p className="text-xs text-cream-muted">
                  Reviewing aggregate jewellery popularity to manage silver smithing, finishing queues, and inventory restocking for popular collections (Necklaces, Bracelets, Earrings, Rings, Scarfs, Combos).
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">04.</span>
              <span>Absolute Prohibition of Third-Party Data Sharing</span>
            </h2>
            <p>
              We firmly reject the modern monetization of user data. Under no scenario does Smiths Jewellery sell, license, lease, syndicate, exchange, or broker customer names, phone numbers, or email lists to third-party telemarketers, lead aggregators, or external advertisement networks.
            </p>
            <p>
              The only external entities that ever receive partial customer data are:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-cream-muted">
              <li>
                <strong className="text-cream">Authorized Courier Partners:</strong> Solely the recipient name, delivery address, pincode, and phone number required on the shipping label to complete physical package transport.
              </li>
              <li>
                <strong className="text-cream">PCI-DSS Payment Processors:</strong> Encrypted transaction requests passed through certified payment gateways (e.g. Razorpay, UPI) to safely execute card, netbanking, or UPI payments.
              </li>
              <li>
                <strong className="text-cream">Lawful Regulatory Mandates:</strong> In the rare and strict event of a formal subpoena or lawful mandate issued by a competent court of Indian jurisdiction.
              </li>
            </ol>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">05.</span>
              <span>Payment Security & Non-Retention of Financial Credentials</span>
            </h2>
            <p>
              Smiths Jewellery does NOT store, inspect, process, or retain any debit card numbers, credit card numbers, CVV codes, net banking passwords, or UPI personal identification numbers (PINs) on our servers or databases.
            </p>
            <p>
              All online digital payments are conducted through tokenized, bank-grade encrypted channels governed by the Reserve Bank of India (RBI) and PCI-DSS (Payment Card Industry Data Security Standard) Level 1 certified payment processors.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">06.</span>
              <span>Cookies, Browser Storage & Device Identification</span>
            </h2>
            <p>
              Our web application utilizes localized browser storage technologies (<code className="text-gold font-mono text-xs">localStorage</code> and <code className="text-gold font-mono text-xs">sessionStorage</code>) exclusively to preserve your active shopping bag contents, your saved wishlist items, and your persistent login state across browser refreshes.
            </p>
            <p>
              We do not deploy cross-site behavioral tracking beacons, intrusive canvas fingerprinting scripts, or third-party data tracking pixels that follow you across the wider web.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">07.</span>
              <span>Data Retention & The Client&apos;s Right to be Forgotten</span>
            </h2>
            <p>
              We retain account and order fulfillment records only for as long as necessary to satisfy accounting regulations, warranty commitments, transit claims, and customer service requests.
            </p>
            <p>
              You retain the absolute right at any time to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-cream-muted">
              <li>Request a comprehensive export of all personal data tied to your account.</li>
              <li>Request immediate and irreversible deletion of your registered account and contact profile.</li>
              <li>Unsubscribe from promotional drop announcements and marketing communications via the one-click unsubscribe link or by contacting our studio helpline.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <span className="text-gold font-mono text-base">08.</span>
              <span>Studio Helpline & Grievance Contact</span>
            </h2>
            <p>
              Should you have any questions, clarifications, privacy requests, or grievances concerning how your data is handled at Smiths Jewellery, our dedicated privacy desk is directly reachable:
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
                <span className="text-cream font-medium">Official Grievance Email:</span>
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
            to="/terms"
            className="text-xs font-semibold text-gold hover:text-gold-light transition-colors flex items-center gap-1.5"
          >
            <span>Review Terms of Service</span>
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
