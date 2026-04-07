import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Use the environment variable if available, otherwise fallback to a generic domain or placeholder.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ikplbhutan.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/dashboard/',
        '/orders/',
        '/cart/',
        '/checkout/',
        '/_next/',    // Disallow indexing of internal Next.js build files
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
