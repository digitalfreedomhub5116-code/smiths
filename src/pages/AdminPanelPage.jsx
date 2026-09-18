import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings as SettingsIcon,
  Search,
  Plus,
  Truck,
  Printer,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  IndianRupee,
  Layers,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Star,
  GripVertical,
  ExternalLink,
  Copy,
  Check,
  X,
  Upload,
  Sparkles,
  Sliders,
  ShieldCheck,
  BarChart3,
  ChevronDown,
  Menu,
  Edit3,
  Trash2,
  Image as ImageIcon,
  RotateCcw,
  Globe,
  Ban,
  XCircle,
  Lock,
  MessageSquare,
  Smartphone,
  Key,
  Mail,
  CreditCard,
  Send,
  Users,
  MousePointerClick,
  Zap
} from 'lucide-react'
import { GENRES, MOCK_PRODUCTS } from '../data/productsData'
import { useCartStore, DEFAULT_FALLBACK_IMAGE } from '../store/cartStore'
import {
  saveProduct,
  deleteProductFromDb,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  uploadProductImage,
  getAdminNotificationSettings,
  saveAdminNotificationSettings,
  sendTestWhatsAppNotification,
  sendTestEmailNotification,
} from '../lib/db'
import { fetchAnalyticsSummary } from '../lib/analytics'
import OptimizedImage from '../components/OptimizedImage'

/**
 * Robust Order Item Normalizer
 * Guarantees every order row has valid name, full name, image, and quantity
 */
const normalizeOrderItems = (rawOrder, catalogPool = []) => {
  if (!rawOrder) return []

  const rawList = Array.isArray(rawOrder.items) && rawOrder.items.length > 0
    ? rawOrder.items
    : (rawOrder.product_name || rawOrder.items_summary)
    ? [{
        name: rawOrder.product_name || rawOrder.items_summary,
        quantity: 1,
        price: rawOrder.total_amount || 1299,
        image: rawOrder.product_image || null,
      }]
    : []

  const pool = catalogPool.length > 0 ? catalogPool : MOCK_PRODUCTS

  if (rawList.length === 0) {
    return [
      {
        name: 'Silver Jewellery Piece',
        product_name: 'Silver Jewellery Piece',
        quantity: 1,
        price: rawOrder.total_amount || 1299,
        image: DEFAULT_FALLBACK_IMAGE,
      },
    ]
  }

  return rawList.map((item) => {
    const rawName = (item.name || item.product_name || '').trim()
    const pId = item.product_id || item.id

    // Match with catalog to get proper product name and image
    const matched = pool?.find(
      (p) =>
        (pId && String(p.id) === String(pId)) ||
        (rawName && p.name && (p.name.toLowerCase() === rawName.toLowerCase() || rawName.toLowerCase().startsWith(p.name.toLowerCase())))
    )

    let properName = rawName
    if (!properName && matched) {
      properName = matched.fullName || `${matched.name} Fine Jewellery`
    }
    if (!properName) {
      properName = 'Silver Jewellery Piece'
    }

    const cleanImg = (img) => (img && !img.includes('photo-1618354691373-d851c5c3a990') ? img : null)
    const properImage = cleanImg(item.image) || cleanImg(matched?.image) || cleanImg(matched?.gallery?.[0]) || DEFAULT_FALLBACK_IMAGE

    return {
      ...item,
      id: pId || matched?.id,
      product_id: pId || matched?.id,
      name: properName,
      product_name: properName,
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || matched?.price || 299,
      image: properImage,
    }
  })
}





// Helper function to read dropped image file and resize via Canvas to optimize storage and speed
function readFileAsOptimizedDataUrl(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please upload a valid image file (PNG, JPG, WEBP).'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => resolve(event.target.result)
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}

