import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateThemeHtml = (title: string, message: string, otp: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 40px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #18191c; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden;">
        <tr>
            <td style="padding: 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(249,115,22,0.05));">
                <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">IKPL<span style="color: #10b981;">.</span></h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #ffffff;">${title}</h2>
                <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #a1a1aa;">${message}</p>
                <div style="background-color: #0a0a0f; border: 1px dashed rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 30px;">
                    <span style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #10b981; margin-bottom: 15px; font-weight: 700;">Your Security Code</span>
                    <span style="font-size: 42px; font-weight: 800; color: #ffffff; letter-spacing: 8px;">${otp}</span>
                </div>
                <p style="margin: 0; font-size: 13px; color: #71717a; text-align: center;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 24px 40px; text-align: center; background-color: #0a0a0f; border-top: 1px solid rgba(255,255,255,0.05);">
                <p style="margin: 0; font-size: 12px; color: #52525b;">&copy; ${new Date().getFullYear()} IKPL Group. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

const generateOrderInvoiceHtml = (title: string, message: string, order: any) => {
  const itemsHtml = order.items.map((item: any) => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 15px 0;">
            <div style="font-weight: 600; color: #ffffff;">${item.productId?.name || 'Product'}</div>
            <div style="font-size: 12px; color: #71717a;">Qty: ${item.quantity}</div>
        </td>
        <td style="padding: 15px 0; text-align: right; color: #ffffff; font-weight: 600;">
            ${item.price > 0 ? `Nu. ${(item.price * item.quantity).toLocaleString()}` : ''}
        </td>
    </tr>
  `).join('');

  const paymentStatusColor = order.paymentStatus === 'paid' ? '#10b981' : (order.paymentStatus === 'credit' ? '#ef4444' : '#f59e0b');

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 40px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #18191c; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden;">
        <tr>
            <td style="padding: 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(249,115,22,0.05));">
                <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">IKPL<span style="color: #10b981;">.</span></h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px;">
                <div style="margin-bottom: 30px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 800; color: #ffffff;">${title}</h2>
                    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #a1a1aa;">${message}</p>
                </div>

                <div style="background-color: #0c0d10; border-radius: 16px; padding: 25px; border: 1px solid rgba(255,255,255,0.03); margin-bottom: 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <span style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 1px;">Receipt ID</span>
                                <div style="font-weight: 800; color: #ffffff;">#${order._id.toString().slice(-8).toUpperCase()}</div>
                            </td>
                            <td style="padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right;">
                                <span style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 1px;">Status</span>
                                <div style="font-weight: 800; color: ${paymentStatusColor};">${order.paymentStatus?.toUpperCase() || 'UNPAID'}</div>
                            </td>
                        </tr>
                        ${itemsHtml}
                        <tr>
                            <td style="padding-top: 20px; font-weight: 700; color: #ffffff;">${order.totalPrice > 0 ? 'Total Amount' : 'Payment Mode'}</td>
                            <td style="padding-top: 20px; text-align: right; font-size: 20px; font-weight: 800; color: #10b981;">
                                ${order.totalPrice > 0 ? `Nu. ${order.totalPrice.toLocaleString()}` : 'PICKUP PAYMENT'}
                            </td>
                        </tr>
                        ${order.amountPaid > 0 && order.totalPrice > 0 ? `
                        <tr>
                            <td style="padding-top: 10px; font-size: 13px; color: #a1a1aa;">Amount Paid</td>
                            <td style="padding-top: 10px; text-align: right; font-size: 13px; color: #10b981;">Nu. ${order.amountPaid.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding-top: 5px; font-weight: 700; color: #ffffff;">Balance Due</td>
                            <td style="padding-top: 5px; text-align: right; font-weight: 700; color: #ef4444;">Nu. ${(order.totalPrice - order.amountPaid).toLocaleString()}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>

                <div style="background-color: #10b98110; border: 1px solid #10b98130; border-radius: 16px; padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #10b981; font-weight: 600;">
                        ${order.status === 'completed' ? 'This order has been picked up and verified.' : 'Please present your Receipt ID at the store for pickup.'}
                    </p>
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding: 24px 40px; text-align: center; background-color: #0a0a0f; border-top: 1px solid rgba(255,255,255,0.05);">
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #52525b; line-height: 1.5;">
                    IKPL Group - Premium Livestock Feed Solutions<br>
                    Global Quality, Local Trust.
                </p>
                <p style="margin: 0; font-size: 12px; color: #3f3f46;">&copy; ${new Date().getFullYear()} IKPL Group. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

export const sendVerificationEmail = async (to: string, otp: string) => {
  if (!process.env.SMTP_USER) {
    console.log(`[DEV MODE] Skipping real email. Verification OTP for ${to} is: ${otp}`);
    return true;
  }
  
  const mailOptions = {
    from: `"IKPL Security" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify your email address",
    html: generateThemeHtml(
      "Email Verification", 
      "Welcome to IKPL Feed Platform! Please use the following One-Time Password (OTP) to complete your registration.",
      otp
    ),
  };

  await transporter.sendMail(mailOptions);
  return true;
};

export const sendPasswordResetEmail = async (to: string, otp: string) => {
  if (!process.env.SMTP_USER) {
    console.log(`[DEV MODE] Skipping real email. Password Reset OTP for ${to} is: ${otp}`);
    return true;
  }

  const mailOptions = {
    from: `"IKPL Security" <${process.env.SMTP_USER}>`,
    to,
    subject: "Password Reset Request",
    html: generateThemeHtml(
      "Password Reset", 
      "We received a request to reset your password for your IKPL account. Please use the following code to reset your password.",
      otp
    ),
  };

  await transporter.sendMail(mailOptions);
  return true;
};

export const sendOrderPlacedEmail = async (to: string, order: any) => {
  if (!process.env.SMTP_USER) {
    console.log(`[DEV MODE] Skipping real email. Order Confirmation for ${to}`);
    return true;
  }

  const mailOptions = {
    from: `"IKPL Orders" <${process.env.SMTP_USER}>`,
    to,
    subject: `Order Confirmation #${order._id.toString().slice(-8).toUpperCase()}`,
    html: generateOrderInvoiceHtml(
      "Order Placed Successfully",
      "Thank you for choosing IKPL! Your order has been recorded and is being prepared for pickup. Here are the details of your purchase.",
      order
    ),
  };

  await transporter.sendMail(mailOptions);
  return true;
};

export const sendOrderCompletionEmail = async (to: string, order: any) => {
  if (!process.env.SMTP_USER) {
    console.log(`[DEV MODE] Skipping real email. Final Invoice for ${to}`);
    return true;
  }

  const mailOptions = {
    from: `"IKPL Orders" <${process.env.SMTP_USER}>`,
    to,
    subject: `Final Invoice #${order._id.toString().slice(-8).toUpperCase()}`,
    html: generateOrderInvoiceHtml(
      "Order Pickup Completed",
      "Your order pickup is now complete! Thank you for your business. Please find your final bill and payment summary below. We look forward to serving you again.",
      order
    ),
  };

  await transporter.sendMail(mailOptions);
  return true;
};

export const sendContactReplyEmail = async (to: string, subject: string, replyMessage: string, originalMessage: string) => {
  if (!process.env.SMTP_USER) {
    console.log(`[DEV MODE] Skipping real email. Reply to ${to}`);
    return true;
  }

  const mailOptions = {
    from: `"IKPL Support" <${process.env.SMTP_USER}>`,
    to,
    subject: `Re: ${subject}`,
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reply from IKPL</title>
</head>
<body style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 40px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #18191c; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden;">
        <tr>
            <td style="padding: 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(249,115,22,0.05));">
                <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">IKPL<span style="color: #10b981;">.</span></h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #10b981;">Customer Support Reply</h2>
                
                <div style="background-color: #0c0d10; border-radius: 16px; padding: 25px; border: 1px solid rgba(255,255,255,0.03); margin-bottom: 30px;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e4e4e7; white-space: pre-wrap;">${replyMessage}</p>
                </div>
                
                <div style="margin-top: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 1px;">Original Message</p>
                    <blockquote style="margin: 0; border-left: 3px solid rgba(16,185,129,0.5); padding-left: 16px; font-size: 14px; line-height: 1.5; color: #a1a1aa; font-style: italic; white-space: pre-wrap; background-color: rgba(255,255,255,0.02); padding: 15px; border-radius: 0 12px 12px 0;">
                        ${originalMessage}
                    </blockquote>
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding: 24px 40px; text-align: center; background-color: #0a0a0f; border-top: 1px solid rgba(255,255,255,0.05);">
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #52525b; line-height: 1.5;">
                    IKPL Group - Premium Livestock Feed Solutions<br>
                    Global Quality, Local Trust.
                </p>
                <p style="margin: 0; font-size: 12px; color: #3f3f46;">&copy; ${new Date().getFullYear()} IKPL Group. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>
    `
  };

  await transporter.sendMail(mailOptions);
  return true;
};
