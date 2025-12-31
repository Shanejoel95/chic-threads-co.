import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  size?: string;
  color?: string;
}

interface OrderConfirmationRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  deliveryMethod: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-order-confirmation function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderConfirmationRequest = await req.json();
    console.log("Order data received:", JSON.stringify(orderData, null, 2));

    const {
      orderId,
      customerEmail,
      customerName,
      items,
      subtotal,
      shippingCost,
      tax,
      total,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry,
      deliveryMethod,
    } = orderData;

    // Generate items HTML
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.product_name}
            ${item.size ? `<br><small style="color: #6b7280;">Size: ${item.size}</small>` : ""}
            ${item.color ? `<br><small style="color: #6b7280;">Color: ${item.color}</small>` : ""}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.unit_price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.total_price.toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background-color: #18181b; color: #ffffff; padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Order Confirmed!</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Thank you for your purchase</p>
            </div>
            
            <!-- Order Info -->
            <div style="padding: 32px;">
              <p style="margin: 0 0 16px 0; color: #374151;">Hi ${customerName},</p>
              <p style="margin: 0 0 24px 0; color: #374151;">
                Your order <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> has been confirmed and is being processed.
              </p>
              
              <!-- Order Items -->
              <h2 style="font-size: 18px; color: #18181b; margin: 0 0 16px 0;">Order Details</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Item</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Price</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <!-- Order Summary -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6b7280;">Subtotal</span>
                  <span style="color: #374151;">$${subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6b7280;">Shipping (${deliveryMethod})</span>
                  <span style="color: #374151;">$${shippingCost.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6b7280;">Tax</span>
                  <span style="color: #374151;">$${tax.toFixed(2)}</span>
                </div>
                <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between;">
                  <span style="font-weight: 600; color: #18181b;">Total</span>
                  <span style="font-weight: 600; color: #18181b;">$${total.toFixed(2)}</span>
                </div>
              </div>
              
              <!-- Shipping Address -->
              <h2 style="font-size: 18px; color: #18181b; margin: 0 0 12px 0;">Shipping Address</h2>
              <p style="margin: 0; color: #374151; line-height: 1.6;">
                ${customerName}<br>
                ${shippingAddress}<br>
                ${shippingCity}, ${shippingState} ${shippingZip}<br>
                ${shippingCountry}
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f3f4f6; padding: 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                Questions about your order? Contact our support team.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} StyleStore. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("Sending email to:", customerEmail);

    const emailResponse = await resend.emails.send({
      from: "StyleStore <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Order Confirmed - #${orderId.slice(0, 8).toUpperCase()}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
