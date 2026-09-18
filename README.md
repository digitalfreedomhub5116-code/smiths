# Smiths Jewellery 💍✨

> **Elegance in 925 Sterling Silver & Obsidian Black**  
> Luxury handcrafted fine jewellery designed for the contemporary connoisseur.

---

## 🌟 Overview

**Smiths Jewellery** is a high-performance, modern direct-to-consumer e-commerce experience showcasing fine 925 sterling silver necklaces, tennis bracelets, earrings, statement rings, luxury silk scarfs, and gift combos.

Built with a bespoke **brushed silver on obsidian black (`#080808`)** aesthetic, Smiths Jewellery blends timeless elegance, glassmorphic metallic accents, and high-speed checkout flows.

---

## ✨ Key Features

- **Luxury Brushed Silver & Obsidian Design:** Tailored `@theme` styling utilizing shimmering silver gradients, metallic borders, and deep obsidian backgrounds.
- **Curated Fine Jewellery Collections:**
  - 📿 **Necklaces:** Celestial solitaires, herringbone chains, and diamond-cut pendants.
  - 💎 **Bracelets:** Lumina tennis bracelets, paperclip chains, and cuffs.
  - ✨ **Earrings:** Huggies, halo studs, and cascade drops with AAA+ CZ.
  - 💍 **Rings:** Eternity bands and statement signet rings.
  - 🧣 **Scarfs:** Pure mulberry silk scarves with hand-rolled hems.
  - 🎁 **Combos:** Curated signature gift boxes in midnight black velvet.
- **Seamless Checkout Flow:**
  - Razorpay online payment integration (UPI, QR, Cards, NetBanking with ₹30 prepaid discount).
  - Cash on Delivery (COD) option.
  - Real-time address management, pincode validation, and coupon code support.
- **Live Order Tracking:** 6-stage milestone tracker (Placed, Confirmed & Crafted, Packed in Velvet Box, Shipped, Out for Delivery, Delivered) with AWB tracking and status indicators.
- **Merchant Admin Portal (`/admin`):**
  - Live visitor & funnel analytics (store visitors, jewellery views, intent, orders).
  - Order fulfillment workflow (dispatch, AWB generation, mark delivered/cancelled).
  - Dynamic product catalog manager with real-time editing and creation.
- **Offline & Mock Resilience:** Graceful local fallbacks ensuring full catalog browsing, cart operations, and local mock checkout even if remote Supabase connection is offline.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 (with custom `@theme` silver palette & obsidian tokens)
- **Icons:** Lucide React
- **Payments:** Razorpay Checkout SDK
- **Backend / Database:** Supabase (Client + Serverless Edge Functions)
- **Logistics Integration:** Shiprocket API / Webhooks ready

---

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/digitalfreedomhub5116-code/smiths.git
cd smiths
npm install
```

### 2. Development

Run the local Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build

```bash
npm run build
npm run preview
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory (optional for mock mode, required for live Supabase & Razorpay):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 🛡️ License

Private & Proprietary — © 2026 Smiths Jewellery. All rights reserved.
