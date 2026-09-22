import { create } from 'zustand'
import { MOCK_PRODUCTS, GENRES, buildProductReviews } from '../data/productsData'
import { getLocalCart, saveCartToAccount, saveProduct, deleteProductFromDb } from '../lib/db'

const LOCAL_STORAGE_PRODUCTS_KEY = 'smiths_jewellery_products_v2'
const LOCAL_STORAGE_DELETED_PRODUCTS_KEY = 'smiths_deleted_product_ids'

const getDeletedProductIds = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_PRODUCTS_KEY)
    return raw ? JSON.parse(raw).map(Number) : []
  } catch (e) {
    return []
  }
}

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80'

export const resolveProductImage = (item, catalog = []) => {
  if (!item) return DEFAULT_FALLBACK_IMAGE
  const isShirt = (url) => typeof url === 'string' && url.includes('photo-1618354691373-d851c5c3a990')
  const clean = (url) => (url && !isShirt(url) ? url : null)

  const match = catalog?.find(
    (p) =>
      String(p.id) === String(item.id || item.product_id) ||
      (item.name && p.name && p.name.toLowerCase() === item.name.toLowerCase())
  ) || MOCK_PRODUCTS.find(
    (p) =>
      String(p.id) === String(item.id || item.product_id) ||
      (item.name && p.name && p.name.toLowerCase() === item.name.toLowerCase())
  )

  return (
    clean(match?.image) ||
    clean(match?.gallery?.[0]) ||
    clean(Array.isArray(item.gallery) && item.gallery.find((g) => !isShirt(g))) ||
    clean(item.image) ||
    DEFAULT_FALLBACK_IMAGE
  )
}

// Helper to load products from localStorage with fallback to default catalog
const loadInitialProducts = () => {
  const localDeleted = getDeletedProductIds()
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const mapped = parsed
          .filter((p) => !localDeleted.includes(Number(p.id)))
          .map((p) => {
            const pId = Number(p.id) || p.id
            const mock = MOCK_PRODUCTS.find((m) => Number(m.id) === pId || m.slug === p.slug)
            const fallbackReviews = mock?.reviews || buildProductReviews(p)
            const rawGallery = Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : []
            const cleanGallery = rawGallery.filter((g) => g && !g.includes('photo-1618354691373-d851c5c3a990'))
            const defaultFallback = mock?.image || DEFAULT_FALLBACK_IMAGE
            const fallbackGallery = cleanGallery.length > 0
              ? cleanGallery
              : (mock?.gallery || (mock?.image ? [mock.image] : [defaultFallback]))

            const coverImage = (p.image && !p.image.includes('photo-1618354691373-d851c5c3a990'))
              ? p.image
              : fallbackGallery[0] || defaultFallback

            return {
              ...mock,
              ...p,
              id: pId,
              image: coverImage,
              gallery: fallbackGallery,
              reviews: Array.isArray(p.reviews) && p.reviews.length > 0 ? p.reviews : fallbackReviews,
              description: p.description || mock?.description || `Handcrafted 925 sterling silver ${p.name} from Smiths Jewellery.`,
              features: Array.isArray(p.features) && p.features.length > 0 ? p.features : (mock?.features || [
                'Crafted from certified 925 Sterling Silver',
                'Triple Rhodium Plated for enduring tarnish resistance',
                'AAA Grade brilliant cubic zirconia stones',
                '100% Hypoallergenic — Nickel-Free and Lead-Free',
                'Includes Velvet Presentation Box & Authenticity Certificate',
              ]),
              rating: Number(p.rating) || mock?.rating || 4.8,
              reviewCount: Number(p.reviewCount) || mock?.reviewCount || fallbackReviews.length || 12,
              discountBadge: p.discountBadge || mock?.discountBadge || '-50%',
              discountPercent: p.discountPercent || mock?.discountPercent || 50,
              isBestseller: mock?.isBestseller ?? (pId === 1 || pId === 5 || pId === 31),
              inStock: p.inStock !== false,
              isHidden: p.isHidden === true,
            }
          })

        // Merge any mock products missing from local storage only if NOT deleted
        const missingMocks = MOCK_PRODUCTS.filter(
          (m) =>
            !localDeleted.includes(Number(m.id)) &&
            !mapped.some((item) => Number(item.id) === Number(m.id) || item.slug === m.slug)
        ).map((m) => ({
          ...m,
          id: Number(m.id) || m.id,
          inStock: m.inStock !== false,
          isHidden: false,
        }))

        return [...mapped, ...missingMocks].sort((a, b) => Number(a.id) - Number(b.id))
      }
    }
  } catch (e) {
    console.warn('Failed to load stored products', e)
  }
  return MOCK_PRODUCTS
    .filter((p) => !localDeleted.includes(Number(p.id)))
    .map((p) => ({
      ...p,
      id: Number(p.id) || p.id,
      inStock: p.inStock !== false,
      isHidden: false,
    }))
}

