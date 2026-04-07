import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Blog } from '@/models';
import { requireAuth } from '@/lib/auth';

// Utility for slug generation
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .trim();
};

// GET /api/blog – Public list of published blogs
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    const query: any = {};
    if (!isAdmin) {
      query.published = true; // Public only sees published
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const blogs = await Blog.find(query)
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments(query);
    return NextResponse.json({
      success: true,
      blogs,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/blog – Super Admin only
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { title, content, excerpt, coverImage, category, published, tags } = body;

    if (!title || !content || !excerpt) {
      return NextResponse.json({ success: false, message: 'Title, content, and excerpt are required' }, { status: 400 });
    }

    // Generate unique slug
    let slug = generateSlug(title);
    const existing = await Blog.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // Calculate reading time (approx 200 words per minute)
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      coverImage: coverImage || '/images/placeholder-blog.jpg',
      category: category || 'Other',
      published: published || false,
      author: payload.userId,
      readingTime,
      tags: tags || []
    });

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