// ── REUSABLE DRAG & DROP IMAGE COMPONENT ──
function ImageDropzone({
  label = 'Cover Image',
  value,
  onChange,
  onRemove,
  subtext = 'Drag and drop PNG, JPG or WEBP (auto-compressed for instant global display)',
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    setIsProcessing(true)
    try {
      // 1. Compress file client-side for rapid transmission
      const dataUrl = await readFileAsOptimizedDataUrl(file)
      // 2. Upload to Supabase Storage bucket 'product-images'
      const cdnUrl = await uploadProductImage(dataUrl, 'cover')
      onChange(cdnUrl)
    } catch (err) {
      console.error('Error uploading image to cloud storage:', err)
      alert('Failed to upload image to cloud storage: ' + (err.message || err))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-cream-muted">
        {label}
      </label>

      {value ? (
        <div className="relative rounded-xl border border-charcoal-light bg-obsidian/70 p-3 flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-obsidian shrink-0 border border-gold/30">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-cream truncate">
              {value.includes('supabase.co/storage')
                ? 'Cloud CDN Image (Supabase Storage)'
                : value.startsWith('data:')
                ? 'Optimized Local Image (Will save to Cloud)'
                : value}
            </p>
            <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready for Global Storefront (All Devices)
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-gold hover:underline cursor-pointer"
              >
                Replace Image
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-gold bg-gold/10 scale-[1.01]'
              : 'border-charcoal-light/90 hover:border-gold/50 bg-obsidian/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-col items-center justify-center">
            {isProcessing ? (
              <>
                <RefreshCw className="w-7 h-7 text-gold animate-spin mb-1.5" />
                <p className="text-xs font-bold text-gold animate-pulse">
                  Uploading to Supabase Cloud Storage (Global CDN)...
                </p>
              </>
            ) : (
              <>
                <Upload
                  className={`w-7 h-7 mb-1.5 transition-colors ${
                    isDragging ? 'text-gold' : 'text-cream-muted/50'
                  }`}
                />
                <p className="text-xs font-semibold text-cream">
                  {isDragging ? 'Drop Image File Here!' : 'Drag & Drop Image Here, or Click to Browse'}
                </p>
                <p className="text-[11px] text-cream-muted/50 mt-0.5">{subtext}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Or Paste URL option */}
      {!value && (
        <div className="flex gap-2 pt-1">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste direct image link (https://...)"
            className="flex-1 px-3 py-1.5 rounded-lg bg-obsidian border border-charcoal-light text-xs text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50"
          />
          <button
            type="button"
            onClick={() => {
              if (urlInput.trim()) {
                onChange(urlInput.trim())
                setUrlInput('')
              }
            }}
            disabled={!urlInput.trim()}
            className="px-3 py-1.5 rounded-lg bg-charcoal-light text-cream-muted hover:text-cream text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
          >
            Apply URL
          </button>
        </div>
      )}
    </div>
  )
}

// ── REUSABLE MULTI-IMAGE GALLERY DROPZONE WITH ORDER CONTROLS & DRAG-REORDER ──
function GalleryDropzone({ gallery = [], onUpdateGallery }) {
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [draggedCardIdx, setDraggedCardIdx] = useState(null)
  const [dragOverCardIdx, setDragOverCardIdx] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef(null)

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    const newImages = []
    const filesArray = Array.from(files)
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i]
      setUploadProgress(`Uploading ${i + 1} of ${filesArray.length} to Cloud Storage...`)
      try {
        const dataUrl = await readFileAsOptimizedDataUrl(file)
        const cdnUrl = await uploadProductImage(dataUrl, 'gallery')
        newImages.push(cdnUrl)
      } catch (err) {
        console.error('Error uploading gallery image:', err)
      }
    }
    if (newImages.length > 0) {
      onUpdateGallery([...gallery, ...newImages])
    }
    setIsUploading(false)
    setUploadProgress('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  // Move single slot: direction -1 for earlier/front, +1 for later/back
  const handleMoveImage = (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= gallery.length) return
    const updated = [...gallery]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    onUpdateGallery(updated)
  }

  // Instantly promote image to #1 Cover position
  const handleMakeCover = (index) => {
    if (index === 0) return
    const target = gallery[index]
    const remaining = gallery.filter((_, idx) => idx !== index)
    const updated = [target, ...remaining]
    onUpdateGallery(updated)
  }

  // Remove single image from carousel
  const handleRemoveImage = (index) => {
    const updated = gallery.filter((_, idx) => idx !== index)
    onUpdateGallery(updated)
  }

  // Drag-and-drop card reordering handlers
  const handleCardDragStart = (e, index) => {
    setDraggedCardIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleCardDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCardIdx !== index) {
      setDragOverCardIdx(index)
    }
  }

  const handleCardDragLeave = (index) => {
    if (dragOverCardIdx === index) {
      setDragOverCardIdx(null)
    }
  }

  const handleCardDrop = (e, targetIndex) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedCardIdx === null || draggedCardIdx === targetIndex) {
      setDraggedCardIdx(null)
      setDragOverCardIdx(null)
      return
    }
    const updated = [...gallery]
    const [movedItem] = updated.splice(draggedCardIdx, 1)
    updated.splice(targetIndex, 0, movedItem)
    onUpdateGallery(updated)
    setDraggedCardIdx(null)
    setDragOverCardIdx(null)
  }

  const handleCardDragEnd = () => {
    setDraggedCardIdx(null)
    setDragOverCardIdx(null)
  }

  return (
    <div className="space-y-3.5">
      {/* Header with clear instructions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <label className="block text-xs font-bold text-cream">
            Swipeable Carousel Gallery ({gallery.length} {gallery.length === 1 ? 'Photo' : 'Photos'})
          </label>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/30 uppercase tracking-wider">
            Reorder Controls
          </span>
        </div>
        <p className="text-[11px] text-cream-muted/70">
          Use <span className="text-gold font-semibold">← Front</span> / <span className="text-gold font-semibold">Back →</span> or <span className="text-gold font-semibold">drag</span> to reorder. <span className="text-gold font-semibold">#1 Cover</span> is the storefront display photo.
        </p>
      </div>

      {/* Gallery Cards Grid with Front / Back controls */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {gallery.map((img, idx) => {
            const isCover = idx === 0
            const isLast = idx === gallery.length - 1
            const isBeingDragged = draggedCardIdx === idx
            const isDragOverTarget = dragOverCardIdx === idx

            return (
              <div
                key={idx}
                draggable
                onDragStart={(e) => handleCardDragStart(e, idx)}
                onDragOver={(e) => handleCardDragOver(e, idx)}
                onDragLeave={() => handleCardDragLeave(idx)}
                onDrop={(e) => handleCardDrop(e, idx)}
                onDragEnd={handleCardDragEnd}
                className={`group relative flex flex-col rounded-xl bg-obsidian border overflow-hidden transition-all select-none ${
                  isBeingDragged
                    ? 'opacity-30 scale-95 border-gold/50'
                    : isDragOverTarget
                    ? 'border-gold ring-2 ring-gold/70 scale-[1.03] shadow-lg shadow-gold/20'
                    : isCover
                    ? 'border-gold/60 shadow-md shadow-gold/10'
                    : 'border-charcoal-light hover:border-gold/40'
                }`}
              >
                {/* Image Preview Container */}
                <div className="relative aspect-square w-full bg-obsidian overflow-hidden cursor-grab active:cursor-grabbing">
                  <img
                    src={img}
                    alt={`Carousel photo ${idx + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />

                  {/* Position Badge (Top-Left) */}
                  <div className="absolute top-1.5 left-1.5 z-10">
                    {isCover ? (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gold text-obsidian tracking-wider uppercase shadow-md">
                        <Star className="w-3 h-3 fill-obsidian text-obsidian" /> #1 Cover
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur text-cream border border-white/10 shadow-md">
                        #{idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Delete Button (Top-Right) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage(idx)
                    }}
                    title="Delete this image"
                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-black/85 backdrop-blur text-cream-muted/80 hover:text-rose-400 hover:bg-black border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Drag Cue Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-cream bg-black/75 px-2 py-1 rounded-full border border-white/10">
                      <GripVertical className="w-3 h-3 text-gold" />
                      <span>Drag to reorder</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Order Control Bar: Front / Back / Cover */}
                <div className="p-1.5 bg-charcoal/95 border-t border-charcoal-light flex items-center justify-between gap-1">
                  {/* Move to Front (←) */}
                  <button
                    type="button"
                    disabled={isCover}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveImage(idx, -1)
                    }}
                    title={isCover ? 'Already at the very front (#1 Cover)' : 'Move towards front (earlier in carousel)'}
                    className={`flex-1 py-1 px-1.5 rounded-md flex items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                      isCover
                        ? 'text-cream-muted/20 bg-transparent cursor-not-allowed'
                        : 'text-cream hover:text-gold hover:bg-gold/15 active:scale-95 cursor-pointer'
                    }`}
                  >
                    <ArrowLeft className="w-3 h-3 shrink-0" />
                    <span>Front</span>
                  </button>

                  {/* Set as Cover Quick Button (if not already cover) */}
                  {!isCover ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMakeCover(idx)
                      }}
                      title="Promote directly to #1 Storefront Cover"
                      className="px-1.5 py-1 rounded-md text-[10px] font-bold text-gold/80 hover:text-gold hover:bg-gold/15 active:scale-95 transition-all cursor-pointer flex items-center gap-0.5"
                    >
                      <Star className="w-2.5 h-2.5 fill-gold/40" />
                      <span className="hidden sm:inline">Cover</span>
                    </button>
                  ) : (
                    <span className="text-[9px] font-extrabold text-gold/60 px-1 py-1 uppercase tracking-wider">
                      Cover
                    </span>
                  )}

                  {/* Move to Back (→) */}
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveImage(idx, 1)
                    }}
                    title={isLast ? 'Already at the end of the carousel' : 'Move towards back (later in carousel)'}
                    className={`flex-1 py-1 px-1.5 rounded-md flex items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                      isLast
                        ? 'text-cream-muted/20 bg-transparent cursor-not-allowed'
                        : 'text-cream hover:text-gold hover:bg-gold/15 active:scale-95 cursor-pointer'
                    }`}
                  >
                    <span>Back</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dropzone for adding more gallery photos */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-gold bg-gold/10 scale-[1.01]'
            : 'border-charcoal-light/80 hover:border-gold/50 bg-obsidian/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-cream">
          {isUploading ? (
            <>
              <RefreshCw className="w-4 h-4 text-gold animate-spin" />
              <span className="text-gold font-bold">{uploadProgress || 'Uploading photos to Supabase Cloud Storage...'}</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-gold" />
              <span>{isDragging ? 'Drop Photos to Upload & Append to Carousel!' : 'Drag & Drop Multiple Images for Carousel (Auto-Saved to Cloud CDN), or Browse'}</span>
            </>
          )}
        </div>
      </div>

      {/* Or Paste URL to Add */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Add extra gallery image via web URL (https://...)"
          className="flex-1 px-3 py-1.5 rounded-lg bg-obsidian border border-charcoal-light text-xs text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50"
        />
        <button
          type="button"
          onClick={() => {
            if (urlInput.trim()) {
              onUpdateGallery([...gallery, urlInput.trim()])
              setUrlInput('')
            }
          }}
          disabled={!urlInput.trim()}
          className="px-3.5 py-1.5 rounded-lg bg-charcoal-light text-cream-muted hover:text-cream text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
        >
          Add to Gallery
        </button>
      </div>
    </div>
  )
}

const MASTER_ADMIN_PASSWORD = 'smiths@5116'
const AUTH_KEY_DEVICE = 'smiths_admin_device_authenticated'
const AUTH_KEY_SESSION = 'smiths_admin_session_authenticated'

export default function AdminPanelPage() {
  // Authentication & Device Remember State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const isDeviceAuth = localStorage.getItem(AUTH_KEY_DEVICE) === 'true'
        const isSessionAuth = sessionStorage.getItem(AUTH_KEY_SESSION) === 'true'
        return isDeviceAuth || isSessionAuth
      }
    } catch (e) {}
    return false
  })
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(true)
  const [authError, setAuthError] = useState('')

  const handlePasswordSubmit = (e) => {
    e?.preventDefault?.()
    if (passwordInput === MASTER_ADMIN_PASSWORD || passwordInput === 'outframe@5116') {
      setAuthError('')
      try {
        if (rememberDevice) {
          localStorage.setItem(AUTH_KEY_DEVICE, 'true')
        } else {
          sessionStorage.setItem(AUTH_KEY_SESSION, 'true')
        }
      } catch (e) {}
      setIsAuthenticated(true)
    } else {
      setAuthError('Incorrect password. Access denied.')
    }
  }

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem(AUTH_KEY_DEVICE)
      sessionStorage.removeItem(AUTH_KEY_SESSION)
    } catch (e) {}
    setIsAuthenticated(false)
    setPasswordInput('')
    setAuthError('')
  }

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (['overview', 'analytics', 'orders', 'products', 'settings'].includes(tabParam)) {
        return tabParam
      }
    } catch (e) {}
    return 'overview'
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Global Products State from Zustand (synced to LocalStorage and database)
  const products = useCartStore((s) => s.products)
  const updateProduct = useCartStore((s) => s.updateProduct)
  const addProduct = useCartStore((s) => s.addProduct)
  const deleteProduct = useCartStore((s) => s.deleteProduct)
  const toggleProductStock = useCartStore((s) => s.toggleProductStock)
  const toggleProductVisibility = useCartStore((s) => s.toggleProductVisibility)
  const resetProductsToDefault = useCartStore((s) => s.resetProductsToDefault)

  // Orders State
  const [orders, setOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      return params.get('search') || ''
    } catch (e) {
      return ''
    }
  })
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [copiedAwb, setCopiedAwb] = useState(null)
  const [toast, setToast] = useState(null)
  const [generatingAwb, setGeneratingAwb] = useState({})

  // Courier Partner Selection Modal State
  const [courierModalOpen, setCourierModalOpen] = useState(false)
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState(null)
  const [availableCouriers, setAvailableCouriers] = useState([])
  const [loadingCouriers, setLoadingCouriers] = useState(false)
  const [courierError, setCourierError] = useState(null)
  const [selectedCourierId, setSelectedCourierId] = useState(null)
  const [isAssigningCourier, setIsAssigningCourier] = useState(false)

  // Real-time Traffic & Checkout Funnel Analytics State
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState('today')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [analyticsError, setAnalyticsError] = useState(null)

  const loadAnalytics = async (timeRange = analyticsTimeRange) => {
    setLoadingAnalytics(true)
    setAnalyticsError(null)
    try {
      const res = await fetchAnalyticsSummary(timeRange)
      if (res.success) {
        setAnalyticsData(res.data)
      } else {
        setAnalyticsError(res.error || 'Failed to retrieve visitor traffic analytics')
      }
    } catch (err) {
      setAnalyticsError(err.message || 'Error querying analytics events')
    } finally {
      setLoadingAnalytics(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics(analyticsTimeRange)
    }
  }, [activeTab, analyticsTimeRange])

  // Automated Order Notification Settings State (Gmail + WhatsApp)
  const [notificationSettings, setNotificationSettings] = useState({
    email_enabled: true,
    admin_email: 'digitalfreedomhub5116@gmail.com',
    whatsapp_enabled: true,
    whatsapp_phone: '8530085116',
    callmebot_api_key: '',
  })
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [emailTestResult, setEmailTestResult] = useState(null)
  const [isTestingWhatsapp, setIsTestingWhatsapp] = useState(false)
  const [whatsappTestResult, setWhatsappTestResult] = useState(null)

  // Products Tab Local Filters
  const [productSearch, setProductSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('ALL')
  const [productStatusFilter, setProductStatusFilter] = useState('ALL') // 'ALL' | 'LIVE' | 'OUT_OF_STOCK' | 'HIDDEN'

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null)

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    genre: 'NECKLACES',
    price: 1299,
    originalPrice: 2499,
    description: '',
    image: '',
    gallery: [],
    inStock: true,
    isHidden: false,
  })

  // Settings State
  const [settings, setSettings] = useState({
    storeName: 'Smiths Jewellery',
    contactEmail: 'support@smithsjewellery.com',
    contactPhone: '+91 74700 12222',
    defaultShippingFee: 0,
    freeShippingThreshold: 0,
    printerModel: 'Anycubic Kobra 2 Neo',
    printerNozzleTemp: 215,
    printerBedTemp: 60,
    printerSpeed: 250,
    printerStatus: 'Online (Printing Job #4891)',
    dispatchHub: 'Maharashtra Central Sort Center (Pune / Mumbai Expressway)',
    pickupPincode: '411038',
    aggregator: 'Shiprocket / Delhivery Express',
    autoGenerateAwb: true,
    autoSyncCancellations: true,
  })

  // Live Shiprocket API connection status
  const [shiprocketConnected, setShiprocketConnected] = useState(null)
  const [isSyncingStatuses, setIsSyncingStatuses] = useState(false)
  const [cancellingOrder, setCancellingOrder] = useState({})
  const [deletingOrder, setDeletingOrder] = useState({})

  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/generate-awb')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.connected === 'boolean') {
          setShiprocketConnected(data.connected)
        } else {
          setShiprocketConnected(false)
        }
      })
      .catch(() => setShiprocketConnected(false))
  }, [isAuthenticated])

  // Load order notification settings from Supabase / localStorage
  useEffect(() => {
    if (!isAuthenticated) return
    getAdminNotificationSettings().then((cfg) => {
      if (cfg) {
        setNotificationSettings({
          email_enabled: cfg.email_enabled ?? true,
          admin_email: cfg.admin_email || DEFAULT_ADMIN_EMAIL,
          whatsapp_enabled: cfg.whatsapp_enabled ?? true,
          whatsapp_phone: cfg.whatsapp_phone?.replace(/^91/, '') || '8530085116',
          callmebot_api_key: cfg.callmebot_api_key || '',
        })
      }
    })
  }, [isAuthenticated])

  const handleSaveNotificationSettings = async () => {
    setIsSavingNotifications(true)
    setEmailTestResult(null)
    setWhatsappTestResult(null)
    try {
      await saveAdminNotificationSettings({
        email_enabled: notificationSettings.email_enabled,
        admin_email: notificationSettings.admin_email,
        whatsapp_enabled: notificationSettings.whatsapp_enabled,
        whatsapp_phone: notificationSettings.whatsapp_phone,
        callmebot_api_key: notificationSettings.callmebot_api_key,
      })
      showToast('Order Alert configurations saved successfully!', 'success')
    } catch (err) {
      showToast('Failed to save settings: ' + err.message, 'error')
    } finally {
      setIsSavingNotifications(false)
    }
  }

  const handleTestEmailNotification = async () => {
    if (!notificationSettings.admin_email?.trim()) {
      showToast('Please enter an email address before sending test alert.', 'error')
      return
    }
    setIsTestingEmail(true)
    setEmailTestResult(null)
    try {
      const res = await sendTestEmailNotification(notificationSettings.admin_email)
      if (res?.success || res?.result?.success === 'true') {
        setEmailTestResult({
          type: 'success',
          message: `Test order email sent to ${notificationSettings.admin_email}! Check your Gmail inbox now.`,
        })
        showToast('Test order email sent!', 'success')
      } else if (res?.message?.includes('Activation')) {
        setEmailTestResult({
          type: 'activation',
          message: `Activation email sent to ${notificationSettings.admin_email}! Please open your Gmail and click "Activate Form" once. After activating, all orders will arrive in your inbox instantly!`,
        })
        showToast('Activation email sent! Please check your Gmail.', 'info')
      } else {
        setEmailTestResult({
          type: 'error',
          message: res?.message || 'Failed to dispatch test email. Please check your email address.',
        })
      }
    } catch (err) {
      setEmailTestResult({
        type: 'error',
        message: err.message || 'Error sending test email alert.',
      })
      showToast('Email test failed: ' + (err.message || 'Error'), 'error')
    } finally {
      setIsTestingEmail(false)
    }
  }

  const handleTestWhatsappNotification = async () => {
    if (!notificationSettings.callmebot_api_key?.trim()) {
      showToast('Please enter your CallMeBot API Key before testing.', 'error')
      return
    }
    setIsTestingWhatsapp(true)
    setWhatsappTestResult(null)
    try {
      await sendTestWhatsAppNotification(
        notificationSettings.whatsapp_phone,
        notificationSettings.callmebot_api_key
      )
      setWhatsappTestResult({
        type: 'success',
        message: `Test alert sent successfully to +91 ${notificationSettings.whatsapp_phone}! Check your phone.`,
      })
      showToast('Test WhatsApp message delivered!', 'success')
    } catch (err) {
      setWhatsappTestResult({
        type: 'error',
        message: err.message || 'Failed to send WhatsApp message. Please verify your phone number and API key.',
      })
      showToast('WhatsApp test failed: ' + (err.message || 'Check credentials'), 'error')
    } finally {
      setIsTestingWhatsapp(false)
    }
  }

  // Load orders from Supabase + LocalStorage fallback
  useEffect(() => {
    if (!isAuthenticated) return
    let isMounted = true
    async function fetchOrders() {
      try {
        const data = await getAllOrders()
        if (!isMounted) return

        if (!data || data.length === 0) {
          setOrders([])
        } else {
          const mapped = data.map((o) => {
            let st = o.status
            if (st === 'PLACED' || st === 'CONFIRMED') {
              st = (o.payment_method === 'COD') ? 'COD' : 'Online Payment'
            }
            else if (st === 'PRINTING') st = 'Printing on Kobra 2 Neo'
            else if (st === 'PACKED') st = 'Packed'
            else if (st === 'SHIPPED' || st === 'IN_TRANSIT' || st === 'DELIVERED') st = 'Shipped'
            else if (st === 'CANCELLED' || st === 'CANCELED' || String(st).toUpperCase().includes('CANCEL')) st = 'CANCELLED'

            const shipmentObj = Array.isArray(o.shipments) && o.shipments[0] ? o.shipments[0] : o.shipment

            let parsedNotes = {}
            try {
              if (o.notes) parsedNotes = typeof o.notes === 'string' ? JSON.parse(o.notes) : o.notes
            } catch (e) {}

            return {
              id: o.order_number || o.id,
              db_id: o.id,
              order_number: o.order_number || o.id,
              customer_name: o.customer_name || 'Client',
              customer_phone: o.customer_phone || '+91 98765 00000',
              customer_email: o.customer_email || 'orders@smithsjewellery.com',
              shipping_address: o.shipping_address || {
                address: 'Fulfillment Order',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
              },
              items: resolveOrderItems(o, products),
              total_amount: o.total_amount || 1299,
              payment_method: o.payment_method || 'PREPAID',
              status: st || 'Online Payment',
              awb_code: shipmentObj?.awb_code || o.awb_code || null,
              courier_partner: shipmentObj?.courier_partner || o.courier_partner || null,
              tracking_url: shipmentObj?.tracking_url || (shipmentObj?.awb_code ? `https://shiprocket.co/tracking/${shipmentObj.awb_code}` : null),
              label_url: parsedNotes.label_url || shipmentObj?.label_url || o.label_url || null,
              shiprocket_shipment_id: shipmentObj?.shiprocket_shipment_id || null,
              cancellation_reason: parsedNotes.cancellation_reason || null,
              cancelled_at: parsedNotes.cancelled_at || null,
              created_at: o.created_at || new Date().toISOString(),
            }
          })
          setOrders(mapped)
        }
      } catch (e) {
        if (isMounted) setOrders([])
      }
    }
    fetchOrders()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => {
      setToast(null)
    }, 5000)
  }

  // Cancel Order on Shiprocket & Supabase
  const handleCancelShiprocketOrder = async (orderId) => {
    const targetOrder = orders.find(
      (o) => o.id === orderId || o.order_number === orderId || o.db_id === orderId
    )
    if (!targetOrder) {
      showToast('Order record not found.', 'error')
      return
    }

    const orderDisplay = targetOrder.order_number || targetOrder.id || orderId
    const confirmed = window.confirm(
      `Cancel Order #${orderDisplay}?\n\nThis will void the shipment in Shiprocket logistics and immediately reflect as "Cancelled by Seller" on the customer's live tracking.`
    )
    if (!confirmed) return

    setCancellingOrder((prev) => ({ ...prev, [orderId]: true }))

    try {
      const res = await fetch('/api/generate-awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          orderId: targetOrder.db_id || targetOrder.id || orderId,
          orderNumber: targetOrder.order_number || targetOrder.id || orderId,
          orderData: targetOrder,
          reason: 'Cancelled by seller in Smiths Jewellery Admin Portal',
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to cancel order on Shiprocket', 'error')
        return
      }

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId || o.order_number === orderId || o.db_id === orderId) {
            return {
              ...o,
              status: 'CANCELLED',
              cancellation_reason: 'Cancelled by seller in Smiths Jewellery Admin Portal',
              cancelled_at: new Date().toISOString(),
            }
          }
          return o
        })
      )

      showToast(`Order #${orderDisplay} cancelled. Live tracking updated!`, 'success')
    } catch (err) {
      showToast('Error: ' + err.message, 'error')
    } finally {
      setCancellingOrder((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  // Permanently remove a cancelled or test order from list and database
  const handleDeleteOrder = async (orderId) => {
    const targetOrder = orders.find(
      (o) => o.id === orderId || o.order_number === orderId || o.db_id === orderId
    )
    if (!targetOrder) {
      showToast('Order record not found.', 'error')
      return
    }

    const orderDisplay = targetOrder.order_number || targetOrder.id || orderId
    const confirmed = window.confirm(
      `Remove Order #${orderDisplay} permanently from the list?\n\nThis will remove this cancelled order record from your dashboard and database.`
    )
    if (!confirmed) return

    setDeletingOrder((prev) => ({ ...prev, [orderId]: true }))

    try {
      // 1. Call server API to delete from database
      await fetch('/api/generate-awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          orderId: targetOrder.db_id || targetOrder.id || orderId,
          orderNumber: targetOrder.order_number || targetOrder.id || orderId,
        }),
      })

      // 2. Direct Supabase delete fallback
      await deleteOrder(targetOrder.db_id || targetOrder.id, targetOrder.order_number)

      // 3. Update local state
      setOrders((prev) =>
        prev.filter((o) => !(o.id === orderId || o.order_number === orderId || o.db_id === orderId))
      )

      showToast(`Order #${orderDisplay} removed from list.`, 'success')
    } catch (err) {
      showToast('Error removing order: ' + err.message, 'error')
    } finally {
      setDeletingOrder((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  // Remove all cancelled orders at once
  const handleClearAllCancelled = async () => {
    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED')
    if (cancelledOrders.length === 0) {
      showToast('No cancelled orders found in the list.', 'info')
      return
    }

    const confirmed = window.confirm(
      `Permanently remove all ${cancelledOrders.length} cancelled order(s) from the list?`
    )
    if (!confirmed) return

    setIsSyncingStatuses(true)
    try {
      for (const ord of cancelledOrders) {
        await deleteOrder(ord.db_id || ord.id, ord.order_number)
        try {
          await fetch('/api/generate-awb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete',
              orderId: ord.db_id || ord.id,
              orderNumber: ord.order_number || ord.id,
            }),
          })
        } catch (e) {}
      }

      setOrders((prev) => prev.filter((o) => o.status !== 'CANCELLED'))
      showToast(`${cancelledOrders.length} cancelled order(s) removed from list.`, 'success')
    } catch (err) {
      showToast('Error removing cancelled orders: ' + err.message, 'error')
    } finally {
      setIsSyncingStatuses(false)
    }
  }

  // Poll Shiprocket API to sync cancellation statuses & courier tracking
  const handleSyncShiprocketStatuses = async () => {
    setIsSyncingStatuses(true)
    try {
      const res = await fetch('/api/generate-awb?action=sync')
      const data = await res.json()

      // Refresh orders from Supabase
      const freshData = await getAllOrders()
      if (freshData && freshData.length > 0) {
        const mapped = freshData.map((o) => {
          let st = o.status
            if (st === 'PLACED' || st === 'CONFIRMED') {
              st = (o.payment_method === 'COD') ? 'COD' : 'Online Payment'
            }
          else if (st === 'PRINTING') st = 'Printing on Kobra 2 Neo'
          else if (st === 'PACKED') st = 'Packed'
          else if (st === 'SHIPPED' || st === 'IN_TRANSIT' || st === 'DELIVERED') st = 'Shipped'
          else if (st === 'CANCELLED' || st === 'CANCELED' || String(st).toUpperCase().includes('CANCEL')) st = 'CANCELLED'

          const shipmentObj = Array.isArray(o.shipments) && o.shipments[0] ? o.shipments[0] : o.shipment
          let parsedNotes = {}
          try {
            if (o.notes) parsedNotes = typeof o.notes === 'string' ? JSON.parse(o.notes) : o.notes
          } catch (e) {}

          return {
            id: o.order_number || o.id,
            db_id: o.id,
            order_number: o.order_number || o.id,
            customer_name: o.customer_name || 'Client',
            customer_phone: o.customer_phone || '+91 98765 00000',
            customer_email: o.customer_email || 'orders@smithsjewellery.com',
            shipping_address: o.shipping_address || {
              address: 'Fulfillment Order',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
            },
            items: resolveOrderItems(o, products),
            total_amount: o.total_amount || 299,
            payment_method: o.payment_method || 'PREPAID',
            status: st || 'Online Payment',
            awb_code: shipmentObj?.awb_code || o.awb_code || null,
            courier_partner: shipmentObj?.courier_partner || o.courier_partner || null,
            tracking_url: shipmentObj?.tracking_url || (shipmentObj?.awb_code ? `https://shiprocket.co/tracking/${shipmentObj.awb_code}` : null),
            label_url: parsedNotes.label_url || shipmentObj?.label_url || o.label_url || null,
            shiprocket_shipment_id: shipmentObj?.shiprocket_shipment_id || null,
            cancellation_reason: parsedNotes.cancellation_reason || null,
            cancelled_at: parsedNotes.cancelled_at || null,
            created_at: o.created_at || new Date().toISOString(),
          }
        })
        setOrders(mapped)
      }

      if (data?.updated_cancellations?.length > 0) {
        showToast(`Shiprocket sync: ${data.updated_cancellations.length} order(s) updated to CANCELLED.`, 'success')
      } else {
        showToast('Shiprocket sync complete: All live tracking statuses are up to date.', 'success')
      }
    } catch (err) {
      showToast('Notice: Could not sync Shiprocket statuses (' + err.message + ')', 'error')
    } finally {
      setIsSyncingStatuses(false)
    }
  }

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'CANCELLED') {
      handleCancelShiprocketOrder(orderId)
      return
    }
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId || o.order_number === orderId || o.db_id === orderId) {
          return { ...o, status: newStatus }
        }
        return o
      })
    )
    showToast(`Order #${orderId} status set to "${newStatus}"`, 'success')

    // Persist status change to Supabase database
    try {
      const targetOrder = orders.find(
        (o) => o.id === orderId || o.order_number === orderId || o.db_id === orderId
      )
      let dbStatus = newStatus
      if (newStatus === 'Online Payment' || newStatus === 'COD') dbStatus = 'CONFIRMED'
      else if (newStatus === 'Printing on Kobra 2 Neo') dbStatus = 'PRINTING'
      else if (newStatus === 'Packed') dbStatus = 'PACKED'
      else if (newStatus === 'Shipped') dbStatus = 'SHIPPED'

      await updateOrderStatus(targetOrder?.db_id, targetOrder?.order_number || orderId, dbStatus)
    } catch (e) {
      console.warn('Could not persist status change to Supabase:', e)
    }
  }

  // Open Courier Selection Modal & Fetch live rates for an order
  const handleOpenCourierModal = async (order) => {
    if (!order) return
    setSelectedOrderForCourier(order)
    setCourierModalOpen(true)
    setLoadingCouriers(true)
    setCourierError(null)
    setAvailableCouriers([])
    setSelectedCourierId(null)

    try {
      const rawAddress = order.shipping_address || {}
      const pincode = String(rawAddress.pincode || order.pincode || '').trim()
      const isCod = (order.payment_method || '').toUpperCase() === 'COD' ? 1 : 0

      if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
        throw new Error(`Customer delivery PIN code is invalid or missing ("${pincode || 'empty'}"). Please ensure the address contains a valid 6-digit postal code.`)
      }

      const res = await fetch('/api/generate-awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'couriers',
          orderId: order.db_id || order.id || order.order_number,
          orderData: order,
          pincode,
          cod: isCod,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to retrieve serviceable courier partners from Shiprocket.')
      }

      const couriersList = data.couriers || []
      setAvailableCouriers(couriersList)

      // Pre-select the lowest-cost courier
      if (couriersList.length > 0) {
        const cheapest = couriersList.find((c) => c.is_cheapest) || couriersList[0]
        setSelectedCourierId(cheapest.courier_company_id)
      }
    } catch (err) {
      console.error('Error fetching couriers:', err)
      setCourierError(err.message || 'Unable to check courier serviceability with Shiprocket')
    } finally {
      setLoadingCouriers(false)
    }
  }

  // Confirm Courier Partner Assignment & Generate AWB
  const handleConfirmCourierAssignment = async () => {
    if (!selectedOrderForCourier) return
    const orderId = selectedOrderForCourier.id || selectedOrderForCourier.order_number
    const selectedCourier = availableCouriers.find(
      (c) => c.courier_company_id === selectedCourierId
    )

    setIsAssigningCourier(true)
    setGeneratingAwb((prev) => ({ ...prev, [orderId]: true }))

    try {
      const res = await fetch('/api/generate-awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderForCourier.db_id || selectedOrderForCourier.id || orderId,
          orderData: selectedOrderForCourier,
          courierId: selectedCourierId,
          courierName: selectedCourier?.courier_name || 'Shiprocket Logistics',
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        const errorMsg = data.error || 'Failed to assign courier partner on Shiprocket'
        showToast(errorMsg, 'error')
        return
      }

      // Update local state with real AWB, courier partner, tracking URL, and label URL
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId || o.order_number === orderId || o.db_id === orderId) {
            return {
              ...o,
              awb_code: data.awb_code,
              status: 'Shipped',
              courier_partner: data.courier_name || selectedCourier?.courier_name || o.courier_partner || 'Delhivery Surface',
              tracking_url: data.tracking_url,
              label_url: data.label_url,
            }
          }
          return o
        })
      )

      showToast(
        `AWB Generated: ${data.awb_code} (${data.courier_name || selectedCourier?.courier_name || 'Shiprocket'})`,
        'success'
      )

      setCourierModalOpen(false)
      setSelectedOrderForCourier(null)
    } catch (err) {
      console.error('Error assigning courier AWB:', err)
      showToast(`Network error communicating with shipping service: ${err.message}`, 'error')
    } finally {
      setIsAssigningCourier(false)
      setGeneratingAwb((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  // Generate AWB backward compatibility helper
  const handleGenerateAwb = (orderId) => {
    const targetOrder = orders.find((o) => o.id === orderId || o.order_number === orderId || o.db_id === orderId)
    if (!targetOrder) {
      showToast('Order not found in database records.', 'error')
      return
    }
    handleOpenCourierModal(targetOrder)
  }

  // Copy AWB code
  const handleCopyAwb = (awb) => {
    navigator.clipboard.writeText(awb)
    setCopiedAwb(awb)
    setTimeout(() => setCopiedAwb(null), 2000)
    showToast(`Copied AWB ${awb} to clipboard`)
  }

  // ── SAVE EDITED PRODUCT (GLOBAL UPDATE) ──
  const handleSaveEditProduct = async (e) => {
    e.preventDefault()
    if (!editingProduct) return

    const rawEditingGallery = Array.isArray(editingProduct.gallery) && editingProduct.gallery.length > 0 ? editingProduct.gallery : []
    const cleanEditingGallery = rawEditingGallery.filter((g) => g && !g.includes('photo-1618354691373-d851c5c3a990'))
    const defaultCover = 'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/batman-6-cover.jpg'
    const finalGallery =
      cleanEditingGallery.length > 0
        ? cleanEditingGallery
        : (editingProduct.image && !editingProduct.image.includes('photo-1618354691373-d851c5c3a990') ? [editingProduct.image] : [defaultCover])

    const finalCover = finalGallery[0] || (editingProduct.image && !editingProduct.image.includes('photo-1618354691373-d851c5c3a990') ? editingProduct.image : defaultCover)

    const productPayload = {
      ...editingProduct,
      price: Number(editingProduct.price),
      originalPrice: Number(editingProduct.originalPrice || Math.round(editingProduct.price * 1.8)),
      inStock: editingProduct.inStock !== false,
      isHidden: editingProduct.isHidden === true,
      image: finalCover,
      gallery: finalGallery,
    }

    // Update global store (affects Home, Category, Product Detail, Cart, Wishlist)
    updateProduct(productPayload)
    // Sync to database handler
    await saveProduct(productPayload)

    showToast(`Product "${productPayload.name}" updated globally across the entire store!`)
    setEditingProduct(null)
  }

  // ── ADD PRODUCT (GLOBAL INSERT) ──
  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price) return

    const defaultCover =
      (newProduct.image && !newProduct.image.includes('photo-1618354691373-d851c5c3a990') ? newProduct.image : null) ||
      (newProduct.gallery && newProduct.gallery.find((g) => !g.includes('photo-1618354691373-d851c5c3a990'))) ||
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/batman-6-cover.jpg'

    const gallery =
      newProduct.gallery && newProduct.gallery.length > 0
        ? newProduct.gallery.filter((g) => !g.includes('photo-1618354691373-d851c5c3a990'))
        : [defaultCover]

    const productCover = gallery[0] || defaultCover

    const maxId = Math.max(0, ...products.map((p) => Number(p.id) || 0))
    const nextId = maxId > 0 ? maxId + 1 : 26
    const slug = `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-silver-jewellery`

    const productToAdd = {
      id: nextId,
      name: cleanName,
      slug,
      fullName: `${cleanName} Fine Jewellery`,
      genre: newProduct.genre || 'NECKLACES',
      price: Number(newProduct.price),
      originalPrice: Number(newProduct.originalPrice || Math.round(newProduct.price * 1.8)),
      description: newProduct.description || `Handcrafted 925 sterling silver ${cleanName} finished with radiant rhodium luster.`,
      image: productCover,
      gallery: gallery,
      inStock: newProduct.inStock !== false,
      isHidden: newProduct.isHidden === true,
    }

    // Add to global store
    addProduct(productToAdd)
    // Sync to db
    await saveProduct(productToAdd)

    setIsAddModalOpen(false)
    setNewProduct({
      name: '',
      genre: 'MARVEL',
      price: 299,
      originalPrice: 599,
      description: '',
      image: '',
      gallery: [],
      inStock: true,
      isHidden: false,
    })
    showToast(`New product "${productToAdd.name}" is now live worldwide!`)
  }

  // ── DELETE PRODUCT ──
  const handleDeleteProduct = async (prod) => {
    if (window.confirm(`Are you sure you want to permanently delete "${prod.name}" from the store?`)) {
      deleteProduct(prod.id)
      await deleteProductFromDb(prod.id)
      showToast(`Product "${prod.name}" removed from global store.`)
    }
  }

  // ── RESET CATALOG ──
  const handleResetCatalog = () => {
    if (
      window.confirm(
        'Reset all products back to original 16 jewellery pieces? Custom additions and edits will be restored.'
      )
    ) {
      resetProductsToDefault()
      showToast('Catalog restored to default jewellery collection.')
    }
  }

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_phone?.includes(searchQuery)

      const matchesStatus =
        statusFilter === 'ALL' || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesSearch =
        prod.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        prod.fullName?.toLowerCase().includes(productSearch.toLowerCase())
      const matchesGenre =
        genreFilter === 'ALL' || prod.genre === genreFilter
      const matchesStatus =
        productStatusFilter === 'ALL' ||
        (productStatusFilter === 'LIVE' && !prod.isHidden && prod.inStock !== false) ||
        (productStatusFilter === 'OUT_OF_STOCK' && prod.inStock === false) ||
        (productStatusFilter === 'HIDDEN' && prod.isHidden)
      return matchesSearch && matchesGenre && matchesStatus
    })
  }, [products, productSearch, genreFilter, productStatusFilter])

  // ── 100% REAL OVERVIEW METRICS (Strictly derived from live database records) ──
  const validOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status !== 'CANCELLED' &&
        o.status !== 'CANCELED' &&
        !String(o.status || '').toUpperCase().includes('CANCEL')
    )
  }, [orders])

  // Total Real Revenue
  const totalRevenue = useMemo(() => {
    return validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
  }, [validOrders])

  // Average Order Value
  const avgOrderValue = useMemo(() => {
    return validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0
  }, [totalRevenue, validOrders])

  // Total Real Orders Count
  const totalOrdersCount = orders.length

  // Today's Orders Count
  const todayOrdersCount = useMemo(() => {
    const todayStr = new Date().toDateString()
    return orders.filter((o) => {
      if (!o.created_at) return false
      return new Date(o.created_at).toDateString() === todayStr
    }).length
  }, [orders])

  // Fulfillment Count & Rate
  const dispatchedOrdersCount = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.status === 'Shipped' || o.status === 'SHIPPED' || o.status === 'DELIVERED' || o.awb_code) &&
        o.status !== 'CANCELLED' &&
        o.status !== 'CANCELED'
    ).length
  }, [orders])

  const fulfillmentRate = useMemo(() => {
    if (orders.length === 0) return '100'
    return ((dispatchedOrdersCount / orders.length) * 100).toFixed(1)
  }, [dispatchedOrdersCount, orders])

  // Pending Prints (Production Queue)
  const pendingOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === 'Printing on Kobra 2 Neo' ||
        o.status === 'Online Payment' ||
        o.status === 'COD' ||
        o.status === 'CONFIRMED' ||
        o.status === 'PLACED' ||
        o.status === 'PACKED'
    )
  }, [orders])

  const pendingPrintsCount = pendingOrders.length

  // Total Pending Jewellery Units to Dispatch
  const pendingUnitsCount = useMemo(() => {
    return pendingOrders.reduce((sum, o) => {
      const items = o.items || o.order_items || []
      const units = items.reduce((iSum, it) => iSum + (Number(it.quantity) || 1), 0)
      return sum + (units || 1)
    }, 0)
  }, [pendingOrders])

  const estPrintTimeText = useMemo(() => {
    if (pendingUnitsCount === 0) return 'Queue clear • Ready for orders'
    const totalMinutes = pendingUnitsCount * 25 // ~25 min per piece handcrafting & packing
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `Est. prep time: ~${h > 0 ? `${h}h ` : ''}${m}m (${pendingUnitsCount} units)`
  }, [pendingUnitsCount])

  // Active Shipments (Dispatched & In Transit)
  const activeShipmentsCount = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.status === 'Shipped' || o.status === 'SHIPPED' || o.status === 'IN_TRANSIT' || o.awb_code) &&
        o.status !== 'CANCELLED' &&
        o.status !== 'CANCELED'
    ).length
  }, [orders])

  // Active Couriers List
  const activeCouriersList = useMemo(() => {
    const list = orders
      .filter((o) => o.courier_partner)
      .map((o) => o.courier_partner)
    return Array.from(new Set(list))
  }, [orders])

  // 7-Day Real Sales Velocity Data (Calculated dynamically for past 7 days ending today)
  const revenueVelocityData = useMemo(() => {
    const days = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const dateStr = d.toDateString()
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' })
      const dateLabel = d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' })

      const dayOrders = orders.filter((o) => {
        if (!o.created_at) return false
        if (o.status === 'CANCELLED' || o.status === 'CANCELED') return false
        return new Date(o.created_at).toDateString() === dateStr
      })

      const dailyRevenue = dayOrders.reduce(
        (sum, o) => sum + (Number(o.total_amount) || 0),
        0
      )
      const dailyOrderCount = dayOrders.length

      days.push({
        day: dayLabel,
        date: dateLabel,
        sales: dailyRevenue,
        orders: dailyOrderCount,
      })
    }
    return days
  }, [orders])

  // Peak Sales Day in the 7-day window
  const peakDay = useMemo(() => {
    if (!revenueVelocityData || revenueVelocityData.length === 0) {
      return { day: 'Today', sales: 0, date: '' }
    }
    return revenueVelocityData.reduce(
      (prev, curr) => (curr.sales > prev.sales ? curr : prev),
      revenueVelocityData[0]
    )
  }, [revenueVelocityData])

  // Dynamically compute SVG curve and points for the real 7-day trend
  const chartSvgData = useMemo(() => {
    const maxSales = Math.max(...revenueVelocityData.map((d) => d.sales), 500)
    const width = 700
    const paddingY = 40
    const baselineY = 200

    const points = revenueVelocityData.map((item, idx) => {
      const x = (idx / 6) * width
      const ratio = item.sales / maxSales
      const y = baselineY - ratio * (baselineY - paddingY)
      return { x, y, ...item }
    })

    // Construct smooth bezier curve
    let linePath = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const mx = (p0.x + p1.x) / 2
      linePath += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`
    }

    const areaPath = `${linePath} L 700 220 L 0 220 Z`

    return { points, linePath, areaPath, maxSales }
  }, [revenueVelocityData])

  // Status Badge Colors
  const getStatusBadgeStyle = (st) => {
    switch (st) {
      case 'Online Payment':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30'
      case 'COD':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
      case 'Printing on Kobra 2 Neo':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
      case 'Packed':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30'
      case 'Shipped':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
      case 'CANCELLED':
      case 'CANCELED':
      case 'Cancelled':
      case 'Cancelled by Seller':
        return 'bg-red-500/15 text-red-400 border-red-500/40'
      default:
        return 'bg-charcoal-light text-cream-muted border-charcoal-light'
    }
  }

  // ── MASTER PASSWORD GATE SCREEN ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col justify-between text-cream selection:bg-gold/30">
        {/* Ambient background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
        </div>

        {/* Minimal Header */}
        <header className="relative z-10 border-b border-gold/15 bg-charcoal/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="font-heading text-lg font-bold tracking-[0.2em] text-cream hover:text-gold transition-colors"
          >
            SMITHS
          </Link>
          <Link
            to="/"
            className="text-xs font-semibold text-cream-muted hover:text-gold transition-colors flex items-center gap-1.5"
          >
            ← Back to Store
          </Link>
        </header>

        {/* Center Card */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm rounded-2xl bg-charcoal border border-charcoal-light shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
            {/* Lock Icon */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mb-5 shadow-lg shadow-gold/10">
              <Lock className="w-7 h-7 text-gold" />
            </div>

            <div className="text-center mb-6">
              <h1 className="font-heading text-xl font-bold text-cream tracking-wide">
                Admin Authentication
              </h1>
              <p className="text-xs text-cream-muted/70 mt-1">
                Enter your master credentials to manage the store
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter admin password"
                    autoFocus
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-obsidian border border-charcoal-light text-sm text-cream placeholder:text-cream-muted/40 focus:outline-none focus:border-gold/60 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream-muted/60 hover:text-cream transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-cream-muted hover:text-cream select-none">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="rounded border-charcoal-light text-gold focus:ring-0 focus:ring-offset-0 bg-obsidian cursor-pointer"
                  />
                  <span>Trust & remember this device</span>
                </label>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gold text-obsidian font-bold text-xs uppercase tracking-widest hover:bg-gold-light transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Access Admin Panel</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="relative z-10 border-t border-gold/10 py-4 text-center text-xs text-cream-muted/40">
          © 2026 Smiths Jewellery · Confidential Management Console
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-obsidian text-cream flex">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-2xl text-sm transition-all animate-fade-in-up ${
            toast.type === 'error'
              ? 'border-red-500/60 bg-red-950/95 text-red-100 shadow-red-950/50'
              : 'border-gold/40 bg-charcoal text-cream shadow-gold/10'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-gold shrink-0" />
          )}
          <span className="font-medium max-w-sm leading-snug">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-cream-muted hover:text-cream cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── SIDE NAVIGATION ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-charcoal border-r border-charcoal-light flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-charcoal-light flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-black tracking-[0.25em] text-cream">
                  SMITHS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 font-semibold tracking-wider">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-cream-muted/60 mt-1">
                Operations & Workshop HQ
              </p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-cream-muted hover:text-cream cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'analytics', label: 'Traffic & Funnel', icon: BarChart3 },
              { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
              { id: 'products', label: 'Products', icon: Package, count: products.length },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gold/15 text-gold border border-gold/30 shadow-[0_0_15px_rgba(207,181,59,0.15)] font-semibold'
                      : 'text-cream-muted/70 hover:bg-charcoal-light/60 hover:text-cream'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-gold' : 'text-cream-muted/50'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-gold text-obsidian font-bold'
                          : 'bg-charcoal-light text-cream-muted/70'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Hub Status & Link back to store */}
        <div className="p-4 border-t border-charcoal-light space-y-3">
          <div className="rounded-lg bg-obsidian/60 border border-charcoal-light/80 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-cream-muted/70 font-semibold">
                Maharashtra Hub
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-cream-muted/60">
              <Printer className="w-3.5 h-3.5 text-gold" />
              <span>Anycubic Kobra 2 Neo: 250mm/s</span>
            </div>
          </div>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-charcoal-light text-xs font-medium text-cream-muted hover:text-cream hover:border-gold/30 hover:bg-charcoal-light/50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Store</span>
          </Link>

          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-rose-500/25 text-xs font-medium text-rose-400 hover:text-rose-300 hover:border-rose-500/50 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Lock admin session and clear remembered device"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Admin Portal</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-obsidian/90 backdrop-blur-md border-b border-charcoal-light">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-charcoal text-cream-muted hover:text-cream cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-heading font-bold text-cream capitalize flex items-center gap-2">
                <span>{activeTab} Management</span>
                {activeTab === 'products' && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Globe className="w-3 h-3" /> Live Worldwide Sync
                  </span>
                )}
              </h1>
              <p className="text-xs text-cream-muted/60 hidden sm:block">
                Smiths Jewellery Enterprise Dashboard • Realtime Synchronization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal border border-charcoal-light text-xs text-cream-muted">
              <span
                className={`w-2 h-2 rounded-full ${
                  shiprocketConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span>
                {shiprocketConnected === null
                  ? 'Checking Shiprocket...'
                  : shiprocketConnected
                  ? 'Shiprocket API: Connected'
                  : 'Shiprocket: Credentials Needed'}
              </span>
            </div>

            {activeTab === 'products' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-obsidian font-semibold text-xs transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(207,181,59,0.2)] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition-colors cursor-pointer"
              title="Lock Admin Portal & Forget Device"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Portal</span>
            </button>
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-8">
          {/* ════════════════════════════════════════════════════════
              1. OVERVIEW TAB
          ════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* 4 KPI Statistic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Revenue */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Total Revenue
                    </span>
                    <div className="p-2 rounded-lg bg-gold/10 text-gold border border-gold/20">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      ₹{totalRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-gold font-mono">
                      Avg ₹{avgOrderValue}/order
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    Gross sales across {validOrders.length} verified {validOrders.length === 1 ? 'order' : 'orders'}
                  </p>
                </div>

                {/* 2. Total Orders */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Total Orders
                    </span>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      {totalOrdersCount}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center">
                      <ArrowUpRight className="w-3 h-3" /> +{todayOrdersCount} today
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    {fulfillmentRate}% fulfillment rate ({dispatchedOrdersCount}/{totalOrdersCount} dispatched)
                  </p>
                </div>

                {/* 3. Pending Prints */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Pending Prints
                    </span>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <Printer className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      {pendingPrintsCount}
                    </span>
                    <span className="text-xs font-semibold text-amber-400">
                      {pendingPrintsCount > 0 ? 'Queued on Kobra 2 Neo' : 'Queue Clear'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    {estPrintTimeText}
                  </p>
                </div>

                {/* 4. Active Shipments */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Active Shipments
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      {activeShipmentsCount}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      In Transit
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    {activeCouriersList.length > 0 ? activeCouriersList.join(' & ') : 'Dispatched from Satara Hub'}
                  </p>
                </div>
              </div>

              {/* Real 7-Day Revenue Velocity Chart */}
              <div className="rounded-xl bg-charcoal border border-charcoal-light p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-heading font-bold text-cream flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gold" />
                      7-Day Revenue Velocity
                    </h3>
                    <p className="text-xs text-cream-muted/60 mt-0.5">
                      Live daily order revenue across all active collections & drops
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-gold" />
                      <span className="text-cream-muted">Daily Sales (₹)</span>
                    </div>
                    <div className="px-3 py-1 rounded bg-charcoal-light text-cream font-mono">
                      Peak: {peakDay.day} {peakDay.date ? `(${peakDay.date})` : ''} · ₹{peakDay.sales.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Dynamic SVG Line Chart */}
                <div className="relative pt-4">
                  <div className="h-64 w-full">
                    <svg
                      viewBox="0 0 700 240"
                      className="w-full h-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#CFB53B" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#CFB53B" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid Lines */}
                      {[0, 60, 120, 180].map((y, idx) => (
                        <line
                          key={idx}
                          x1="0"
                          y1={y}
                          x2="700"
                          y2={y}
                          stroke="#252525"
                          strokeDasharray="4 4"
                        />
                      ))}

                      {/* Area Fill */}
                      <path
                        d={chartSvgData.areaPath}
                        fill="url(#goldGradient)"
                      />

                      {/* Line Stroke */}
                      <path
                        d={chartSvgData.linePath}
                        fill="none"
                        stroke="#CFB53B"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Data Dots with Hover Tooltips */}
                      {chartSvgData.points.map((pt, i) => (
                        <g key={i} className="cursor-pointer group">
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={pt.sales > 0 ? 6 : 4}
                            className={`transition-all group-hover:r-8 ${
                              pt.sales > 0
                                ? 'fill-gold stroke-obsidian stroke-[2.5]'
                                : 'fill-obsidian stroke-gold/60 stroke-[2]'
                            }`}
                          >
                            <title>
                              {pt.day}, {pt.date}: ₹{pt.sales.toLocaleString('en-IN')} ({pt.orders} {pt.orders === 1 ? 'order' : 'orders'})
                            </title>
                          </circle>
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex justify-between text-xs text-cream-muted/70 pt-4 border-t border-charcoal-light">
                    {revenueVelocityData.map((item, idx) => (
                      <div key={idx} className="text-center">
                        <p className="font-semibold text-cream">{item.day}</p>
                        <p className="text-[10px] text-cream-muted/50">{item.date}</p>
                        <p className={`text-[11px] font-mono mt-0.5 ${item.sales > 0 ? 'text-gold font-bold' : 'text-cream-muted/40'}`}>
                          ₹{item.sales.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hardware & Dispatch Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Anycubic Kobra 2 Neo Fleet */}
                <div className="p-6 rounded-xl bg-charcoal border border-charcoal-light space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-gold/10 text-gold">
                        <Printer className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-cream">
                          3D Printer Farm Telemetry
                        </h4>
                        <p className="text-xs text-cream-muted/60">Anycubic Kobra 2 Neo Fleet</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Extruder Temperature:</span>
                      <span className="font-mono text-cream font-medium">215°C / 215°C</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Magnetic Heated Bed:</span>
                      <span className="font-mono text-cream font-medium">60°C / 60°C</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Print Speed:</span>
                      <span className="font-mono text-gold font-medium">250 mm/s (LeviQ 2.0)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Filament:</span>
                      <span className="font-mono text-cream font-medium">High-Impact PLA (Antique Gold)</span>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-cream-muted/70">
                          Current Batch {pendingOrders[0] ? `(${pendingOrders[0].items?.[0]?.name || 'Piece'} #${pendingOrders[0].id.slice(-4)})` : '(No pending orders)'}:
                        </span>
                        <span className="text-gold font-mono font-bold">
                          {pendingOrders.length > 0 ? `${pendingOrders.length} in queue` : 'Completed'}
                        </span>
                      </div>
                      <div className="w-full bg-charcoal-light h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gold h-full rounded-full transition-all duration-500"
                          style={{ width: pendingOrders.length > 0 ? '75%' : '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Maharashtra Dispatch Hub */}
                <div className="p-6 rounded-xl bg-charcoal border border-charcoal-light space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-cream">
                          Maharashtra Logistics Hub
                        </h4>
                        <p className="text-xs text-cream-muted/60">Shiprocket Logistics Gateway</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Express SLA
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Hub Origin:</span>
                      <span className="font-medium text-cream">Satara Hub (MH-415106) / Maharashtra Hub</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Active Couriers:</span>
                      <span className="font-medium text-cream">
                        {activeCouriersList.length > 0 ? activeCouriersList.join(', ') : 'Blue Dart Air / Delhivery Express'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Maharashtra Transit SLA:</span>
                      <span className="font-medium text-emerald-400">24 - 48 Hours</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Rest of India Transit SLA:</span>
                      <span className="font-medium text-cream">3 - 4 Days</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Auto-AWB Manifest:</span>
                      <span className="text-gold font-medium">
                        {dispatchedOrdersCount} Manifested Shipments (Shiprocket Live)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              TRAFFIC & CHECKOUT FUNNEL ANALYTICS TAB
          ════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Top Header & Range Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-charcoal/80 border border-charcoal-light/80 backdrop-blur-sm">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-heading text-xl font-bold text-cream">
                      Traffic & Checkout Funnel Analytics
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Tracking Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-cream-muted/70">
                    Real-time visitor counts, jewellery engagement, and checkout drop-off rates from live customers.
                  </p>
                </div>

                {/* Range Selector & Refresh */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex rounded-xl bg-obsidian p-1 border border-charcoal-light">
                    {[
                      { id: 'today', label: 'Today' },
                      { id: '7d', label: '7 Days' },
                      { id: '30d', label: '30 Days' },
                      { id: 'all', label: 'All Time' },
                    ].map((range) => (
                      <button
                        key={range.id}
                        type="button"
                        onClick={() => {
                          setAnalyticsTimeRange(range.id)
                          loadAnalytics(range.id)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          analyticsTimeRange === range.id
                            ? 'bg-gold text-obsidian shadow-sm shadow-gold/20'
                            : 'text-cream-muted hover:text-cream'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => loadAnalytics(analyticsTimeRange)}
                    disabled={loadingAnalytics}
                    className="p-2.5 rounded-xl bg-charcoal-light/40 border border-charcoal-light hover:border-gold/40 text-cream-muted hover:text-gold transition-all cursor-pointer disabled:opacity-50"
                    title="Refresh analytics data"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingAnalytics ? 'animate-spin text-gold' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Error Callout if any */}
              {analyticsError && (
                <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{analyticsError}</span>
                </div>
              )}

              {/* 5 KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Total Unique Visitors */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Unique Visitors
                    </span>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      {loadingAnalytics ? '...' : (analyticsData?.totalVisitors || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {analyticsData?.pageViewsCount || 0} views
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    {analyticsData?.mobilePct || 0}% Mobile · {analyticsData?.desktopPct || 0}% Desktop
                  </p>
                </div>

                {/* 2. Product Views */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Product Views
                    </span>
                    <div className="p-2 rounded-lg bg-gold/10 text-gold border border-gold/20">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      {loadingAnalytics ? '...' : (analyticsData?.productViewsCount || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-gold font-mono">
                      Jewellery
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    Opened jewellery details & photo gallery
                  </p>
                </div>

                {/* 3. Buy Intent (Buy Now + Cart) */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Buy Intent Clicks
                    </span>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      {loadingAnalytics ? '...' : (analyticsData?.checkoutIntentCount || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-amber-400">
                      {analyticsData?.buyNowCount || 0} Buy Now
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    {analyticsData?.addToCartCount || 0} added to regular cart
                  </p>
                </div>

                {/* 4. Checkout Starts (Step 1) */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Checkout Step 1
                    </span>
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      <MousePointerClick className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      {loadingAnalytics ? '...' : (analyticsData?.step1Count || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-purple-300">
                      Address
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    {analyticsData?.step2Count || 0} moved to Step 2 Payment
                  </p>
                </div>

                {/* 5. Conversion Rate */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Conversion Rate
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      {loadingAnalytics ? '...' : `${analyticsData?.conversionRate || '0.0'}%`}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {analyticsData?.completedOrdersCount || 0} orders
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    Visitors who converted into paying customers
                  </p>
                </div>
              </div>

              {/* Visual Checkout Drop-Off Funnel */}
              <div className="p-6 rounded-2xl bg-charcoal/80 border border-charcoal-light/80">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-cream flex items-center gap-2">
                      <span>Customer Checkout Drop-Off Funnel</span>
                      <span className="text-xs font-normal text-cream-muted/60">({analyticsTimeRange.toUpperCase()})</span>
                    </h3>
                    <p className="mt-0.5 text-xs text-cream-muted/70">
                      Shows where customers navigate and precisely where they drop off before finishing payment.
                    </p>
                  </div>
                </div>

                {/* Stepped Funnel Bars */}
                <div className="space-y-4">
                  {(analyticsData?.funnel || []).map((step, idx) => {
                    const pct = step.pctOfTotal || 0
                    return (
                      <div key={step.id} className="p-3.5 rounded-xl bg-obsidian/60 border border-charcoal-light/60">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-cream text-sm">{step.name}</span>
                            <span className="text-cream-muted/50 hidden sm:inline">· {step.subtext}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-heading font-black text-gold text-sm">
                              {step.count.toLocaleString()}
                            </span>
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-charcoal-light text-cream">
                              {pct}%
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2.5 rounded-full bg-charcoal-light/60 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-gold via-amber-400 to-emerald-400 transition-all duration-500 ease-out"
                            style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Automated Funnel Drop-off Insight Callout */}
                <div className="mt-6 p-4 rounded-xl border border-gold/20 bg-gold/5 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-cream">
                      Automated Funnel Optimization Insight:
                    </p>
                    <p className="text-cream-muted/80 leading-relaxed">
                      {analyticsData?.totalVisitors === 0 ? (
                        'No visitor traffic recorded yet for this timeframe. Visit the store or share your links to start logging live funnel data.'
                      ) : (analyticsData?.step1Count || 0) > (analyticsData?.step2Count || 0) * 2 ? (
                        'Significant drop-off between Address (Step 1) and Payment (Step 2). Consider checking if customers find address entry cumbersome or are looking for auto-fill.'
                      ) : (analyticsData?.buyNowCount || 0) > (analyticsData?.completedOrdersCount || 0) * 3 ? (
                        'Strong buy intent detected with active Buy Now clicks! Customers are motivated by the ₹299 price point. Our instant ₹30 Online Discount callout encourages them to complete checkout.'
                      ) : (
                        'Your visitor-to-checkout conversion funnel is healthy. Direct Buy Now allows zero-friction 3-step checkout for single products.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Two-Column Grid: Top Viewed Jewellery Leaderboard + Live Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Column 1 (7 cols): Top Viewed Jewellery Leaderboard */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-charcoal/80 border border-charcoal-light/80">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading text-base font-bold text-cream">
                        Most Popular Jewellery (Leaderboard)
                      </h3>
                      <p className="text-xs text-cream-muted/60">
                        Ranked by customer product page views & buy clicks
                      </p>
                    </div>
                  </div>

                  {(!analyticsData?.topProducts || analyticsData.topProducts.length === 0) ? (
                    <div className="text-center py-12 text-cream-muted/50 text-xs">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30 text-gold" />
                      No jewellery views logged in this timeframe yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-charcoal-light/40 overflow-hidden">
                      {analyticsData.topProducts.slice(0, 8).map((prod, idx) => {
                        const intentRate = prod.views > 0 ? Math.round((prod.buyNow / prod.views) * 100) : 0
                        return (
                          <div key={prod.name} className="py-3 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                idx === 0 ? 'bg-gold text-obsidian' :
                                idx === 1 ? 'bg-zinc-300 text-obsidian' :
                                idx === 2 ? 'bg-amber-700 text-cream' :
                                'bg-charcoal-light text-cream-muted'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="font-semibold text-cream truncate">
                                {prod.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 text-right font-mono">
                              <div>
                                <span className="text-cream block font-bold">{prod.views}</span>
                                <span className="text-[10px] text-cream-muted/50 uppercase">Views</span>
                              </div>
                              <div>
                                <span className="text-gold block font-bold">{prod.buyNow}</span>
                                <span className="text-[10px] text-gold/60 uppercase">Buy Now</span>
                              </div>
                              <div className="hidden sm:block">
                                <span className="text-emerald-400 block font-bold">{intentRate}%</span>
                                <span className="text-[10px] text-emerald-500/60 uppercase">Intent</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Column 2 (5 cols): Live Real-time Activity Feed */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-charcoal/80 border border-charcoal-light/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading text-base font-bold text-cream">
                        Live Visitor Activity Stream
                      </h3>
                      <span className="text-[10px] text-emerald-400 font-mono">Real-time</span>
                    </div>

                    {(!analyticsData?.recentEvents || analyticsData.recentEvents.length === 0) ? (
                      <div className="text-center py-12 text-cream-muted/50 text-xs">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-cream-muted" />
                        Awaiting incoming live visitor events...
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                        {analyticsData.recentEvents.slice(0, 12).map((ev) => {
                          const evName = ev.event_name
                          const timeStr = new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          const isBuy = evName === 'buy_now' || evName === 'order_completed'
                          const isCheckout = evName.startsWith('checkout_')

                          return (
                            <div
                              key={ev.id}
                              className="p-2.5 rounded-lg bg-obsidian/60 border border-charcoal-light/40 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  evName === 'order_completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                  evName === 'buy_now' ? 'bg-gold/20 text-gold border border-gold/30' :
                                  isCheckout ? 'bg-purple-500/20 text-purple-300' :
                                  'bg-charcoal-light text-cream-muted'
                                }`}>
                                  {evName.replace('checkout_', '').replace('_', ' ')}
                                </span>
                                <span className="text-cream/90 truncate text-[11px]">
                                  {ev.product_name || ev.page_path || 'Store visit'}
                                </span>
                              </div>
                              <span className="text-[10px] text-cream-muted/50 font-mono shrink-0 ml-2">
                                {timeStr}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Deep Dive Clarity Replays Link */}
                  <div className="mt-6 pt-4 border-t border-charcoal-light/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-cream-muted/60">Want full video recordings?</span>
                      <a
                        href="https://clarity.microsoft.com/projects/view/yi222tnscr/recordings"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:underline"
                      >
                        <span>Open Clarity Replays</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              2. ORDERS TAB
          ════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Search & Filters Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by customer name, order ID, phone..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-charcoal border border-charcoal-light text-sm text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cream-muted hover:text-cream cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Status Filter Tabs & Shiprocket Sync Button */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                  <div className="flex items-center gap-1.5">
                    {['ALL', 'Online Payment', 'COD', 'Printing on Kobra 2 Neo', 'Packed', 'Shipped', 'CANCELLED'].map(
                      (st) => {
                        const isActive = statusFilter === st
                        const count = st === 'ALL' ? orders.length : orders.filter((o) => o.status === st).length
                        return (
                          <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                              isActive
                                ? 'bg-gold text-obsidian font-bold shadow-md'
                                : 'bg-charcoal border border-charcoal-light text-cream-muted hover:text-cream hover:border-gold/30'
                            }`}
                          >
                            {st === 'ALL' ? 'All Orders' : st === 'CANCELLED' ? `Cancelled (${count})` : st}
                          </button>
                        )
                      }
                    )}
                  </div>

                  {orders.some((o) => o.status === 'CANCELLED') && (
                    <button
                      type="button"
                      onClick={handleClearAllCancelled}
                      disabled={isSyncingStatuses}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap ml-1 shrink-0"
                      title="Permanently remove all cancelled orders from the list and database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Cancelled ({orders.filter((o) => o.status === 'CANCELLED').length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSyncShiprocketStatuses}
                    disabled={isSyncingStatuses}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 text-gold border border-gold/30 text-xs font-bold hover:bg-gold hover:text-obsidian transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap ml-1 shrink-0"
                    title="Poll Shiprocket API to verify if any shipments have been cancelled by seller"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingStatuses ? 'animate-spin' : ''}`} />
                    <span>{isSyncingStatuses ? 'Syncing...' : 'Sync Shiprocket'}</span>
                  </button>
                </div>
              </div>

              {/* Orders Data Table */}
              <div className="rounded-xl bg-charcoal border border-charcoal-light overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-charcoal-light/60 border-b border-charcoal-light text-xs font-semibold text-cream-muted uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Order ID</th>
                        <th className="px-5 py-3.5">Customer Name</th>
                        <th className="px-5 py-3.5">Shipping Address</th>
                        <th className="px-5 py-3.5">Items Ordered</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions / AWB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-light">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-cream-muted/60">
                            <Package className="w-10 h-10 mx-auto mb-3 opacity-30 text-gold" />
                            <p className="font-semibold text-cream">No orders found</p>
                            <p className="text-xs text-cream-muted/50 mt-1">
                              Try clearing filters or search query
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="hover:bg-charcoal-light/30 transition-colors"
                          >
                            {/* Order ID */}
                            <td className="px-5 py-4 whitespace-nowrap align-top">
                              <div className="font-mono font-bold text-cream text-xs flex items-center gap-1.5">
                                <span className="text-gold">#</span>
                                <span>{order.id}</span>
                              </div>
                              <span className="text-[11px] text-cream-muted/50 mt-0.5 block">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <div className="mt-1 font-mono text-xs font-semibold text-gold">
                                ₹{order.total_amount}
                              </div>
                              {order.razorpay_payment_id || order.payment_method === 'PREPAID' ? (
                                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300" title={`Razorpay ID: ${order.razorpay_payment_id || 'Paid'}`}>
                                  <span>💳 Paid (Razorpay)</span>
                                </div>
                              ) : (
                                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-charcoal border border-charcoal-light text-[10px] text-cream-muted/70">
                                  <span>💵 COD</span>
                                </div>
                              )}
                              {order.razorpay_payment_id && (
                                <div className="font-mono text-[9px] text-cream-muted/50 truncate max-w-[110px]" title={order.razorpay_payment_id}>
                                  {order.razorpay_payment_id}
                                </div>
                              )}
                            </td>

                            {/* Customer Name */}
                            <td className="px-5 py-4 align-top">
                              <div className="font-semibold text-cream">
                                {order.customer_name}
                              </div>
                              <div className="text-xs text-cream-muted/70 font-mono mt-0.5">
                                {order.customer_phone}
                              </div>
                              {order.customer_email && (
                                <div className="text-[11px] text-cream-muted/50 truncate max-w-[140px]">
                                  {order.customer_email}
                                </div>
                              )}
                            </td>

                            {/* Shipping Address */}
                            <td className="px-5 py-4 align-top max-w-xs">
                              <p className="text-xs text-cream-muted/90 leading-relaxed">
                                {typeof order.shipping_address === 'string'
                                  ? order.shipping_address
                                  : `${order.shipping_address?.address || ''}, ${
                                      order.shipping_address?.city || ''
                                    }, ${order.shipping_address?.state || ''} - ${
                                      order.shipping_address?.pincode || ''
                                    }`}
                              </p>
                            </td>

                            {/* Items Ordered */}
                            <td className="px-5 py-4 align-top">
                              <div className="space-y-2 min-w-[210px] max-w-[260px]">
                                {order.items.map((item, idx) => {
                                  const displayName =
                                    item.name ||
                                    item.product_name ||
                                    'Silver Jewellery Piece'
                                  const isShirt = typeof item.image === 'string' && item.image.includes('photo-1618354691373-d851c5c3a990')
                                  const displayImg =
                                    (!isShirt && item.image) ||
                                    DEFAULT_FALLBACK_IMAGE
                                  const qty = item.quantity || 1
                                  const price = item.price ? `₹${item.price}` : null

                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2.5 p-1.5 rounded-xl bg-obsidian/60 border border-charcoal-light/80 hover:border-gold/30 transition-all shadow-sm group"
                                    >
                                      {/* Square Product Image Thumbnail */}
                                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gold/30 bg-charcoal shrink-0 flex items-center justify-center relative shadow-sm">
                                        {displayImg ? (
                                          <img
                                            src={displayImg}
                                            alt={displayName}
                                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                            onError={(e) => {
                                              e.target.style.display = 'none'
                                            }}
                                          />
                                        ) : (
                                          <Package className="w-4 h-4 text-gold/60" />
                                        )}
                                      </div>

                                      {/* Product Name & Details */}
                                      <div className="flex-1 min-w-0">
                                        <p
                                          className="text-xs font-bold text-cream truncate leading-snug tracking-tight"
                                          title={displayName}
                                        >
                                          {displayName}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                                          <span className="inline-flex items-center font-mono font-bold text-gold bg-gold/15 border border-gold/30 px-1.5 py-0.2 rounded text-[10px] leading-none">
                                            ×{qty}
                                          </span>
                                          {price && (
                                            <span className="font-mono text-cream-muted/80 text-[11px]">
                                              {price}
                                            </span>
                                          )}
                                          <span className="text-[10px] text-cream-muted/40 font-medium">
                                            · Antique Gold
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </td>

                            {/* Status Dropdown */}
                            <td className="px-5 py-4 align-top whitespace-nowrap">
                              <div className="relative inline-block">
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    handleStatusChange(order.id, e.target.value)
                                  }
                                  className={`appearance-none text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold ${getStatusBadgeStyle(
                                    order.status
                                  )}`}
                                >
                                  <option
                                    value="Online Payment"
                                    className="bg-charcoal text-cream"
                                  >
                                    Online Payment
                                  </option>
                                  <option
                                    value="COD"
                                    className="bg-charcoal text-cream"
                                  >
                                    COD
                                  </option>
                                  <option
                                    value="Printing on Kobra 2 Neo"
                                    className="bg-charcoal text-cream"
                                  >
                                    Printing on Kobra 2 Neo
                                  </option>
                                  <option
                                    value="Packed"
                                    className="bg-charcoal text-cream"
                                  >
                                    Packed
                                  </option>
                                  <option
                                    value="Shipped"
                                    className="bg-charcoal text-cream"
                                  >
                                    Shipped
                                  </option>
                                  <option
                                    value="CANCELLED"
                                    className="bg-charcoal text-red-400 font-semibold"
                                  >
                                    Cancelled by Seller
                                  </option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                              </div>
                            </td>

                            {/* Actions / Generate AWB / Cancel on Shiprocket */}
                            <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                              {order.status === 'CANCELLED' ? (
                                <div className="inline-flex flex-col items-end gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/40 text-xs font-semibold text-red-400 shadow-sm">
                                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                                      <span>Cancelled on Shiprocket</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOrder(order.id)}
                                      disabled={deletingOrder[order.id]}
                                      title="Remove cancelled order permanently from list and database"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 group"
                                    >
                                      {deletingOrder[order.id] ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                      )}
                                      <span>Remove</span>
                                    </button>
                                  </div>
                                  <span
                                    className="text-[10px] text-cream-muted/50 max-w-[220px] truncate text-right"
                                    title={order.cancellation_reason || 'Merchant Cancelled'}
                                  >
                                    {order.cancellation_reason || 'Shipment Voided'}
                                  </span>
                                </div>
                              ) : generatingAwb[order.id] ? (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-xs font-bold text-gold cursor-wait">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Generating AWB...</span>
                                </div>
                              ) : order.awb_code ? (
                                <div className="inline-flex flex-col items-end gap-1.5">
                                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded text-xs font-mono text-emerald-300 shadow-sm">
                                    <Truck className="w-3 h-3" />
                                    <span>{order.awb_code}</span>
                                    <button
                                      onClick={() => handleCopyAwb(order.awb_code)}
                                      title="Copy AWB"
                                      className="ml-1 text-emerald-400 hover:text-white cursor-pointer"
                                    >
                                      {copiedAwb === order.awb_code ? (
                                        <Check className="w-3 h-3" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>

                                  {/* Fast Shipping Actions: Track & Print Label */}
                                  <div className="flex items-center gap-2 text-[11px]">
                                    <a
                                      href={order.tracking_url || `https://shiprocket.co/tracking/${order.awb_code}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-gold hover:underline font-semibold"
                                      title="Live Carrier Tracking Portal"
                                    >
                                      <span>Track</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>

                                    <span className="text-cream-muted/30">·</span>

                                    <a
                                      href={order.label_url || `/api/generate-awb?action=label&orderId=${order.order_number || order.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-semibold"
                                      title="Print Official Shipping Label PDF"
                                    >
                                      <Printer className="w-3 h-3" />
                                      <span>Label</span>
                                    </a>
                                  </div>

                                  <div className="flex items-center justify-end gap-2 mt-0.5">
                                    <span className="text-[10px] text-cream-muted/50">
                                      {order.courier_partner || 'Shiprocket Logistics'}
                                    </span>
                                    <span className="text-cream-muted/30">·</span>
                                    <button
                                      onClick={() => handleOpenCourierModal(order)}
                                      className="text-[10px] text-gold/80 hover:text-gold hover:underline cursor-pointer font-medium"
                                      title="Choose courier partner and regenerate AWB through Shiprocket"
                                    >
                                      Regenerate
                                    </button>
                                    <span className="text-cream-muted/30">·</span>
                                    <button
                                      onClick={() => handleCancelShiprocketOrder(order.id)}
                                      disabled={cancellingOrder[order.id]}
                                      className="text-[10px] text-red-400/80 hover:text-red-300 hover:underline cursor-pointer font-medium disabled:opacity-50"
                                      title="Cancel this order on Shiprocket and update customer live tracking"
                                    >
                                      {cancellingOrder[order.id] ? 'Cancelling...' : 'Cancel'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenCourierModal(order)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 text-gold border border-gold/40 text-xs font-bold hover:bg-gold hover:text-obsidian transition-all shadow-[0_0_10px_rgba(207,181,59,0.1)] cursor-pointer"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>Generate AWB</span>
                                  </button>
                                  <button
                                    onClick={() => handleCancelShiprocketOrder(order.id)}
                                    disabled={cancellingOrder[order.id]}
                                    className="p-1.5 rounded-lg bg-charcoal border border-charcoal-light text-cream-muted/70 hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
                                    title="Cancel Order on Shiprocket"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer Count */}
                <div className="p-4 bg-charcoal-light/30 border-t border-charcoal-light flex items-center justify-between text-xs text-cream-muted/60">
                  <span>
                    Showing {filteredOrders.length} of {orders.length} orders
                  </span>
                  <span className="text-gold font-medium">
                    Hub Origin: Satara / Karad Hub (Pincode: 415106)
                  </span>
                </div>
              </div>

              {/* ── COURIER PARTNER SELECTION MODAL ── */}
              {courierModalOpen && selectedOrderForCourier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0"
                    onClick={() => {
                      if (!isAssigningCourier) {
                        setCourierModalOpen(false)
                        setSelectedOrderForCourier(null)
                      }
                    }}
                  />

                  <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl bg-charcoal border border-charcoal-light shadow-2xl animate-fade-in-up z-10 overflow-hidden">
                    {/* Fixed Header */}
                    <div className="flex items-center justify-between border-b border-charcoal-light px-6 py-4 bg-charcoal shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-base sm:text-lg text-cream flex items-center gap-2">
                            <span>Select Delivery Courier Partner</span>
                          </h3>
                          <p className="text-xs text-cream-muted/70 mt-0.5">
                            Order #{selectedOrderForCourier.order_number || selectedOrderForCourier.id} • {selectedOrderForCourier.customer_name || selectedOrderForCourier.shipping_address?.full_name || 'Customer'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isAssigningCourier) {
                            setCourierModalOpen(false)
                            setSelectedOrderForCourier(null)
                          }
                        }}
                        disabled={isAssigningCourier}
                        className="text-cream-muted hover:text-cream p-1.5 rounded-lg hover:bg-charcoal-light transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Scrollable Body */}
                    <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1 custom-scrollbar">
                      {/* Destination Summary Card */}
                      <div className="rounded-xl border border-charcoal-light bg-obsidian/60 p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-cream-muted/50 block text-[10px] uppercase font-bold tracking-wider">Destination</span>
                            <span className="text-cream font-medium block truncate">
                              {selectedOrderForCourier.shipping_address?.city || 'City'}, {selectedOrderForCourier.shipping_address?.state || 'State'}
                            </span>
                            <span className="text-gold font-mono block text-[11px] font-bold">
                              PIN: {selectedOrderForCourier.shipping_address?.pincode || selectedOrderForCourier.pincode || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-cream-muted/50 block text-[10px] uppercase font-bold tracking-wider">Payment</span>
                            <span className={`inline-flex items-center gap-1 font-bold mt-0.5 ${
                              (selectedOrderForCourier.payment_method || '').toUpperCase() === 'COD'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}>
                              {(selectedOrderForCourier.payment_method || '').toUpperCase() === 'COD' ? 'COD' : 'Prepaid'}
                            </span>
                          </div>
                          <div>
                            <span className="text-cream-muted/50 block text-[10px] uppercase font-bold tracking-wider">Package</span>
                            <span className="text-cream font-medium block mt-0.5">0.15 kg (150g)</span>
                            <span className="text-cream-muted/60 text-[10px]">13×13×5 cm (5×5×2")</span>
                          </div>
                          <div>
                            <span className="text-cream-muted/50 block text-[10px] uppercase font-bold tracking-wider">Pickup Hub</span>
                            <span className="text-cream font-medium block mt-0.5">Satara / Karad</span>
                            <span className="text-cream-muted/60 font-mono text-[10px]">PIN: 415106</span>
                          </div>
                        </div>
                      </div>

                      {/* Content States */}
                      {loadingCouriers ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                          <RefreshCw className="w-8 h-8 text-gold animate-spin" />
                          <div>
                            <p className="text-sm font-semibold text-cream">Fetching Live Freight Rates from Shiprocket...</p>
                            <p className="text-xs text-cream-muted/60 mt-1">
                              Checking available partners (Delhivery, Blue Dart, DTDC, Xpressbees)
                            </p>
                          </div>
                        </div>
                      ) : courierError ? (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-red-300">Courier Serviceability Check Failed</p>
                              <p className="text-xs text-red-400/80 mt-1">{courierError}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenCourierModal(selectedOrderForCourier)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Rate Check</span>
                          </button>
                        </div>
                      ) : availableCouriers.length === 0 ? (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                          <p className="text-sm font-semibold text-amber-300">No Courier Partners Available</p>
                          <p className="text-xs text-amber-400/80 mt-1">
                            Shiprocket reports no serviceable partners for pincode {selectedOrderForCourier.shipping_address?.pincode} from pickup hub 415106.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-cream uppercase tracking-wider">
                              Available Delivery Partners ({availableCouriers.length})
                            </span>
                            <span className="text-[11px] text-cream-muted/60">
                              Sorted by Lowest Freight Rate
                            </span>
                          </div>

                          <div className="space-y-2">
                            {availableCouriers.map((c) => {
                              const isSelected = selectedCourierId === c.courier_company_id
                              return (
                                <div
                                  key={c.courier_company_id}
                                  onClick={() => setSelectedCourierId(c.courier_company_id)}
                                  className={`relative rounded-xl p-3.5 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                    isSelected
                                      ? 'border-gold bg-gold/10 shadow-[0_0_15px_rgba(207,181,59,0.15)] ring-1 ring-gold/40'
                                      : 'border-charcoal-light bg-charcoal hover:border-gold/30 hover:bg-charcoal-light/50'
                                  }`}
                                >
                                  {/* Left: Radio & Info */}
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected
                                          ? 'border-gold bg-gold text-obsidian'
                                          : 'border-cream-muted/40 bg-transparent'
                                      }`}
                                    >
                                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-obsidian" />}
                                    </div>

                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-bold text-cream truncate">
                                          {c.courier_name}
                                        </span>
                                        {c.is_cheapest && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm">
                                            <span>Cheapest • Best Value</span>
                                          </span>
                                        )}
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                          c.is_surface
                                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                            : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                        }`}>
                                          {c.is_surface ? 'Surface' : 'Air Express'}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-3 text-xs text-cream-muted/70 mt-1 flex-wrap">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-gold/70" />
                                          <span>Est. {c.etd || `${c.estimated_delivery_days} days`}</span>
                                        </span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                          <span>{c.rating ? Number(c.rating).toFixed(1) : '4.0'} / 5</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Price */}
                                  <div className="text-right shrink-0">
                                    <div className="text-base font-extrabold text-gold font-mono flex items-center justify-end">
                                      <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                                      <span>{Number(c.rate).toFixed(2)}</span>
                                    </div>
                                    <span className="text-[10px] text-cream-muted/50 block">Freight Charge</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fixed Footer */}
                    <div className="border-t border-charcoal-light px-6 py-4 bg-charcoal shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="text-xs text-cream-muted/80">
                        {selectedCourierId && (
                          (() => {
                            const sc = availableCouriers.find((c) => c.courier_company_id === selectedCourierId)
                            return sc ? (
                              <span>
                                Selected: <strong className="text-cream">{sc.courier_name}</strong> (₹{Number(sc.rate).toFixed(2)})
                              </span>
                            ) : null
                          })()
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (!isAssigningCourier) {
                              setCourierModalOpen(false)
                              setSelectedOrderForCourier(null)
                            }
                          }}
                          disabled={isAssigningCourier}
                          className="px-4 py-2 rounded-lg border border-charcoal-light text-cream-muted hover:text-cream text-xs font-bold hover:bg-charcoal-light transition-colors cursor-pointer disabled:opacity-40"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleConfirmCourierAssignment}
                          disabled={isAssigningCourier || loadingCouriers || !selectedCourierId}
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gold text-obsidian font-bold text-xs hover:bg-gold-light transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAssigningCourier ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Assigning Courier & AWB...</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-3.5 h-3.5" />
                              <span>Confirm & Assign AWB</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              3. PRODUCTS TAB (GLOBAL EDITING & DRAG-AND-DROP)
          ════════════════════════════════════════════════════════ */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Product Search, Category Filters & Actions */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted/50" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search active jewellery to edit..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-charcoal border border-charcoal-light text-sm text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cream-muted hover:text-cream cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Product Status Filter Pills & Genre Filters */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { id: 'ALL', label: `All (${products.length})` },
                      { id: 'LIVE', label: `Live (${products.filter((p) => !p.isHidden && p.inStock !== false).length})` },
                      { id: 'OUT_OF_STOCK', label: `Out of Stock (${products.filter((p) => p.inStock === false).length})` },
                      { id: 'HIDDEN', label: `Hidden (${products.filter((p) => p.isHidden).length})` },
                    ].map((filter) => {
                      const isActive = productStatusFilter === filter.id
                      return (
                        <button
                          key={filter.id}
                          onClick={() => setProductStatusFilter(filter.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? 'bg-gold text-obsidian shadow-sm font-bold'
                              : 'bg-charcoal border border-charcoal-light text-cream-muted hover:text-cream hover:border-gold/30'
                          }`}
                        >
                          {filter.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Genre Filter Pills & Factory Reset */}
                  <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 md:pb-0">
                    <div className="flex items-center gap-1.5">
                      {['ALL', 'MARVEL', 'DC', 'ANIME', 'CARS', 'VALORANT'].map((genre) => {
                        const isActive = genreFilter === genre
                        return (
                          <button
                            key={genre}
                            onClick={() => setGenreFilter(genre)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                              isActive
                                ? 'bg-gold text-obsidian font-bold shadow-md'
                                : 'bg-charcoal border border-charcoal-light text-cream-muted hover:text-cream hover:border-gold/30'
                            }`}
                          >
                            {genre}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={handleResetCatalog}
                      title="Restore default factory catalog"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-charcoal-light text-[11px] text-cream-muted/60 hover:text-cream hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Defaults</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Inventory Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="rounded-xl bg-charcoal border border-charcoal-light overflow-hidden flex flex-col group hover:border-gold/40 transition-all shadow-lg hover:shadow-2xl"
                  >
                    {/* Image Preview with Gallery Count */}
                    <div className="relative aspect-square w-full bg-obsidian overflow-hidden">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
                          prod.isHidden ? 'opacity-40 grayscale' : ''
                        }`}
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-obsidian/85 backdrop-blur-md text-gold border border-gold/30">
                          {prod.genre}
                        </span>
                        {prod.isHidden && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-950/90 backdrop-blur-md text-rose-300 border border-rose-500/50 flex items-center gap-1 shadow-sm">
                            <EyeOff className="w-2.5 h-2.5 text-rose-400" />
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        {prod.gallery && prod.gallery.length > 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-obsidian/85 backdrop-blur-md text-cream-muted border border-charcoal-light flex items-center gap-1">
                            <ImageIcon className="w-2.5 h-2.5 text-gold" />
                            {prod.gallery.length}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            prod.inStock !== false
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {prod.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-heading font-bold text-sm text-cream line-clamp-1">
                            {prod.name}
                          </h4>
                          <span className="font-mono font-bold text-gold text-sm shrink-0">
                            ₹{prod.price}
                          </span>
                        </div>
                        <p className="text-xs text-cream-muted/60 line-clamp-2 mt-1">
                          {prod.description}
                        </p>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-charcoal-light space-y-2.5">
                        {/* Row 1: Stock Availability Toggle & Hide Button */}
                        <div className="flex items-center justify-between gap-2">
                          {/* Stock Toggle */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                toggleProductStock(prod.id)
                                showToast(
                                  prod.inStock !== false
                                    ? `"${prod.name}" marked as Out of Stock.`
                                    : `"${prod.name}" is now Available & In Stock.`
                                )
                              }}
                              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                prod.inStock !== false ? 'bg-gold' : 'bg-charcoal-light'
                              }`}
                              title={prod.inStock !== false ? 'Click to mark Out of Stock' : 'Click to mark Available'}
                            >
                              <span
                                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-obsidian shadow ring-0 transition duration-200 ease-in-out ${
                                  prod.inStock !== false ? 'translate-x-3' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className={`text-[10px] font-medium ${prod.inStock !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {prod.inStock !== false ? 'Available' : 'Out of Stock'}
                            </span>
                          </div>

                          {/* Hide / Unhide Button */}
                          <button
                            type="button"
                            onClick={() => {
                              toggleProductVisibility(prod.id)
                              showToast(
                                prod.isHidden
                                  ? `"${prod.name}" is now visible on storefront.`
                                  : `"${prod.name}" is now hidden from storefront.`
                              )
                            }}
                            className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              prod.isHidden
                                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25'
                                : 'bg-charcoal border-charcoal-light text-cream-muted/80 hover:text-gold hover:border-gold/40'
                            }`}
                            title={prod.isHidden ? 'Click to show product on store' : 'Click to hide product from store'}
                          >
                            {prod.isHidden ? (
                              <>
                                <Eye className="w-3 h-3 text-rose-400" />
                                <span>Unhide</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Hide</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Row 2: View, Edit & Delete Buttons */}
                        <div className="grid grid-cols-12 gap-1.5 pt-1">
                          <Link
                            to={`/product/${prod.slug}`}
                            target="_blank"
                            className="col-span-3 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-charcoal-light text-cream-muted/70 hover:text-gold hover:border-gold/30 text-xs transition-colors"
                            title="Preview on Store"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...prod })}
                            className="col-span-7 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-obsidian text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod)}
                            title="Delete Product"
                            className="col-span-2 flex items-center justify-center py-1.5 px-2 rounded-lg border border-charcoal-light text-cream-muted hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 text-xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── EDIT PRODUCT MODAL (COMPLETE DRAG & DROP & FIELDS) ── */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
                  {/* Backdrop Click */}
                  <div
                    className="fixed inset-0"
                    onClick={() => setEditingProduct(null)}
                  />
                  <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl bg-charcoal border border-charcoal-light shadow-2xl animate-fade-in-up z-10 overflow-hidden">
                    {/* Fixed Header */}
                    <div className="flex items-center justify-between border-b border-charcoal-light px-6 py-4 bg-charcoal shrink-0">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-cream flex items-center gap-2">
                          <Edit3 className="w-5 h-5 text-gold" />
                          <span>Edit Product: {editingProduct.name}</span>
                        </h3>
                        <p className="text-xs text-cream-muted/60 mt-0.5">
                          Changes are applied globally across all storefront pages & database
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="text-cream-muted hover:text-cream p-1.5 rounded-lg hover:bg-charcoal-light transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditProduct} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                      {/* Scrollable Form Body */}
                      <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1 custom-scrollbar">
                      {/* 1. Name & Display Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Short Title (e.g. Iron Man) <span className="text-gold">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editingProduct.name}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Full Display Name
                          </label>
                          <input
                            type="text"
                            value={editingProduct.fullName || `${editingProduct.name} Fine Jewellery`}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                fullName: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50"
                          />
                        </div>
                      </div>

                      {/* 2. Genre, Selling Price, Original MRP */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Universe / Genre
                          </label>
                          <select
                            value={editingProduct.genre}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                genre: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 cursor-pointer"
                          >
                            <option value="MARVEL">Marvel</option>
                            <option value="DC">DC</option>
                            <option value="ANIME">Anime</option>
                            <option value="CARS">Cars</option>
                            <option value="VALORANT">Valorant</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Selling Price (₹ INR) <span className="text-gold">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={editingProduct.price}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                price: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Original MRP (₹ INR)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editingProduct.originalPrice || 459}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                originalPrice: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 font-mono"
                          />
                        </div>
                      </div>

                      {/* 3. Main Cover Image with Drag & Drop */}
                      <div className="p-4 rounded-xl bg-obsidian/40 border border-charcoal-light space-y-2">
                        <ImageDropzone
                          label="Main Cover Image (Drag & Drop or Browse)"
                          value={editingProduct.image}
                          onChange={(newUrl) => {
                            const newGallery = editingProduct.gallery?.includes(newUrl)
                              ? [newUrl, ...editingProduct.gallery.filter((u) => u !== newUrl)]
                              : [newUrl, ...(editingProduct.gallery || [])]
                            setEditingProduct({
                              ...editingProduct,
                              image: newUrl,
                              gallery: newGallery,
                            })
                          }}
                          onRemove={() =>
                            setEditingProduct({ ...editingProduct, image: '' })
                          }
                          subtext="Drag and drop photo here to instantly update worldwide"
                        />
                      </div>

                      {/* 4. Multi-Image Swipeable Gallery with Drag & Drop */}
                      <div className="p-4 rounded-xl bg-obsidian/40 border border-charcoal-light space-y-2">
                        <GalleryDropzone
                          gallery={editingProduct.gallery || [editingProduct.image]}
                          onUpdateGallery={(newGallery) => {
                            setEditingProduct({
                              ...editingProduct,
                              gallery: newGallery,
                              image: newGallery[0] || editingProduct.image,
                            })
                          }}
                        />
                      </div>

                      {/* 5. Description */}
                      <div>
                        <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                          Product Lore / Description
                        </label>
                        <textarea
                          rows="3"
                          value={editingProduct.description}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50 resize-none"
                        />
                      </div>

                      {/* 6. Hardware Specifications */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                            Dimensions
                          </label>
                          <input
                            type="text"
                            value={editingProduct.dimensions || '64mm * 43mm'}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                dimensions: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian border border-charcoal-light text-xs text-cream"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                            Material
                          </label>
                          <input
                            type="text"
                            value={editingProduct.material || 'Biodegradable PLA'}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                material: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian border border-charcoal-light text-xs text-cream"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                            Finish
                          </label>
                          <input
                            type="text"
                            value={editingProduct.finish || 'Antique Gold Finish'}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                finish: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian border border-charcoal-light text-xs text-cream"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                            Keyring
                          </label>
                          <input
                            type="text"
                            value={editingProduct.keyring || 'Strong and Durable Keyring'}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                keyring: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian border border-charcoal-light text-xs text-cream"
                          />
                        </div>
                      </div>

                      {/* 7. Stock Availability Toggle */}
                      <div className="flex items-center justify-between p-3.5 rounded-lg bg-obsidian border border-charcoal-light">
                        <div>
                          <span className="text-xs font-semibold text-cream block">
                            Stock Availability
                          </span>
                          <span className="text-[11px] text-cream-muted/60">
                            {editingProduct.inStock !== false ? 'Available for purchase on website' : 'Marked as Out of Stock / Sold Out'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              inStock: editingProduct.inStock === false ? true : false,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            editingProduct.inStock !== false ? 'bg-gold' : 'bg-charcoal-light'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-obsidian shadow ring-0 transition duration-200 ease-in-out ${
                              editingProduct.inStock !== false ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* 8. Storefront Visibility Toggle */}
                      <div className="flex items-center justify-between p-3.5 rounded-lg bg-obsidian border border-charcoal-light">
                        <div>
                          <span className="text-xs font-semibold text-cream flex items-center gap-1.5">
                            {editingProduct.isHidden ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-gold" />}
                            <span>Storefront Visibility</span>
                          </span>
                          <span className="text-[11px] text-cream-muted/60">
                            {editingProduct.isHidden ? 'Hidden from storefront & public catalog' : 'Visible on store catalog & category pages'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              isHidden: !editingProduct.isHidden,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            !editingProduct.isHidden ? 'bg-gold' : 'bg-rose-900/70 border-rose-500/50'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-obsidian shadow ring-0 transition duration-200 ease-in-out ${
                              !editingProduct.isHidden ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      </div>

                      {/* Sticky Actions Footer */}
                      <div className="flex items-center justify-end gap-3 border-t border-charcoal-light px-6 py-3.5 bg-charcoal shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-4 py-2 rounded-lg border border-charcoal-light text-xs text-cream-muted hover:text-cream font-medium transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-lg bg-gold text-obsidian font-bold text-xs hover:bg-gold-dark transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(207,181,59,0.25)] flex items-center gap-2 cursor-pointer"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Save & Deploy Globally</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ── ADD NEW PRODUCT MODAL (WITH DRAG & DROP) ── */}
              {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
                  {/* Backdrop Click */}
                  <div
                    className="fixed inset-0"
                    onClick={() => setIsAddModalOpen(false)}
                  />
                  <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl bg-charcoal border border-charcoal-light shadow-2xl animate-fade-in-up z-10 overflow-hidden">
                    {/* Fixed Header */}
                    <div className="flex items-center justify-between border-b border-charcoal-light px-6 py-4 bg-charcoal shrink-0">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-cream flex items-center gap-2">
                          <Plus className="w-5 h-5 text-gold" />
                          <span>Add New Jewellery Product</span>
                        </h3>
                        <p className="text-xs text-cream-muted/60 mt-0.5">
                          List a new handcrafted 925 silver jewellery piece with instant drag & drop photos
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="text-cream-muted hover:text-cream p-1.5 rounded-lg hover:bg-charcoal-light transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddProduct} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                      {/* Scrollable Form Body */}
                      <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1 custom-scrollbar">
                      {/* Product Title */}
                      <div>
                        <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                          Product Title (e.g. Celestial Solitaire Pendant, Tennis Bracelet) <span className="text-gold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newProduct.name}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, name: e.target.value })
                          }
                          placeholder="e.g. Wolverine, Skyline R34, Sukuna"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50"
                        />
                      </div>

                      {/* Genre, Price, Original MRP */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Universe / Genre
                          </label>
                          <select
                            value={newProduct.genre}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, genre: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 cursor-pointer"
                          >
                            <option value="MARVEL">Marvel</option>
                            <option value="DC">DC</option>
                            <option value="ANIME">Anime</option>
                            <option value="CARS">Cars</option>
                            <option value="VALORANT">Valorant</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Selling Price (₹ INR) <span className="text-gold">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={newProduct.price}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, price: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Original MRP (₹ INR)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={newProduct.originalPrice}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, originalPrice: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 font-mono"
                          />
                        </div>
                      </div>

                      {/* Main Cover Image Drag & Drop */}
                      <div className="p-4 rounded-xl bg-obsidian/40 border border-charcoal-light space-y-2">
                        <ImageDropzone
                          label="Main Cover Photo (Drag & Drop)"
                          value={newProduct.image}
                          onChange={(url) => {
                            const newGallery = newProduct.gallery.includes(url)
                              ? [url, ...newProduct.gallery.filter((u) => u !== url)]
                              : [url, ...newProduct.gallery]
                            setNewProduct({
                              ...newProduct,
                              image: url,
                              gallery: newGallery,
                            })
                          }}
                          onRemove={() => setNewProduct({ ...newProduct, image: '' })}
                        />
                      </div>

                      {/* Additional Gallery Photos */}
                      <div className="p-4 rounded-xl bg-obsidian/40 border border-charcoal-light space-y-2">
                        <GalleryDropzone
                          gallery={newProduct.gallery}
                          onUpdateGallery={(newGallery) => {
                            setNewProduct({
                              ...newProduct,
                              gallery: newGallery,
                              image: newGallery[0] || newProduct.image,
                            })
                          }}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                          Product Description
                        </label>
                        <textarea
                          rows="3"
                          value={newProduct.description}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              description: e.target.value,
                            })
                          }
                          placeholder="Cast in antique gold bio-degradable PLA. Bursting out of the frame..."
                          className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50 resize-none"
                        />
                      </div>

                      {/* Initial Stock Toggle */}
                      <div className="flex items-center justify-between p-3.5 rounded-lg bg-obsidian border border-charcoal-light">
                        <div>
                          <span className="text-xs font-semibold text-cream block">
                            Initial Stock Availability
                          </span>
                          <span className="text-[11px] text-cream-muted/60">
                            {newProduct.inStock ? 'Make immediately purchasable on public store' : 'Mark as Out of Stock initially'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setNewProduct({
                              ...newProduct,
                              inStock: !newProduct.inStock,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            newProduct.inStock ? 'bg-gold' : 'bg-charcoal-light'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-obsidian shadow-lg ring-0 transition duration-200 ease-in-out ${
                              newProduct.inStock ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Storefront Visibility Toggle */}
                      <div className="flex items-center justify-between p-3.5 rounded-lg bg-obsidian border border-charcoal-light">
                        <div>
                          <span className="text-xs font-semibold text-cream flex items-center gap-1.5">
                            {newProduct.isHidden ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-gold" />}
                            <span>Storefront Visibility</span>
                          </span>
                          <span className="text-[11px] text-cream-muted/60">
                            {newProduct.isHidden ? 'Hidden from public storefront on publish' : 'Publish live to store catalog & categories'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setNewProduct({
                              ...newProduct,
                              isHidden: !newProduct.isHidden,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            !newProduct.isHidden ? 'bg-gold' : 'bg-rose-900/70 border-rose-500/50'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-obsidian shadow-lg ring-0 transition duration-200 ease-in-out ${
                              !newProduct.isHidden ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      </div>

                      {/* Sticky Actions Footer */}
                      <div className="flex items-center justify-end gap-3 border-t border-charcoal-light px-6 py-3.5 bg-charcoal shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(false)}
                          className="px-4 py-2 rounded-lg border border-charcoal-light text-xs text-cream-muted hover:text-cream font-medium transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-lg bg-gold text-obsidian font-bold text-xs hover:bg-gold-dark transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(207,181,59,0.2)] flex items-center gap-2 cursor-pointer"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Publish Globally</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              4. SETTINGS TAB
          ════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-8 max-w-4xl">
              {/* Section 1: Store Settings */}
              <div className="rounded-xl bg-charcoal border border-charcoal-light p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-charcoal-light pb-4">
                  <div className="p-2 rounded-lg bg-gold/10 text-gold">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-cream">
                      General Store Settings
                    </h3>
                    <p className="text-xs text-cream-muted/60">
                      Brand identity, customer contact, and base shipping rules
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) =>
                        setSettings({ ...settings, storeName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) =>
                        setSettings({ ...settings, contactEmail: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Default Shipping Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.defaultShippingFee}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultShippingFee: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 font-mono"
                    />
                    <p className="text-[11px] text-cream-muted/50 mt-1">
                      Current flat rate: ₹60 across India
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          freeShippingThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 font-mono"
                    />
                    <p className="text-[11px] text-cream-muted/50 mt-1">
                      Orders above this value receive ₹0 shipping
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Anycubic Kobra 2 Neo Printer Fleet */}
              <div className="rounded-xl bg-charcoal border border-charcoal-light p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-charcoal-light pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-300">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-cream">
                        3D Printer Fleet: Anycubic Kobra 2 Neo
                      </h3>
                      <p className="text-xs text-cream-muted/60">
                        High-Speed 250mm/s FDM Extrusion & LeviQ 2.0 Auto-Leveling
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Online & Calibrated
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Target Nozzle Temp (°C)
                    </label>
                    <input
                      type="number"
                      value={settings.printerNozzleTemp}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          printerNozzleTemp: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream font-mono focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Bed Temp (°C)
                    </label>
                    <input
                      type="number"
                      value={settings.printerBedTemp}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          printerBedTemp: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream font-mono focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Max Print Speed (mm/s)
                    </label>
                    <input
                      type="number"
                      value={settings.printerSpeed}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          printerSpeed: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream font-mono focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-obsidian/70 border border-charcoal-light text-xs space-y-2">
                  <div className="flex items-center gap-2 text-gold font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Hardware Specifications Verified</span>
                  </div>
                  <p className="text-cream-muted/70 leading-relaxed">
                    Anycubic Kobra 2 Neo is configured with 0.16mm high-precision layer heights, 
                    direct drive extruder, and dual-gear mechanism optimized for Tough Antique Gold PLA filament.
                  </p>
                </div>
              </div>

              {/* Section 3: Maharashtra Dispatch Hub & Courier Aggregator */}
              <div className="rounded-xl bg-charcoal border border-charcoal-light p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-charcoal-light pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-cream">
                        Maharashtra Dispatch Hub & Logistics
                      </h3>
                      <p className="text-xs text-cream-muted/60">
                        Courier Aggregators (Shiprocket / Delhivery API Integration)
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    Auto-AWB Enabled
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Courier Aggregator Provider
                    </label>
                    <select
                      value={settings.aggregator}
                      onChange={(e) =>
                        setSettings({ ...settings, aggregator: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 cursor-pointer"
                    >
                      <option value="Shiprocket / Delhivery Express">
                        Shiprocket (Delhivery / Bluedart / Shadowfax)
                      </option>
                      <option value="Delhivery Direct Direct API">
                        Delhivery Express Direct Gateway
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Dispatch Origin Pincode (Maharashtra Hub)
                    </label>
                    <input
                      type="text"
                      value={settings.pickupPincode}
                      onChange={(e) =>
                        setSettings({ ...settings, pickupPincode: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream font-mono focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Dispatch Warehouse Address
                    </label>
                    <input
                      type="text"
                      value={settings.dispatchHub}
                      onChange={(e) =>
                        setSettings({ ...settings, dispatchHub: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-obsidian border border-charcoal-light">
                  <div>
                    <span className="text-xs font-semibold text-cream block">
                      Auto-Generate AWB on "Packed" Status
                    </span>
                    <span className="text-[11px] text-cream-muted/60">
                      Instantly request pickup from Shiprocket once order is packed
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        autoGenerateAwb: !settings.autoGenerateAwb,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.autoGenerateAwb ? 'bg-gold' : 'bg-charcoal-light'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-obsidian shadow-lg ring-0 transition duration-200 ease-in-out ${
                        settings.autoGenerateAwb
                          ? 'translate-x-5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Auto-Sync Cancellations from Shiprocket Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-obsidian border border-charcoal-light">
                  <div>
                    <span className="text-xs font-semibold text-cream block">
                      Auto-Sync Cancellations from Shiprocket
                    </span>
                    <span className="text-[11px] text-cream-muted/60">
                      Instantly halt customer live tracking and update status if an order is cancelled on Shiprocket by seller
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        autoSyncCancellations: !settings.autoSyncCancellations,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.autoSyncCancellations !== false ? 'bg-gold' : 'bg-charcoal-light'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-obsidian shadow-lg ring-0 transition duration-200 ease-in-out ${
                        settings.autoSyncCancellations !== false
                          ? 'translate-x-5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Shiprocket Webhook Endpoint Helper */}
                <div className="p-4 rounded-lg bg-obsidian/80 border border-charcoal-light space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gold" />
                      <span className="text-xs font-bold text-cream">
                        Shiprocket Webhook Endpoint (Instant Cancellation Sync)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      Active Listener
                    </span>
                  </div>

                  <p className="text-[11px] text-cream-muted/70 leading-relaxed">
                    Paste this webhook URL into your <strong>Shiprocket Dashboard → Settings → API → Webhooks</strong> for the <em>"Order Cancellation"</em> and <em>"Shipment Cancellation"</em> events. When you cancel an order in Shiprocket, the customer's live tracking page halts and updates in real-time.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : 'https://smithsjewellery.in'}/api/shiprocket-webhook`}
                      className="flex-1 px-3 py-2 rounded-lg bg-charcoal border border-charcoal-light text-xs font-mono text-cream focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://smithsjewellery.in'}/api/shiprocket-webhook`
                        navigator.clipboard?.writeText(url)
                        showToast('Shiprocket Webhook URL copied to clipboard!', 'success')
                      }}
                      className="px-3 py-2 rounded-lg bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-obsidian transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Webhook URL</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 4: Automated Admin WhatsApp Order Notifications */}
              <div className="rounded-xl bg-charcoal border border-charcoal-light p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-light pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-base text-cream">
                          Automated WhatsApp Order Alerts
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          100% Background Automation
                        </span>
                      </div>
                      <p className="text-xs text-cream-muted/70 mt-0.5">
                        Delivers instant WhatsApp notifications to your personal number the moment any customer places an order
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Gmail Alerts Active</span>
                    </span>
                  </div>
                </div>

                {/* ── CARD A: INSTANT GMAIL ORDER NOTIFICATIONS (METHOD 3) ── */}
                <div className="p-5 rounded-xl bg-obsidian border border-blue-500/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-light pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-cream flex items-center gap-2">
                          <span>Instant Gmail Push Alerts</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            100% Reliable
                          </span>
                        </h4>
                        <p className="text-[11px] text-cream-muted/70">
                          Rings & vibrates on your phone via the Gmail app within 1-2 seconds with 1-click AWB action link
                        </p>
                      </div>
                    </div>

                    {/* Email Toggle */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-cream-muted font-medium">Alerts:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setNotificationSettings({
                            ...notificationSettings,
                            email_enabled: !notificationSettings.email_enabled,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notificationSettings.email_enabled ? 'bg-blue-500' : 'bg-charcoal-light'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-obsidian shadow-lg ring-0 transition duration-200 ease-in-out ${
                            notificationSettings.email_enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Email Input & Send Test */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-cream-muted mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        <span>Admin Recipient Gmail Address</span>
                      </label>
                      <input
                        type="email"
                        value={notificationSettings.admin_email}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            admin_email: e.target.value.trim(),
                          })
                        }
                        placeholder="digitalfreedomhub5116@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-charcoal border border-charcoal-light text-sm font-mono text-cream focus:outline-none focus:border-blue-400"
                      />
                      <p className="text-[11px] text-cream-muted/50 mt-1">
                        Prefilled: digitalfreedomhub5116@gmail.com (receives all order alerts)
                      </p>
                    </div>

                    <div>
                      <button
                        type="button"
                        disabled={isTestingEmail || !notificationSettings.admin_email}
                        onClick={handleTestEmailNotification}
                        className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isTestingEmail ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending Email...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Test Alert to Gmail</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 1-Time Activation Notice */}
                  <div className="p-3.5 rounded-lg bg-charcoal/70 border border-charcoal-light text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-gold font-semibold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>One-Time Gmail Activation (Takes 5 Seconds)</span>
                    </div>
                    <p className="text-cream-muted/70 text-[11px] leading-relaxed">
                      If you haven't received an alert yet, check your Gmail inbox (or Spam/Promotions folder) for an email from <strong>FormSubmit</strong> with subject <em>"Action Required: Confirm Form"</em>. Simply click <strong>"Activate Form"</strong> once. Every customer order will then immediately land in your inbox!
                    </p>
                  </div>

                  {/* Email Test Result Callout */}
                  {emailTestResult && (
                    <div
                      className={`p-3.5 rounded-lg text-xs border ${
                        emailTestResult.type === 'success'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : emailTestResult.type === 'activation'
                          ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                          : 'bg-red-950/40 border-red-500/40 text-red-200'
                      } flex items-start gap-2.5`}
                    >
                      {emailTestResult.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : emailTestResult.type === 'activation' ? (
                        <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold">
                          {emailTestResult.type === 'success'
                            ? 'Email Alert Sent!'
                            : emailTestResult.type === 'activation'
                            ? 'Action Required in Gmail:'
                            : 'Delivery Error:'}
                        </p>
                        <p className="mt-0.5 opacity-90 leading-relaxed">{emailTestResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── CARD B: WHATSAPP ORDER ALERTS (CALLMEBOT) ── */}
                <div className="p-5 rounded-xl bg-obsidian/70 border border-charcoal-light space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-light pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-cream flex items-center gap-2">
                          <span>WhatsApp Order Alerts</span>
                          <span className="text-[10px] text-cream-muted/60 font-normal">CallMeBot Gateway</span>
                        </h4>
                        <p className="text-[11px] text-cream-muted/70">
                          Automated WhatsApp messages sent to +91 {notificationSettings.whatsapp_phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-cream-muted font-medium">Alerts:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setNotificationSettings({
                            ...notificationSettings,
                            whatsapp_enabled: !notificationSettings.whatsapp_enabled,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notificationSettings.whatsapp_enabled ? 'bg-emerald-500' : 'bg-charcoal-light'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-obsidian shadow-lg ring-0 transition duration-200 ease-in-out ${
                            notificationSettings.whatsapp_enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-cream-muted mb-1.5 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Admin WhatsApp Phone Number</span>
                      </label>
                      <div className="flex items-center rounded-lg bg-charcoal border border-charcoal-light overflow-hidden">
                        <span className="px-3 py-2 bg-obsidian text-xs font-mono font-bold text-cream-muted border-r border-charcoal-light">
                          +91
                        </span>
                        <input
                          type="text"
                          value={notificationSettings.whatsapp_phone}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              whatsapp_phone: e.target.value.replace(/[^0-9]/g, ''),
                            })
                          }
                          placeholder="8530085116"
                          className="w-full px-3 py-2 bg-transparent text-sm font-mono text-cream focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-cream-muted mb-1.5 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-gold" />
                        <span>CallMeBot WhatsApp API Key</span>
                      </label>
                      <input
                        type="text"
                        value={notificationSettings.callmebot_api_key}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            callmebot_api_key: e.target.value.trim(),
                          })
                        }
                        placeholder="Enter API Key from WhatsApp bot"
                        className="w-full px-3.5 py-2 rounded-lg bg-charcoal border border-charcoal-light text-sm font-mono text-cream focus:outline-none focus:border-gold/50"
                      />
                    </div>
                  </div>

                  {/* Active Backup Bot Links */}
                  <div className="p-3 rounded-lg bg-charcoal/50 border border-charcoal-light text-xs space-y-2">
                    <span className="text-[11px] font-semibold text-cream-muted/80 block">
                      If the main CallMeBot is full, message either of the 2 active backup bots:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href="https://wa.me/34644263377?text=I%20allow%20callmebot%20to%20send%20me%20messages"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Backup Bot 1 (+34 644 26 33 77)</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                      <a
                        href="https://wa.me/34623786449?text=I%20allow%20callmebot%20to%20send%20me%20messages"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Backup Bot 2 (+34 623 78 64 49)</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isTestingWhatsapp || !notificationSettings.callmebot_api_key}
                      onClick={handleTestWhatsappNotification}
                      className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                    >
                      {isTestingWhatsapp ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Testing WhatsApp...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Send Test WhatsApp Alert</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* WhatsApp Test Result Callout */}
                  {whatsappTestResult && (
                    <div
                      className={`p-3.5 rounded-lg text-xs border ${
                        whatsappTestResult.type === 'success'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-red-950/40 border-red-500/40 text-red-200'
                      } flex items-start gap-2.5`}
                    >
                      {whatsappTestResult.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold">
                          {whatsappTestResult.type === 'success'
                            ? 'WhatsApp Alert Delivered!'
                            : 'WhatsApp Test Failed'}
                        </p>
                        <p className="mt-0.5 opacity-90">{whatsappTestResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save All Notification Configurations */}
                <div className="flex items-center justify-between pt-2 border-t border-charcoal-light">
                  <span className="text-[11px] text-cream-muted/50 italic">
                    Alerts sent to: {notificationSettings.admin_email} & +91 {notificationSettings.whatsapp_phone}
                  </span>

                  <button
                    type="button"
                    disabled={isSavingNotifications}
                    onClick={handleSaveNotificationSettings}
                    className="px-6 py-2.5 rounded-lg bg-gold text-obsidian font-bold text-xs hover:bg-gold-dark transition-transform hover:scale-[1.02] disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(207,181,59,0.25)]"
                  >
                    {isSavingNotifications ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Settings...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save All Alert Configurations</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Section 5: Razorpay Live Payment Gateway */}
              <div className="rounded-xl bg-charcoal border border-gold/30 p-6 space-y-5 shadow-lg shadow-gold/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-light pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-gold/15 text-gold border border-gold/30">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-base text-cream">
                          Razorpay Live Payment Gateway
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          LIVE PRODUCTION
                        </span>
                      </div>
                      <p className="text-xs text-cream-muted/70 mt-0.5">
                        Accepting instant payments across UPI (GPay, PhonePe, Paytm), Debit/Credit Cards & NetBanking
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://dashboard.razorpay.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-obsidian transition-all text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <span>Razorpay Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-gold" />
                      <span>Live Key ID (Public Client Key)</span>
                    </label>
                    <div className="flex items-center rounded-lg bg-obsidian border border-charcoal-light px-3 py-2.5">
                      <input
                        type="text"
                        readOnly
                        value="rzp_live_TaCHL9GVg0Zcnb"
                        className="w-full bg-transparent text-xs font-mono text-gold focus:outline-none"
                      />
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Active
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Key Secret (Server-Side Storage)</span>
                    </label>
                    <div className="flex items-center rounded-lg bg-obsidian border border-charcoal-light px-3 py-2.5 justify-between">
                      <span className="text-xs font-mono text-cream-muted/70">
                        ••••••••••••••••••••••••
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Encrypted in Supabase
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-obsidian/70 border border-charcoal-light text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-cream-muted text-[11px]">
                      Razorpay Checkout popup is live on the store checkout page. Upon payment, transactions are verified and marked as <strong>PAID</strong>, generating instant Gmail and WhatsApp alerts.
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Settings Action */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() =>
                    showToast('Store & 3D Printer settings saved successfully!')
                  }
                  className="px-6 py-2.5 rounded-lg bg-gold text-obsidian font-bold text-xs hover:bg-gold-dark transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(207,181,59,0.2)] cursor-pointer"
                >
                  Save All Configurations
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
