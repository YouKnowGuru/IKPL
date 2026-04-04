/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
  // ✅ DO NOT expose server secrets here.
  // Server-side env vars (MONGODB_URI, JWT_SECRET, CLOUDINARY_API_SECRET, etc.)
  // are automatically available in API routes and server components via process.env.
  // Only prefix with NEXT_PUBLIC_ if a variable genuinely needs to be on the client.
}

module.exports = nextConfig
