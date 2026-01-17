# Subscription Management & Auto-Renewal System

## Overview
This guide explains the new subscription management system integrated with Xendit for automatic renewal and payment processing with fee pass-through to customers.

## Features Implemented

### 1. **Active Subscriptions Manager** (`client/components/ActiveSubscriptionsManager.tsx`)
A comprehensive dashboard component that displays:
- **Active Subscriptions List** with:
  - Customer information (name, email)
  - Package details
  - Subscription cycle count
  - Days until renewal (with color coding)
  - Auto-renewal status
  - Payment method
  
- **Key Metrics**:
  - Cycle tracking for renewal accounting
  - Renewal date and amount
  - Auto-renew enabled/disabled status
  - Payment method tracking

- **Actions**:
  - Setup Xendit auto-renewal plan
  - Manual renewal processing
  - Filter by payment method

### 2. **Fee Structure (Passed to Customers)**
All Xendit fees are charged to customers, NOT the business:

```
💳 Credit Card:  2.9% + Rp 2,000
📱 E-Wallet:     2.0% + Rp 1,000
🏦 Bank Transfer: 3.0% + Rp 2,500
```

The system automatically calculates and adds these fees to the subscription amount.

### 3. **Database Integration**
New methods added to `neonDatabaseService`:
- `getSubscriptions(params)` - Fetch active subscriptions with filters
- Full support for subscription status tracking
- Cycle count tracking
- Payment method recording

### 4. **Backend API Endpoints**

#### Get Subscriptions
```
GET /api/neon/subscriptions?status=active&userId=xxx
```
Returns all active subscriptions with customer and package details.

#### Create Xendit Subscription Plan
```
POST /api/neon/subscription/xendit/create-plan
Body:
{
  subscriptionId: string
  customerId: string
  amount: number
  paymentMethod: "card" | "ewallet" | "bank_transfer"
  interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
  intervalCount: number
}
```

#### Process Renewal
```
POST /api/neon/subscription/xendit/process-renewal
Body:
{
  subscriptionId: string
  customerId: string
  amount: number (base amount)
  totalWithFees: number (amount + platform fee)
  platformFee: number (calculated fee)
  paymentMethod: string
}
```

### 5. **Xendit Service Extensions** (`client/services/xenditService.ts`)

New methods added:
- `createSubscriptionPlan()` - Create recurring billing plan
- `renewSubscription()` - Process subscription renewal with fees

## How to Set Up

### Step 1: Connect Xendit API Key
You'll need to provide your Xendit API key when creating subscription plans.

1. Go to **Active Subscriptions** tab in the dashboard
2. Click "Setup" on any subscription
3. Enter your Xendit Secret Key (when prompted)

### Step 2: Enable Auto-Renewal
For each subscription:
1. Click "Setup" to configure Xendit auto-renewal
2. System creates a recurring plan in Xendit
3. Customer is billed automatically on renewal date

### Step 3: Manual Renewal Processing
If customer needs immediate renewal:
1. Click "Renew Now" on the subscription
2. Select payment method
3. System calculates fees and processes payment
4. Fee breakdown shown to admin before confirming

## Payment Flow

### Auto-Renewal Flow
```
1. Subscription created (start date + renewal cycle)
   ↓
2. Admin sets up Xendit plan (click "Setup")
   ↓
3. On renewal date, Xendit automatically charges customer
   ↓
4. Amount includes base subscription + platform fee
   ↓
5. System updates subscription record with new cycle count
   ↓
6. Notification sent to customer & admin
```

### Manual Renewal Flow
```
1. Admin clicks "Renew Now"
   ↓
2. Select payment method
   ↓
3. System displays:
   - Base amount: ₱X,XXX
   - Platform fee: ₱XXX (percentage-based)
   - Total charge: ₱X,XXX
   ↓
4. Admin confirms (charges customer)
   ↓
5. Xendit processes payment
   ↓
6. Subscription record updated
```

## Admin Dashboard Integration

### New Tab: "Active Subscriptions"
Located in admin sidebar (cyan/blue gradient icon):
- View all active subscription plans
- See renewal dates and cycle counts
- Manage auto-renewal settings
- Process manual renewals
- Filter by payment method

