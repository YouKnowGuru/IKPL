import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Contact } from '@/models';
import { requireAuth } from '@/lib/auth';
import { sendContactReplyEmail } from '@/lib/mail';

export async function POST(
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
    
    const body = await request.json();
    const { replyMessage } = body;

    if (!replyMessage || typeof replyMessage !== 'string') {
      return NextResponse.json({ success: false, message: 'Reply message is required' }, { status: 400 });
    }

    const message = await Contact.findById(id);
    if (!message) {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }

    // Role verification
    if (payload.role === 'store_admin' && message.locationId?.toString() !== payload.locationId) {
      return NextResponse.json({ success: false, message: 'Forbidden: Message belongs to another store' }, { status: 403 });
    }

    // Attempt to send email
    await sendContactReplyEmail(message.email, message.subject, replyMessage, message.message);

    // Save to DB
    message.replied = true;
    message.replyMessage = replyMessage;
    message.read = true;
    await message.save();

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      contact: message
    });
  } catch (error: any) {
    console.error('Reply contact message error:', error);
    
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
