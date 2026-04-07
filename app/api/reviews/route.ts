import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Review } from '@/models';
import { reviewSchema } from '@/lib/validation';
import { requireAuth, requireAdmin } from '@/lib/auth';

// GET /api/reviews - Get reviews
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const pending = searchParams.get('pending');
    
    // Build query
    const query: any = {};
    
    if (productId) {
      query.product = productId;
    }
    
    // Only show approved reviews to public
    if (pending !== 'true') {
      query.approved = true;
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const reviews = await Review.find(query)
      .populate('user', 'name')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create review (authenticated)
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    await connectDB();
    
    const body = await request.json();
    
    // Validate input
    const result = reviewSchema.safeParse(body);
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
    
    const { productId, rating, comment } = result.data;
    
    // Create review (pending approval)
    const review = await Review.create({
      user: payload.userId,
      product: productId,
      rating,
      comment,
      approved: false,
    });
    
    await review.populate('user', 'name');
    
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. Pending approval.',
      review,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create review error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this product' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
