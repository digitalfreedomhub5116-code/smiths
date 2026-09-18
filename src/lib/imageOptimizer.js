/**
 * Image Optimizer Utility for Smiths Jewellery
 * 
 * Routes Supabase Storage image URLs through Supabase's image transformation CDN endpoint:
 *   /storage/v1/object/public/...  -->  /storage/v1/render/image/public/...?width=...&quality=...
 * 
 * Benefits:
 * 1. Reduces payload size by 65-85% (e.g. 266KB -> 25-60KB).
 * 2. Enables Cloudflare Edge Caching (Cache-Control: public, max-age=3600, cf-cache-status: HIT).
 * 3. Prevents re-downloading on every page visit or navigation.
 */

export const IMAGE_SIZES = {
  THUMBNAIL: { width: 160, quality: 75, resize: 'contain' },
  CARD: { width: 450, quality: 80, resize: 'contain' },
  HERO: { width: 800, quality: 85, resize: 'contain' },
  FULL: { width: 1200, quality: 85, resize: 'contain' },
}

/**
 * Returns an optimized CDN URL with specified width and compression quality.
 * Guarantees aspect ratio preservation by using resize=contain on Supabase transformations.
 * 
 * @param {string} url - Original image URL
 * @param {Object} [options] - Options object
 * @param {number} [options.width] - Desired width in pixels
 * @param {number} [options.height] - Desired height in pixels
 * @param {number} [options.quality=80] - Image quality (1-100)
 * @param {string} [options.resize='contain'] - Supabase resize mode ('contain', 'cover', 'fill')
 * @returns {string} Optimized URL or original if transformation is not applicable
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url

  const { width, height, quality = 80, resize = 'contain' } = options

  // Handle Supabase Storage Public URLs
  if (url.includes('/storage/v1/object/public/')) {
    const baseUrl = url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    )
    const params = new URLSearchParams()
    if (width) params.set('width', String(Math.round(width)))
    if (height) params.set('height', String(Math.round(height)))
    if (quality) params.set('quality', String(quality))
    if (resize) params.set('resize', resize)
    const qs = params.toString()
    return qs ? `${baseUrl}?${qs}` : baseUrl
  }

  // Already transformed Supabase URL (just update params if needed)
  if (url.includes('/storage/v1/render/image/public/')) {
    try {
      const u = new URL(url)
      if (width) u.searchParams.set('width', String(Math.round(width)))
      if (height) u.searchParams.set('height', String(Math.round(height)))
      if (quality) u.searchParams.set('quality', String(quality))
      if (resize) u.searchParams.set('resize', resize)
      return u.toString()
    } catch {
      return url
    }
  }

  // Handle Unsplash Images
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url)
      if (width) u.searchParams.set('w', String(Math.round(width)))
      if (height) u.searchParams.set('h', String(Math.round(height)))
      u.searchParams.set('q', String(quality))
      u.searchParams.set('auto', 'format')
      return u.toString()
    } catch {
      return url
    }
  }

  return url
}
