import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Contact } from '@/models';
import { contactSchema } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';

// GET /api/contact - Get contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    await connectDB();
    
    if (payload.role !== 'super_admin' && payload.role !== 'store_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const unread = searchParams.get('unread');
    
    // Build query
    const query: any = {};
    if (unread === 'true') {
      query.read = false;
    }
    
    // Scoped visibility
    if (payload.role === 'store_admin') {
      query.locationId = payload.locationId;
    } else if (searchParams.get('locationId')) {
      query.locationId = searchParams.get('locationId');
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const messages = await Contact.find(query)
      .populate('locationId', 'name district')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Contact.countDocuments(query);
    const unreadCountQuery = { ...query, read: false };
    const unreadCount = await Contact.countDocuments(unreadCountQuery);
    
    return NextResponse.json({
      success: true,
      messages,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get contact messages error:', error);
    
    if (error.message === 'Authentication required') {
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

// POST /api/contact - Submit contact message (public)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate input
    const result = contactSchema.safeParse(body);
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
    
    // Prepare payload
    const dataToSave = { ...result.data };
    if (!dataToSave.locationId) {
      delete dataToSave.locationId; // Do not save empty string as an ObjectId
    }

    const message = await Contact.create(dataToSave);
    
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully. We will get back to you soon.',
      contact: message,
    }, { status: 201 });
  } catch (error) {
    console.error('Submit contact error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
