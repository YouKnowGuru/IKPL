import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Contact } from '@/models';
import { requireAuth } from '@/lib/auth';

// PATCH /api/contact/[id] - Mark message as read (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    await connectDB();
    
    // Check access
    if (payload.role !== 'super_admin' && payload.role !== 'store_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }
    
    const message = await Contact.findById(id);
    if (!message) {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }

    if (payload.role === 'store_admin' && message.locationId?.toString() !== payload.locationId) {
      return NextResponse.json({ success: false, message: 'Forbidden: Message belongs to another store' }, { status: 403 });
    }

    message.read = true;
    await message.save();
    
    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error: any) {
    console.error('Update contact message error:', error);
    
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

// DELETE /api/contact/[id] - Delete message (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    await connectDB();
    
    // Check access
    if (payload.role !== 'super_admin' && payload.role !== 'store_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }
    
    const message = await Contact.findById(id);
    if (!message) {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }

    if (payload.role === 'store_admin' && message.locationId?.toString() !== payload.locationId) {
      return NextResponse.json({ success: false, message: 'Forbidden: Message belongs to another store' }, { status: 403 });
    }

    await message.deleteOne();
    
    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete contact message error:', error);
    
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