### Dashboard Stats Updated
The main dashboard now shows:
- **Active Subscriptions Count**
- **Subscription Revenue**
- **New Subscriptions** (this period)
- **Account Upgrades** (free → premium conversions)

## Fee Calculation Examples

### Example 1: Credit Card Payment
- Base subscription: ₱1,000
- Fee calculation: (₱1,000 × 2.9%) + ₱2,000 = ₱32.00 fee
- Total charged: ₱1,032.00
- Customer sees: "₱1,000 subscription + ₱32 Xendit fee = ₱1,032 total"

### Example 2: E-Wallet Payment
- Base subscription: ₱3,000
- Fee calculation: (₱3,000 × 2.0%) + ₱1,000 = ₱61.00 fee
- Total charged: ₱3,061.00

### Example 3: Bank Transfer
- Base subscription: ₱5,000
- Fee calculation: (₱5,000 × 3.0%) + ₱2,500 = ₱152.50 fee
- Total charged: ₱5,152.50

## Database Fields Tracked

For each subscription:
- `id` - Subscription ID
- `userId` - Customer ID
- `status` - active | paused | cancelled | expired
- `startDate` - When subscription began
- `endDate` - When current cycle ends
- `renewalDate` - Next billing date
- `finalPrice` - Base subscription amount
- `xenditPlanId` - Xendit recurring plan ID
- `paymentMethod` - Card | E-wallet | Bank transfer
- `autoRenew` - Boolean (auto-renewal enabled)
- `cycleCount` - Number of billing cycles completed
- `platformFee` - Calculated Xendit fee
- `totalWithFees` - Amount actually charged

## Notifications & Alerts

### Subscription Status Indicators
- 🟢 Green (30+ days): Healthy - plenty of time
- 🟠 Orange (8-30 days): Caution - remind customer
- 🟡 Yellow (1-7 days): Warning - renewal soon
- 🔴 Red (Expired): Critical - needs renewal

### Auto-Notifications (to implement)
- 7 days before renewal: Notification to customer
- 1 day before renewal: Last reminder
- On renewal: Confirmation email with receipt
- On failure: Alert to both customer and admin

## Implementation Checklist

- [x] Active Subscriptions Manager component
- [x] Backend API endpoints for subscriptions
- [x] Xendit service extensions
- [x] Database integration
- [x] Fee calculation logic
- [x] Admin sidebar integration
- [x] Dashboard stats updated
- [ ] Xendit API key configuration in settings
- [ ] Auto-renewal setup in customer profile
- [ ] Email notifications on renewal
- [ ] Webhook handling for Xendit events
- [ ] Refund/cancellation flow

## Next Steps

1. **Add Xendit API Key**
   - Update `AdminSettings.tsx` to accept Xendit Secret Key
   - Store securely in environment or admin config

2. **Customer Profile Integration**
   - Show subscription status in customer details
   - Allow customers to manage auto-renewal
   - Display renewal history

3. **Notification System**
   - Email reminders before renewal
   - Failure notifications
   - Receipt generation

4. **Reporting**
   - Subscription revenue by period
   - Churn/renewal rates
   - Payment method usage analysis

## API Key Configuration

To enable Xendit payments, you'll need:
- **Xendit Secret Key**: Available from your Xendit dashboard
- **Environment Setup**: Add to `.env` or admin settings

## Troubleshooting

### Setup Plan Fails
- Check Xendit API key is valid
- Verify customer email is valid
- Ensure subscription amount > 0

### Renewal Fails
- Check payment method is valid
- Verify customer has sufficient balance/credit
- Check Xendit service status

### Wrong Fee Calculation
- Verify payment method selected matches intended method
- Check XENDIT_FEES constant for current rates
- May need to update fees if Xendit rates change

## File Reference

```
client/
├── components/
│   └── ActiveSubscriptionsManager.tsx (651 lines)
├── services/
│   └── xenditService.ts (extended with subscription methods)
├── pages/
│   └── AdminDashboard.tsx (integrated component)
└── components/
    └── AdminSidebar.tsx (added navigation item)

server/
├── routes/
│   └── neon-api.ts (3 new endpoints)
├── main-server.ts (registered routes)
└── services/
    └── neonDatabaseService.ts (subscription methods)
```

---

**Setup Guide Complete!**
Ready to accept your Xendit API key and configure auto-renewal payments.
