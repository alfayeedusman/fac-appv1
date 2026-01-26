# Test Credentials & Account Information

## ✅ System Status

- **Database**: Connected ✅
- **Server**: Running on port 8080 ✅
- **API**: All endpoints operational ✅

---

## 🔐 Admin & Manager Accounts

### Superadmin Accounts

| Email                           | Password          | Role       | Branch      | Subscription |
| ------------------------------- | ----------------- | ---------- | ----------- | ------------ |
| `superadmin@fayeedautocare.com` | `SuperAdmin2024!` | Superadmin | Head Office | VIP          |
| `admin.fayeed@gmail.com`        | `FayeedSuper123!` | Superadmin | Head Office | Premium      |

### Admin Test Accounts

| Email                      | Password      | Role    | Branch      | Subscription |
| -------------------------- | ------------- | ------- | ----------- | ------------ |
| `test.admin@example.com`   | `password123` | Admin   | Head Office | Premium      |
| `test.manager@example.com` | `password123` | Manager | Tumaga      | Premium      |
| `test.cashier@example.com` | `password123` | Cashier | Tumaga      | Basic        |

---

## 👥 Premium Customer Accounts

| Email                           | Password      | Role | Loyalty Points | Subscription |
| ------------------------------- | ------------- | ---- | -------------- | ------------ |
| `premium.customer1@example.com` | `password123` | User | 5,000          | **Premium**  |
| `premium.customer2@example.com` | `password123` | User | 3,500          | **Premium**  |
| `vip.customer@example.com`      | `password123` | User | 10,000         | **VIP**      |
| `basic.customer@example.com`    | `password123` | User | 1,000          | **Basic**    |
| `free.customer@example.com`     | `password123` | User | 0              | **Free**     |

---

## 📋 Original Seeded Accounts

### Admin Accounts

| Email                               | Password           | Role    |
| ----------------------------------- | ------------------ | ------- |
| `admin@fayeedautocare.com`          | `admin123`         | Admin   |
| `manager.tumaga@fayeedautocare.com` | `TumagaAdmin2024!` | Manager |
| `manager.boalan@fayeedautocare.com` | `BoalanAdmin2024!` | Manager |
| `cashier.tumaga@fayeedautocare.com` | `Cashier123!`      | Cashier |

### Customer Accounts

| Email                    | Password       | Subscription |
| ------------------------ | -------------- | ------------ |
| `john.doe@gmail.com`     | `Customer123!` | Premium      |
| `maria.santos@gmail.com` | `Maria2024!`   | Premium      |
| `carlos.reyes@gmail.com` | `Carlos123!`   | Basic        |
| `anna.lopez@gmail.com`   | `Anna2024!`    | Free         |

---

## 🚀 Testing Guide

### 1. Test Admin Login

```
Email: test.admin@example.com
Password: password123
Expected: Access to /admin-dashboard
```

### 2. Test Manager Login

```
Email: test.manager@example.com
Password: password123
Expected: Access to /manager-dashboard
```

### 3. Test Premium Customer Login

```
Email: premium.customer1@example.com
Password: password123
Expected: Access to /dashboard with premium features
```

### 4. Test VIP Customer Login

```
Email: vip.customer@example.com
Password: password123
Expected: Access to /dashboard with VIP features
```

---

## ✨ Features by Subscription

### Free Plan

- Basic booking functionality
- Limited to 2 bookings per month
- No loyalty points multiplier

### Basic Plan

- Unlimited bookings
- 1.5x loyalty points
- Basic support

### Premium Plan

- Priority booking (24hr earlier)
- 2x loyalty points
- Email + Chat support
- Free cancellations (up to 6hrs before)

### VIP Plan

- Executive priority booking
- 3x loyalty points
- Concierge support
- Free cancellations (up to 24hrs before)
- Monthly premium perks

---

## 🔧 Troubleshooting

### Login Not Working?

1. **Clear browser cache**: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. **Hard refresh**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
3. **Check browser console**: F12 for error details
4. **Verify network tab**: Check if login POST request is succeeding (200-201 status)

### Password Issues?

All test accounts use either:

- `password123` (for newly seeded accounts)
- The listed password for original accounts

### Database Connection Issues?

The server will automatically retry connection. Check server logs for:

- `✅ Database connection successful`
- `✅ Database migrations completed`

---

## 📊 Database Schema

- **Users table**: Contains all user accounts with encrypted passwords
- **User Sessions**: Tracks active user sessions (24hr expiry)
- **Subscriptions**: Stores subscription details and expiry dates
- **Loyalty Points**: Tracks points per user and transaction history
- **Bookings**: Service booking records

---

## 🎯 Next Steps

1. ✅ Verify all accounts are accessible
2. ✅ Test booking flow for each subscription level
3. ✅ Verify loyalty points calculation
4. ✅ Test admin dashboard features
5. ✅ Verify email notifications (if configured)

---

**Last Updated**: 2026-01-26
**System Status**: ✅ Fully Operational
