# Xendit Payment Integration

This document describes the Xendit payment gateway integration for online payments in the FAC App.

## Overview

When customers select "Online Payment" during booking, a Xendit invoice popup will appear for payment processing. The integration uses Xendit's Invoice API for secure payment processing.

## Configuration

### API Keys

**Public Key (Frontend):**

- Located in: `client/services/xenditService.ts`
- Current: `xnd_public_production_nIE1jSkGVG0K1fDTroRMXjLHJ14sfjM6YyU_m_ochdnqJHLWv2JJ40BUiBhUD7jx`

**Secret Key (Backend):**

- Environment variable: `XENDIT_SECRET_KEY`
- ⚠️ **IMPORTANT:** Replace the placeholder secret key in `server/routes/xendit-api.ts` with your actual Xendit secret key
- Get your secret key from: https://dashboard.xendit.co/settings/developers#api-keys

### Environment Setup

1. Set the Xendit secret key as an environment variable:

   ```bash
   export XENDIT_SECRET_KEY="your_secret_key_here"
   ```

2. Or update it in the `.env` file (if using one):
   ```
   XENDIT_SECRET_KEY=your_secret_key_here
   ```

## How It Works

### Payment Flow

1. **Customer Books Service:**

   - Customer selects "Online Payment" during booking
   - Fills in all booking details and confirms

2. **Booking Creation:**

   - System creates booking in database
   - Booking status: `pending`
   - Payment status: `pending`

3. **Xendit Invoice Creation:**

   - System creates a Xendit invoice via API
   - Invoice amount: Total booking price
   - External ID: `BOOKING_{bookingId}`

4. **Payment Popup:**

   - Xendit invoice opens in a popup window
   - Customer completes payment (credit/debit card, e-wallet, etc.)

5. **Payment Callback:**
   - Xendit sends webhook to: `/api/neon/payment/xendit/webhook`
   - System updates booking payment status based on webhook

### Payment Methods Supported

Via Xendit, customers can pay using:

- Credit/Debit Cards (Visa, Mastercard, etc.)
- GCash
- PayMaya
- Bank Transfer
- Other Philippine payment methods

## API Endpoints

### Create Invoice

```
POST /api/neon/payment/xendit/create-invoice
```

**Request Body:**

```json
{
  "external_id": "BOOKING_123",
  "amount": 1500,
  "payer_email": "customer@example.com",
  "description": "Payment for booking 123 - Car Wash",
  "customer": {
    "given_names": "John Doe",
    "email": "customer@example.com"
  },
  "success_redirect_url": "https://yourapp.com/booking-success?bookingId=123",
  "failure_redirect_url": "https://yourapp.com/booking-failed?bookingId=123"
}
```

**Response:**

```json
{
  "success": true,
  "invoice_id": "inv_xxx",
  "invoice_url": "https://checkout.xendit.co/web/inv_xxx",
  "expiry_date": "2024-01-15T10:00:00Z"
}
```

### Webhook Handler

```
POST /api/neon/payment/xendit/webhook
```

This endpoint receives payment status updates from Xendit.

**Webhook Events:**

- `PAID` - Payment successful
- `SETTLED` - Payment settled
- `EXPIRED` - Invoice expired
- `FAILED` - Payment failed

## Testing

### Test Mode

1. Use Xendit test API keys for development:

   - Test Public Key: `xnd_public_development_...`
   - Test Secret Key: `xnd_development_...`

2. Use test credit cards from Xendit documentation:
   - https://developers.xendit.co/api-reference/#test-scenarios

### Test Cards

**Successful Payment:**

- Card: `4000000000000002`
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment:**

- Card: `4000000000000010`
- CVV: Any 3 digits
- Expiry: Any future date

## Security Notes

1. **Never expose secret key in frontend code**
2. **Always validate webhook signatures** (implement in production)
3. **Use HTTPS in production**
4. **Store API keys in environment variables**
5. **Implement proper error handling**

## Webhook Configuration

Configure webhook URL in Xendit Dashboard:

1. Go to https://dashboard.xendit.co/settings/developers#webhooks
2. Add webhook URL: `https://yourapp.com/api/neon/payment/xendit/webhook`
3. Select events: `invoice.paid`, `invoice.expired`, `invoice.failed`

## Production Checklist

- [ ] Replace test API keys with production keys
- [ ] Configure production webhook URL in Xendit Dashboard
- [ ] Implement webhook signature verification
- [ ] Set up proper error monitoring
- [ ] Test payment flow end-to-end
- [ ] Configure success/failure redirect URLs
- [ ] Set up email notifications for payment status

## Troubleshooting

### Invoice not opening

- Check browser popup blockers
- Verify Xendit SDK is loaded (check browser console)
- Check public key is correct

### Payment not updating booking

- Check webhook is configured correctly
- Verify webhook URL is accessible
- Check server logs for webhook errors
- Verify secret key is correct

### Common Errors

**401 Unauthorized:**

- Invalid or missing secret key
- Check `XENDIT_SECRET_KEY` environment variable

**400 Bad Request:**

- Invalid request parameters
- Check invoice creation payload

**500 Internal Server Error:**

- Check server logs
- Verify database connection
- Check Xendit API status

## Resources

- Xendit Documentation: https://developers.xendit.co/
- Xendit Dashboard: https://dashboard.xendit.co/
- Support: https://help.xendit.co/

## Support

For issues related to:

- Payment processing: Contact Xendit support
- App integration: Check server logs and Xendit dashboard
- Booking issues: Check database records
