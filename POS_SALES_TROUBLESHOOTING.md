# POS Sales Not Showing - Complete Troubleshooting Guide

## Issue
"Sales are not reflecting after payment or generating receipt - sales total stays at ₱0.00"

## Quick Diagnostic Steps

### Step 1: Check Browser Console for Errors
1. Open your browser (Chrome, Firefox, Edge, etc.)
2. Press **F12** or **Right-click > Inspect**
3. Click the **Console** tab
4. Try making a sale (add carwash, process payment)
5. Look for RED ERROR messages in the console
6. Report any red errors you see

### Step 2: Verify Transaction is Being Saved
When you make a sale, you should see console logs like:
```
💾 Saving transaction to database...
   Transaction #TXN-1234567890
   Amount: ₱150.00
   Items: 1
   Customer: Walk-in Customer (ID: walk-in)
   Payment Method: cash
   Branch ID: default
   Cashier: your@email.com (ID: your@email.com)

✅ Transaction saved successfully: {success: true, transactionId: "abc123..."}
```

**If you don't see these messages:**
- The payment might not be completing
- Click "Process Payment" and check if the modal properly validates your inputs
- Make sure you entered a Customer ID before clicking "Pay"

### Step 3: Verify Sales Data Refresh
After transaction, you should see:
```
📊 Immediately refreshing sales data after transaction...
   Current time: 2024-01-15T10:30:45.123Z

✅ Sales report loaded: {
   totalSales: 150,
   totalCash: 150,
   totalCard: 0,
   ...
}

✅ Sales data refreshed in 1234ms
```

**If sales show 0:**
- The transaction was saved, but not showing in daily report
- This means a DATE or DATABASE QUERY issue

---

## Common Issues and Fixes

### Issue 1: "Customer ID is required" Error
**Symptom:** When clicking "Pay", you get an error message saying customer ID is required

**Fix:**
1. In the Payment Modal, either:
   - Click "Search Customer" and select/enter a customer ID
   - OR enter a customer ID/phone manually in the field
2. Customer ID can be: phone number, email, or any unique identifier
3. For "walk-in" customers, you can enter: "walk-in" or the phone number

### Issue 2: Console Shows Transaction Saved, But Sales Still 0
**Symptom:** 
- Console shows `✅ Transaction saved successfully`
- But sales report comes back with `totalSales: 0`

**Root Cause:** The daily report query is not finding transactions saved today

**Diagnosis:**
Open browser console and look for the daily report log:
```
📊 Fetching sales report for 2024-01-15...
   Current time: 2024-01-15T10:30:45.123Z
```

Check if the date matches your current date. If it's showing yesterday's date, there's a timezone issue.

**Fix:**
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Refresh the page (Ctrl+R or Cmd+R)
- Try making the transaction again
- If still not working, check server timezone settings

### Issue 3: Payment Modal Won't Process
**Symptom:** When you click "Pay", nothing happens or it says "Processing..." forever

**Fix:**
1. Check browser console for errors
2. Verify you're connected to the internet
3. Wait 30 seconds - sometimes the server is slow
4. Try refreshing the page and trying again
5. Check if your payment details are correct:
   - For CASH: Make sure amount paid is >= total amount
   - For CARD/GCASH: Enter a reference number (transaction ID from provider)

### Issue 4: "Database not initialized" Error
**Symptom:** Console shows: `Database not initialized` or `Failed to save transaction`

**Fix:**
This means the backend database isn't connected properly.
- Contact your system administrator
- Check that the Supabase database is running
- Verify DATABASE_URL environment variable is set

---

## Manual Database Check

If you want to verify transactions are in the database:

### Option 1: Check Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Run this query:
```sql
SELECT id, transaction_number, total_amount, payment_method, created_at, status
FROM pos_transactions
ORDER BY created_at DESC
LIMIT 10;
```

You should see your recent transactions listed.

### Option 2: Check via API
Open a new browser tab and visit:
```
https://yourserver.com/api/pos/transactions?limit=10
```

You should get back a JSON list of transactions.

---

## Step-by-Step Transaction Flow

Here's what SHOULD happen:

```
1. ADD CARWASH TO CART
   ├─ Carwash service selected
   ├─ Vehicle type selected
   ├─ Price calculated
   └─ Item added to cart ✅

2. OPEN PAYMENT MODAL
   ├─ Cart shows items
   ├─ Total amount displays
   └─ Modal opens ✅

3. ENTER CUSTOMER INFO
   ├─ Customer ID entered/selected
   └─ Shows in payment modal ✅

4. PROCESS PAYMENT
   ├─ Payment method selected
   ├─ Amount verified
   ├─ "Pay" button clicked
   └─ Modal shows "Processing..." ✅

5. SAVE TRANSACTION
   ├─ API call to /api/pos/transactions
   ├─ Server inserts into database ✅
   ├─ Returns transactionId ✅
   └─ Receipt prints (if enabled) ✅

6. REFRESH SALES
   ├─ Immediately calls /api/pos/reports/daily/{today}
   ├─ Server queries database for today's transactions
   ├─ Returns total sales ✅
   └─ UI updates with new total ✅

7. PAYMENT COMPLETE
   ├─ Cart clears
   ├─ Modal closes
   ├─ Sales total now shows new amount ✅
   └─ Success notification shows ✅
```

If any step fails, check the console logs for the exact error.

---

## Testing Checklist

Run through this checklist to identify where it's failing:

- [ ] POS opens successfully (Opening Modal appears)
- [ ] Opening balance can be entered (shows ₱X.XX in stats bar)
- [ ] Carwash can be added to cart (cart shows 1 item)
- [ ] Cart total is correct (shows actual price, not multiplied)
- [ ] Payment Modal opens when clicking "Process Payment"
- [ ] Customer ID field is visible and editable
- [ ] Payment method can be selected
- [ ] For cash: can enter amount paid
- [ ] For card/gcash: can enter reference number
- [ ] "Pay" button is clickable
- [ ] Console shows "💾 Saving transaction..." message
- [ ] Console shows "✅ Transaction saved successfully" message
- [ ] Console shows "📊 Fetching sales report..." message
- [ ] Sales total updates to show the new amount
- [ ] Opening balance still displays correctly
- [ ] Cart clears after payment
- [ ] Success notification appears

If any step fails, report which one and share the console errors.

---

## What Was Fixed

✅ Opening balance now properly saved and displayed
✅ Cart total displays correct amount (not multiplied by 1.12)
✅ Payment button shows correct total
✅ Detailed console logging added for debugging
✅ Enhanced error reporting with transaction details

---

## Next Steps If Still Not Working

If you've tried all the above and sales still aren't showing:

1. Open Developer Tools (F12)
2. Take a screenshot of any red errors in the Console tab
3. Check the Network tab - do you see the `/api/pos/transactions` request?
4. Does that request show status `200` (success) or another status?
5. Check the Response of that request - what does it return?

Share these details and we can diagnose the exact issue.
