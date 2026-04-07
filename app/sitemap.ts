import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import { Product, Blog } from '@/models';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ikpl-feed.com';

  // Force establishing DB connection for dynamic generation
  await connectDB();

  // 1. Core static marketing and informational pages
  const staticPages = [
    '',
    '/about',
    '/products',
    '/blog',
    '/contact',
    '/gallery',
    '/udoor',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamically fetch all active products
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await Product.find({ status: 'active' }).select('_id updatedAt').lean();
    productPages = products.map((product: any) => ({
      url: `${baseUrl}/product/${product._id}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));
  } catch (error) {
    console.error('Sitemap product fetch error:', error);
  }

  // 3. Dynamically fetch all published blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogs = await Blog.find({ published: true }).select('slug updatedAt').lean();
    blogPages = blogs.map((blog: any) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt || new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap blog fetch error:', error);
  }

  // Return full amalgamation of all valid SEO routes
  return [...staticPages, ...productPages, ...blogPages];
}
