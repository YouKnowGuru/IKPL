import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Blog } from '@/models';
import { requireAuth } from '@/lib/auth';

// Utility for slug generation
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const blog = await Blog.findById(id).populate('author', 'name email');
    if (!blog) {
      return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { title, content, excerpt, coverImage, category, published, tags } = body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    }

    // Update fields
    if (title && title !== blog.title) {
      blog.title = title;
      // Re-generate slug if title changed, but maybe better to keep it stable?
      // For now, let's keep it simple and stable if possible, but allow manual change if needed.
    }
    if (content) {
      blog.content = content;
      // Recalculate reading time
      const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      blog.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (excerpt) blog.excerpt = excerpt;
    if (coverImage) blog.coverImage = coverImage;
    if (category) blog.category = category;
    if (typeof published !== 'undefined') blog.published = published;
    if (tags) blog.tags = tags;

    await blog.save();
    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
