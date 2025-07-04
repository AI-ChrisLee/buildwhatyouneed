/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable production optimizations
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: ['localhost', 'aichrislee.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
  
  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://youtube.com https://player.vimeo.com https://www.loom.com https://fast.wistia.net; object-src 'none';"
          },
        ],
      },
      {
        // Cache static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig