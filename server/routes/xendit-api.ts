import express, { RequestHandler } from 'express';

const router = express.Router();

// Xendit Secret Key (use environment variable in production)
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || 'xnd_production_YOUR_SECRET_KEY_HERE';
const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN || '';
const XENDIT_API_URL = 'https://api.xendit.co/v2';

// Create Invoice
export const createInvoice: RequestHandler = async (req, res) => {
  console.log('💳 Xendit create invoice request received');
  console.log('Request body:', req.body);

  try {
    const {
      external_id,
      amount,
      payer_email,
      description,
      customer,
      success_redirect_url,
      failure_redirect_url,
    } = req.body;

    const response = await fetch(`${XENDIT_API_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
      },
      body: JSON.stringify({
        external_id,
        amount,
        payer_email,
        description,
        customer,
        success_redirect_url,
        failure_redirect_url,
        currency: 'PHP',
        invoice_duration: 86400, // 24 hours
        items: [
          {
            name: description,
            quantity: 1,
            price: amount,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Xendit invoice creation error:', error);
      return res.status(response.status).json({
        success: false,
        error: error.message || 'Failed to create invoice',
      });
    }

    const data = await response.json();
    res.json({
      success: true,
      invoice_id: data.id,
      invoice_url: data.invoice_url,
      expiry_date: data.expiry_date,
    });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
};

// Charge Card (for direct card charges)
export const chargeCard: RequestHandler = async (req, res) => {
  try {
    const {
      token_id,
      authentication_id,
      amount,
      external_id,
      description,
    } = req.body;

    const response = await fetch(`${XENDIT_API_URL}/credit_card_charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
      },
      body: JSON.stringify({
        token_id,
        authentication_id,
        amount,
        external_id,
        description,
        currency: 'PHP',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Xendit charge error:', error);
      return res.status(response.status).json({
        success: false,
        error: error.message || 'Failed to charge card',
      });
    }

    const data = await response.json();
    res.json({
      success: true,
      charge_id: data.id,
      status: data.status,
      amount: data.amount,
    });
  } catch (error: any) {
    console.error('Charge card error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
};

// Webhook handler for Xendit callbacks
export const handleWebhook: RequestHandler = async (req, res) => {
  try {
    const event = req.body;

    console.log('Xendit webhook received:', event);

    // Verify webhook authenticity using callback token
    const callbackToken = req.headers['x-callback-token'];

    if (!callbackToken || callbackToken !== XENDIT_WEBHOOK_TOKEN) {
      console.error('Invalid webhook token');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized webhook request',
      });
    }

    // Handle different event types
    if (event.status === 'PAID' || event.status === 'SETTLED') {
      // Update booking payment status
      const externalId = event.external_id; // e.g., "BOOKING_123"
      const bookingId = externalId.replace('BOOKING_', '');
      
      // Update booking in database
      // await updateBookingPaymentStatus(bookingId, 'paid', event.id);
      
      console.log(`Payment successful for booking ${bookingId}`);
    } else if (event.status === 'EXPIRED' || event.status === 'FAILED') {
      const externalId = event.external_id;
      const bookingId = externalId.replace('BOOKING_', '');
      
      // Update booking payment status
      // await updateBookingPaymentStatus(bookingId, 'failed', event.id);
      
      console.log(`Payment failed/expired for booking ${bookingId}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
};

export default router;
