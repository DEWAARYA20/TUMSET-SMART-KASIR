import { NextRequest, NextResponse } from 'next/server';

/**
 * Payment Gateway Webhook Handler
 * 
 * Handles incoming webhook notifications from payment providers
 * (Midtrans, Xendit, etc.) to verify and process payments.
 * 
 * In production:
 * - Verify webhook signature from provider
 * - Cross-check order amount with database
 * - Call activate_subscription() Postgres function
 * - Log all events to payment_events table
 * 
 * For demo/development, this simulates the webhook flow.
 */

interface WebhookPayload {
  event_type: string;
  order_id: string;
  external_id?: string;
  amount?: number;
  status: string;
  payment_method?: string;
  paid_at?: string;
  signature?: string;
}

// Simulated webhook secret for demo (in production, use env variable)
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'demo-webhook-secret-key';

/**
 * Verify webhook signature from payment provider
 * In production, implement proper HMAC verification
 */
function verifyWebhookSignature(payload: string, signature: string): boolean {
  // In production: 
  // const expectedSignature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
  // return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  
  // Demo mode: accept all
  if (process.env.NODE_ENV === 'development' || !signature) {
    return true;
  }
  return signature === WEBHOOK_SECRET;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-webhook-signature') || '';

    // 1. Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('[WEBHOOK] Invalid signature');
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // 2. Parse payload
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // 3. Validate required fields
    if (!payload.order_id || !payload.status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: order_id, status' },
        { status: 400 }
      );
    }

    console.log(`[WEBHOOK] Received event: ${payload.event_type} for order ${payload.order_id}`);

    // 4. Process based on event type
    switch (payload.event_type) {
      case 'payment.success':
      case 'payment.paid': {
        // In production:
        // - Fetch order from database
        // - Verify amount matches plan price
        // - Call supabase.rpc('activate_subscription', { ... })
        // - Update payment_orders status to 'paid'
        // - Log to payment_events

        console.log(`[WEBHOOK] Payment success for order ${payload.order_id}`);

        return NextResponse.json({
          success: true,
          message: 'Payment processed successfully',
          order_id: payload.order_id,
          processed_at: new Date().toISOString(),
        });
      }

      case 'payment.failed':
      case 'payment.expired': {
        console.log(`[WEBHOOK] Payment failed/expired for order ${payload.order_id}`);

        return NextResponse.json({
          success: true,
          message: 'Payment failure recorded',
          order_id: payload.order_id,
        });
      }

      case 'payment.refunded': {
        console.log(`[WEBHOOK] Payment refunded for order ${payload.order_id}`);

        return NextResponse.json({
          success: true,
          message: 'Refund processed',
          order_id: payload.order_id,
        });
      }

      default: {
        console.log(`[WEBHOOK] Unknown event type: ${payload.event_type}`);
        return NextResponse.json({
          success: true,
          message: 'Event acknowledged',
        });
      }
    }
  } catch (error) {
    console.error('[WEBHOOK] Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'tumset-billing-webhook',
    timestamp: new Date().toISOString(),
  });
}
