import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  newStatus: string;
  orderTotal: number;
}

const statusMessages: Record<string, { subject: string; heading: string; message: string }> = {
  confirmed: {
    subject: "Order Confirmed",
    heading: "Your Order Has Been Confirmed! ✓",
    message: "Great news! We've confirmed your order and it's now being prepared for processing.",
  },
  processing: {
    subject: "Order Being Processed",
    heading: "Your Order Is Being Processed 📦",
    message: "Your order is currently being prepared and packaged with care.",
  },
  shipped: {
    subject: "Order Shipped",
    heading: "Your Order Is On Its Way! 🚚",
    message: "Exciting news! Your order has been shipped and is on its way to you.",
  },
  delivered: {
    subject: "Order Delivered",
    heading: "Your Order Has Been Delivered! 🎉",
    message: "Your order has been successfully delivered. We hope you love your purchase!",
  },
  cancelled: {
    subject: "Order Cancelled",
    heading: "Your Order Has Been Cancelled",
    message: "Your order has been cancelled. If you have any questions, please contact our support team.",
  },
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received order status update email request");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, customerEmail, customerName, newStatus, orderTotal }: StatusUpdateRequest = await req.json();

    console.log(`Sending status update email for order ${orderId} to ${customerEmail}, new status: ${newStatus}`);

    const statusInfo = statusMessages[newStatus] || {
      subject: "Order Status Update",
      heading: "Your Order Status Has Been Updated",
      message: `Your order status has been updated to: ${newStatus}.`,
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${statusInfo.subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #eee;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">LUXE</h1>
          </div>
          
          <div style="padding: 30px 0;">
            <h2 style="color: #111; margin-bottom: 20px;">${statusInfo.heading}</h2>
            
            <p>Hi ${customerName},</p>
            
            <p>${statusInfo.message}</p>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
              <p style="margin: 0 0 10px 0;"><strong>Status:</strong> <span style="text-transform: capitalize; color: ${newStatus === 'cancelled' ? '#dc2626' : '#16a34a'};">${newStatus}</span></p>
              <p style="margin: 0;"><strong>Order Total:</strong> $${orderTotal.toFixed(2)}</p>
            </div>
            
            ${newStatus === 'shipped' ? `
              <p style="color: #666;">You will receive tracking information shortly if applicable.</p>
            ` : ''}
            
            ${newStatus === 'delivered' ? `
              <p>We'd love to hear about your experience! If you have any feedback, please don't hesitate to reach out.</p>
            ` : ''}
            
            <p>If you have any questions about your order, please contact our customer support team.</p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The LUXE Team</strong>
            </p>
          </div>
          
          <div style="border-top: 2px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;">Thank you for shopping with LUXE</p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "LUXE <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `${statusInfo.subject} - Order #${orderId.slice(0, 8).toUpperCase()}`,
      html: emailHtml,
    });

    console.log("Status update email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending status update email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