const persistProducts = (products) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products))
  } catch (e) {
    console.error('Failed to persist products to localStorage', e)
  }
}

export const useCartStore = create((set, get) => ({
  // ── Global Products State ──
  products: loadInitialProducts(),

  setProducts: (products) => {
    if (!Array.isArray(products) || products.length === 0) return
    const localDeleted = getDeletedProductIds()
    const valid = products.filter((p) => !localDeleted.includes(Number(p.id)))
    const normalized = valid.map((p) => {
      const pId = Number(p.id) || p.id
      const mock = MOCK_PRODUCTS.find((m) => Number(m.id) === pId || m.slug === p.slug)
      const fallbackReviews = mock?.reviews || buildProductReviews(p)
      const rawGallery = Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : []
      const cleanGallery = rawGallery.filter((g) => g && !g.includes('photo-1618354691373-d851c5c3a990'))
      const defaultFallback = mock?.image || DEFAULT_FALLBACK_IMAGE
      const fallbackGallery = cleanGallery.length > 0
        ? cleanGallery
        : (mock?.gallery || (mock?.image ? [mock.image] : [defaultFallback]))

      const coverImage = (p.image && !p.image.includes('photo-1618354691373-d851c5c3a990'))
        ? p.image
        : fallbackGallery[0] || defaultFallback

      return {
        ...mock,
        ...p,
        id: pId,
        image: coverImage,
        gallery: fallbackGallery,
        reviews: Array.isArray(p.reviews) && p.reviews.length > 0 ? p.reviews : fallbackReviews,
        description: p.description || mock?.description || `Handcrafted 925 sterling silver ${p.name} finished with radiant rhodium luster.`,
        features: Array.isArray(p.features) && p.features.length > 0 ? p.features : (mock?.features || [
          'Solid 925 Sterling Silver with anti-tarnish rhodium plating',
          'Hypoallergenic, nickel-free and lead-free for sensitive skin',
          'Signature Smiths midnight velvet keepsake box included',
          'Authenticity certificate with purity guarantee',
          'Handcrafted precision polish and luster',
        ]),
        rating: Number(p.rating) || mock?.rating || 4.8,
        reviewCount: Number(p.reviewCount) || mock?.reviewCount || fallbackReviews.length || 12,
        discountBadge: p.discountBadge || mock?.discountBadge || '-50%',
        discountPercent: p.discountPercent || mock?.discountPercent || 50,
        isBestseller: mock?.isBestseller ?? (pId === 1 || pId === 5 || pId === 31),
        inStock: p.inStock !== false,
        isHidden: p.isHidden === true,
      }
    }).sort((a, b) => Number(a.id) - Number(b.id))

    // Also update current items and wishlist so they immediately adopt authentic images and exclude deleted items
    const currentItems = get().items || []
    const updatedItems = currentItems
      .filter((item) => !localDeleted.includes(Number(item.id)))
      .map((item) => {
        const match = normalized.find((p) => Number(p.id) === Number(item.id)) || MOCK_PRODUCTS.find((p) => Number(p.id) === Number(item.id))
        const cleanImg = resolveProductImage(item, normalized)
        return {
          ...item,
          image: cleanImg,
          gallery: (match?.gallery && match.gallery.length > 0) ? match.gallery : [cleanImg],
          fullName: match?.fullName || item.fullName || `${item.name} - Smiths Jewellery`,
        }
      })

    const currentWishlist = get().wishlist || []
    const updatedWishlist = currentWishlist
      .filter((item) => !localDeleted.includes(Number(item.id)))
      .map((item) => {
        const match = normalized.find((p) => Number(p.id) === Number(item.id)) || MOCK_PRODUCTS.find((p) => Number(p.id) === Number(item.id))
        const cleanImg = resolveProductImage(item, normalized)
        return {
          ...item,
          image: cleanImg,
          gallery: (match?.gallery && match.gallery.length > 0) ? match.gallery : [cleanImg],
          fullName: match?.fullName || item.fullName || `${item.name} - Smiths Jewellery`,
        }
      })

    set({ products: normalized, items: updatedItems, wishlist: updatedWishlist })
    persistProducts(normalized)
    if (updatedItems.length > 0) {
      saveCartToAccount(updatedItems)
    }
  },

  updateProduct: (updatedProduct) => {
    const current = get().products
    let saved = null
    const nextProducts = current.map((p) => {
      if (String(p.id) === String(updatedProduct.id)) {
        const mock = MOCK_PRODUCTS.find((m) => String(m.id) === String(p.id) || m.slug === p.slug)
        const slug =
          updatedProduct.slug ||
          p.slug ||
          `${(updatedProduct.name || p.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}-silver`
        const fullName =
          updatedProduct.fullName ||
          p.fullName ||
          `${updatedProduct.name || p.name} - Smiths Jewellery`

        const fallbackReviews = p.reviews || mock?.reviews || buildProductReviews(p)
        const fallbackGallery = Array.isArray(updatedProduct.gallery) && updatedProduct.gallery.length > 0
          ? updatedProduct.gallery
          : (p.gallery || mock?.gallery || (updatedProduct.image ? [updatedProduct.image] : [p.image]))

        const finalCover = (Array.isArray(updatedProduct.gallery) && updatedProduct.gallery[0]) || updatedProduct.image || fallbackGallery[0] || p.image

        saved = {
          ...mock,
          ...p,
          ...updatedProduct,
          slug,
          fullName,
          image: finalCover,
          gallery: fallbackGallery,
          reviews: Array.isArray(updatedProduct.reviews) && updatedProduct.reviews.length > 0 ? updatedProduct.reviews : fallbackReviews,
          inStock: updatedProduct.inStock !== undefined ? updatedProduct.inStock : p.inStock !== false,
          isHidden: updatedProduct.isHidden !== undefined ? updatedProduct.isHidden : p.isHidden === true,
        }
        return saved
      }
      return p
    })

    set({ products: nextProducts })
    persistProducts(nextProducts)
    if (saved) {
      saveProduct(saved).catch((e) => console.warn('Update product in db failed', e))
    }

    // Also update matching items currently in the cart
    const updatedItems = get().items.map((it) => {
      if (String(it.id) === String(updatedProduct.id)) {
        const cover = (Array.isArray(updatedProduct.gallery) && updatedProduct.gallery[0]) || updatedProduct.image || it.image
        return {
          ...it,
          name: updatedProduct.name || it.name,
          fullName: updatedProduct.fullName || it.fullName,
          price: updatedProduct.price !== undefined ? Number(updatedProduct.price) : it.price,
          image: cover,
        }
      }
      return it
    })
    set({ items: updatedItems })

    // Also update matching items in wishlist
    const updatedWishlist = get().wishlist.map((it) => {
      if (String(it.id) === String(updatedProduct.id)) {
        const cover = (Array.isArray(updatedProduct.gallery) && updatedProduct.gallery[0]) || updatedProduct.image || it.image
        return {
          ...it,
          name: updatedProduct.name || it.name,
          fullName: updatedProduct.fullName || it.fullName,
          price: updatedProduct.price !== undefined ? Number(updatedProduct.price) : it.price,
          image: cover,
        }
      }
      return it
    })
    set({ wishlist: updatedWishlist })
  },

  addProduct: (newProduct) => {
    const existing = get().products
    const maxId = Math.max(0, ...existing.map((p) => Number(p.id) || 0))
    const generatedId = newProduct.id ? Number(newProduct.id) : (maxId > 0 ? maxId + 1 : 26)

    const cleanName = newProduct.name || 'Silver Jewellery Piece'
    const slug =
      newProduct.slug ||
      `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-silver`
    const fullName = newProduct.fullName || `${cleanName} - Smiths Jewellery`
    const defaultCover =
      (newProduct.image && !newProduct.image.includes('photo-1618354691373-d851c5c3a990') ? newProduct.image : null) ||
      (newProduct.gallery && newProduct.gallery.find((g) => !g.includes('photo-1618354691373-d851c5c3a990'))) ||
      DEFAULT_FALLBACK_IMAGE

    const gallery =
      newProduct.gallery && newProduct.gallery.length > 0
        ? newProduct.gallery.filter((g) => !g.includes('photo-1618354691373-d851c5c3a990'))
        : [defaultCover]
    const productCover = gallery[0] || defaultCover

    const productWithDefaults = {
      id: generatedId,
      name: cleanName,
      slug,
      fullName,
      genre: newProduct.genre || 'NECKLACES',
      price: Number(newProduct.price) || 1299,
      originalPrice: Number(newProduct.originalPrice || 2599),
      description: newProduct.description || `Handcrafted 925 sterling silver ${cleanName} from Smiths Jewellery.`,
      image: productCover,
      gallery: gallery,
      reviewCount: 7,
      rating: 4.8,
      inStock: newProduct.inStock !== false,
      isHidden: newProduct.isHidden === true,
      dimensions: newProduct.dimensions || 'Standard Comfort Fit',
      material: newProduct.material || '925 Sterling Silver',
      finish: newProduct.finish || 'High-Luster Rhodium & Polished Silver',
      keyring: 'Hypoallergenic Security Clasp',
      durability: 'Tarnish-Resistant Daily Wear',
      features: [
        'Crafted from certified 925 Sterling Silver',
        'Triple Rhodium Plated for enduring tarnish resistance',
        'AAA Grade brilliant cubic zirconia stones',
        '100% Hypoallergenic — Nickel-Free and Lead-Free',
        'Includes Velvet Presentation Box & Authenticity Certificate',
      ],
      reviews: buildProductReviews({
        id: generatedId,
        name: cleanName,
        genre: newProduct.genre || 'NECKLACES',
        reviewCount: 7,
        badCount: 1,
      }),
    }

    const nextProducts = [productWithDefaults, ...existing]
    set({ products: nextProducts })
    persistProducts(nextProducts)

    // Persist globally to Supabase if available
    saveProduct(productWithDefaults).catch((err) => console.warn('Sync new product to db failed:', err))

    return productWithDefaults
  },

  deleteProduct: (productId) => {
    const pId = Number(productId) || productId
    const localDeleted = getDeletedProductIds()
    if (!localDeleted.includes(Number(pId))) {
      try {
        localStorage.setItem(LOCAL_STORAGE_DELETED_PRODUCTS_KEY, JSON.stringify([...localDeleted, Number(pId)]))
      } catch (e) {}
    }

    const nextProducts = get().products.filter((p) => Number(p.id) !== Number(pId))
    set({
      products: nextProducts,
      items: get().items.filter((it) => Number(it.id) !== Number(pId)),
      wishlist: get().wishlist.filter((it) => Number(it.id) !== Number(pId)),
    })
    persistProducts(nextProducts)

    // Delete from Supabase
    deleteProductFromDb(productId).catch((err) => console.warn('Sync delete to db failed:', err))
  },

  toggleProductStock: (productId) => {
    let updated = null
    const nextProducts = get().products.map((p) => {
      if (String(p.id) === String(productId)) {
        updated = { ...p, inStock: !p.inStock }
        return updated
      }
      return p
    })
    set({ products: nextProducts })
    persistProducts(nextProducts)
    if (updated) {
      saveProduct(updated).catch((e) => console.warn('Sync stock to db failed', e))
    }
  },

  toggleProductVisibility: (productId) => {
    let updated = null
    const nextProducts = get().products.map((p) => {
      if (String(p.id) === String(productId)) {
        updated = { ...p, isHidden: !p.isHidden }
        return updated
      }
      return p
    })
    set({ products: nextProducts })
    persistProducts(nextProducts)
    if (updated) {
      saveProduct(updated).catch((e) => console.warn('Sync visibility to db failed', e))
    }
  },

  resetProductsToDefault: () => {
    const defaults = MOCK_PRODUCTS.map((p) => ({
      ...p,
      inStock: true,
      isHidden: false,
    }))
    set({ products: defaults })
    persistProducts(defaults)
  },

  items: getLocalCart(),
  setItems: (newItems) => {
    if (!Array.isArray(newItems)) return
    const catalog = get().products.length > 0 ? get().products : MOCK_PRODUCTS
    const sanitized = newItems.map((item) => {
      const match = catalog.find((p) => String(p.id) === String(item.id)) || MOCK_PRODUCTS.find((p) => String(p.id) === String(item.id))
      const cleanImg = resolveProductImage(item, catalog)
      return {
        ...item,
        image: cleanImg,
        gallery: (match?.gallery && match.gallery.length > 0) ? match.gallery : (item.gallery || [cleanImg]),
        fullName: item.fullName || match?.fullName || `${item.name} - Smiths Jewellery`,
      }
    })
    set({ items: sanitized })
    saveCartToAccount(sanitized)
  },
  clearCart: () => {
    set({ items: [] })
    saveCartToAccount([])
  },
  isOpen: false,
  activeReviewProduct: null, // Product whose reviews modal is currently open

  // ── Wishlist State ──
  wishlist: [],
  isWishlistOpen: false,
  wishlistPing: false,

  openWishlist: () => set({ isWishlistOpen: true }),
  closeWishlist: () => set({ isWishlistOpen: false }),
  toggleWishlistDrawer: () => set((state) => ({ isWishlistOpen: !state.isWishlistOpen })),

  toggleWishlist: (product) => {
    const exists = get().wishlist.some((item) => item.id === product.id)
    if (exists) {
      set({ wishlist: get().wishlist.filter((item) => item.id !== product.id) })
    } else {
      const catalog = get().products.length > 0 ? get().products : MOCK_PRODUCTS
      const cleanImg = resolveProductImage(product, catalog)
      const match = catalog.find((p) => String(p.id) === String(product.id)) || MOCK_PRODUCTS.find((p) => String(p.id) === String(product.id))
      const cleanGallery = (match?.gallery && match.gallery.length > 0) ? match.gallery : (product.gallery || [cleanImg])
      const cleanProduct = {
        ...product,
        image: cleanImg,
        gallery: cleanGallery,
        fullName: product.fullName || match?.fullName || `${product.name} - Smiths Jewellery`,
      }

      // Add product & trigger glowing highlight animation on navbar heart!
      set({
        wishlist: [...get().wishlist, cleanProduct],
        wishlistPing: true,
      })
      setTimeout(() => {
        set({ wishlistPing: false })
      }, 1400)
    }
  },

  isWishlisted: (productId) => {
    return get().wishlist.some((item) => item.id === productId)
  },

  getWishlistCount: () => {
    return get().wishlist.length
  },

  // ── Reviews Modal State ──
  openReviews: (product) => set({ activeReviewProduct: product }),
  closeReviews: () => set({ activeReviewProduct: null }),

  // ── Cart Drawer State ──
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  addItem: (product) => {
    if (product.inStock === false) return
    const catalog = get().products.length > 0 ? get().products : MOCK_PRODUCTS
    const cleanImg = resolveProductImage(product, catalog)
    const match = catalog.find((p) => String(p.id) === String(product.id)) || MOCK_PRODUCTS.find((p) => String(p.id) === String(product.id))
    const cleanGallery = (match?.gallery && match.gallery.length > 0) ? match.gallery : (product.gallery || [cleanImg])
    const cleanProduct = {
      ...product,
      image: cleanImg,
      gallery: cleanGallery,
      fullName: product.fullName || match?.fullName || `${product.name} - Smiths Jewellery`,
    }

    const existing = get().items.find((item) => item.id === product.id)
    let nextItems
    if (existing) {
      nextItems = get().items.map((item) =>
        item.id === product.id
          ? { ...item, ...cleanProduct, quantity: item.quantity + 1 }
          : item
      )
    } else {
      nextItems = [...get().items, { ...cleanProduct, quantity: 1 }]
    }
    set({ items: nextItems })
    saveCartToAccount(nextItems)
  },

  removeItem: (id) => {
    const nextItems = get().items.filter((item) => item.id !== id)
    set({ items: nextItems })
    saveCartToAccount(nextItems)
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }
    const nextItems = get().items.map((item) =>
      item.id === id ? { ...item, quantity } : item
    )
    set({ items: nextItems })
    saveCartToAccount(nextItems)
  },

  getTotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))

export { MOCK_PRODUCTS, GENRES }
