import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/emailService';

// POST - Send a custom email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text, from, attachments } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Recipient, subject, and HTML content are required' },
        { status: 400 }
      );
    }

    const success = await EmailService.sendEmail({
      to,
      subject,
      html,
      text,
      from,
      attachments
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
