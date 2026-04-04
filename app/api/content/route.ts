import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Content } from '@/models';
import { contentSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/auth';

// GET /api/content - Get all content or specific content by key
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (key) {
      const content = await Content.findOne({ key });
      
      if (!content) {
        return NextResponse.json(
          { success: false, message: 'Content not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        content,
      });
    }
    
    const contents = await Content.find().sort({ key: 1 });
    
    return NextResponse.json({
      success: true,
      contents,
    });
  } catch (error) {
    console.error('Get content error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/content - Create or update content (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();
    
    const body = await request.json();
    
    // Validate input
    const result = contentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: result.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const { key, title, value } = result.data;
    
    // Upsert content
    const content = await Content.findOneAndUpdate(
      { key },
      { title, value },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Content saved successfully',
      content,
    });
  } catch (error: any) {
    console.error('Save content error:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
