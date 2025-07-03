# Fayeed Auto Care - Mobile API Specification

## 🔗 Base API Configuration

**Base URL**: `https://api.fayeedautocare.com/v1`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`

## 🔐 Authentication Endpoints

### 1. User Registration

```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Dela Cruz",
  "email": "john@email.com",
  "password": "Password123!",
  "contactNumber": "+639123456789",
  "address": "123 Main St, Zamboanga City",
  "vehicleType": "sedan",
  "carUnit": "Toyota Camry 2024",
  "carPlateNumber": "ABC 1234",
  "branchLocation": "tumaga",
  "packageToAvail": "classic"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "john@email.com",
      "fullName": "John Dela Cruz",
      "status": "pending",
      "role": "user"
    },
    "token": "jwt_token_here"
  },
  "message": "Registration successful"
}
```

### 2. User Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@email.com",
  "password": "Password123!"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "john@email.com",
      "fullName": "John Dela Cruz",
      "role": "user",
      "profileComplete": true
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### 3. Biometric Authentication Setup

```http
POST /auth/biometric/setup
Authorization: Bearer {token}

{
  "biometricType": "fingerprint", // fingerprint, face, voice
  "deviceId": "device_unique_id",
  "publicKey": "biometric_public_key"
}
```

### 4. Social Login

```http
POST /auth/social
Content-Type: application/json

{
  "provider": "google", // google, facebook, apple
  "token": "social_provider_token",
  "deviceInfo": {
    "platform": "android",
    "version": "11",
    "deviceId": "unique_device_id"
  }
}
```

## 👤 User Profile Endpoints

### 1. Get User Profile

```http
GET /user/profile
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "user_123",
    "fullName": "John Dela Cruz",
    "email": "john@email.com",
    "contactNumber": "+639123456789",
    "address": "123 Main St, Zamboanga City",
    "profileImage": "https://cdn.example.com/profile.jpg",
    "vehicles": [
      {
        "id": "vehicle_1",
        "type": "sedan",
        "unit": "Toyota Camry 2024",
        "plateNumber": "ABC 1234",
        "isDefault": true
      }
    ],
    "membership": {
      "type": "classic",
      "status": "active",
      "expiryDate": "2024-12-31",
      "remainingWashes": 4
    },
    "preferredBranch": "tumaga",
    "totalWashes": 15,
    "joinDate": "2024-01-15"
  }
}
```

### 2. Update Profile

```http
PUT /user/profile
Authorization: Bearer {token}

{
  "fullName": "John Dela Cruz Jr.",
  "contactNumber": "+639123456790",
  "address": "456 New St, Zamboanga City",
  "preferredBranch": "boalan"
}
```

### 3. Upload Profile Image

```http
POST /user/profile/image
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "image": file_data
}
```

## 🚗 Vehicle Management

### 1. Add Vehicle

```http
POST /user/vehicles
Authorization: Bearer {token}

{
  "type": "suv",
  "unit": "Honda CR-V 2023",
  "plateNumber": "XYZ 5678",
  "isDefault": false
}
```

### 2. Get Vehicles

```http
GET /user/vehicles
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "vehicle_1",
      "type": "sedan",
      "unit": "Toyota Camry 2024",
      "plateNumber": "ABC 1234",
      "isDefault": true,
      "addedDate": "2024-01-15"
    }
  ]
}
```

## 📱 QR Code & Check-in

### 1. QR Code Scan

```http
POST /qr/scan
Authorization: Bearer {token}

{
  "qrData": "branch_tumaga_12345",
  "location": {
    "latitude": 6.9214,
    "longitude": 122.0790
  },
  "timestamp": "2024-01-20T10:30:00Z"
}

Response:
{
  "success": true,
  "data": {
    "type": "branch_checkin",
    "branch": {
      "id": "branch_tumaga",
      "name": "Tumaga Hub",
      "address": "Tumaga, Zamboanga City",
      "services": ["classic", "vip_silver", "vip_gold"]
    },
    "availableServices": [
      {
        "id": "classic_wash",
        "name": "Classic Wash",
        "duration": "30 minutes",
        "included": true
      }
    ],
    "userMembership": {
      "type": "classic",
      "remainingWashes": 3
    }
  }
}
```

### 2. Start Service

```http
POST /services/start
Authorization: Bearer {token}

{
  "branchId": "branch_tumaga",
  "serviceType": "classic_wash",
  "vehicleId": "vehicle_1",
  "qrSessionId": "qr_session_123"
}
```

## 📅 Booking System

### 1. Get Available Slots

```http
GET /booking/available-slots
Authorization: Bearer {token}
Query Parameters:
  - branchId: branch_tumaga
  - date: 2024-01-25
  - serviceType: classic_wash

Response:
{
  "success": true,
  "data": {
    "date": "2024-01-25",
    "branch": "Tumaga Hub",
    "availableSlots": [
      {
        "time": "09:00",
        "duration": 30,
        "available": true
      },
      {
        "time": "09:30",
        "duration": 30,
        "available": true
      }
    ]
  }
}
```

### 2. Create Booking

```http
POST /booking/create
Authorization: Bearer {token}

{
  "branchId": "branch_tumaga",
  "serviceType": "classic_wash",
  "vehicleId": "vehicle_1",
  "date": "2024-01-25",
  "time": "09:00",
  "notes": "Please focus on the wheels"
}

Response:
{
  "success": true,
  "data": {
    "bookingId": "booking_123",
    "status": "confirmed",
    "qrCode": "booking_qr_data",
    "estimatedTotal": 500.00
  }
}
```

### 3. Get Bookings

```http
GET /booking/history
Authorization: Bearer {token}
Query Parameters:
  - status: upcoming|completed|cancelled
  - page: 1
  - limit: 20

Response:
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking_123",
        "date": "2024-01-25",
        "time": "09:00",
        "branch": "Tumaga Hub",
        "service": "Classic Wash",
        "vehicle": "Toyota Camry 2024 (ABC 1234)",
        "status": "upcoming",
        "total": 500.00
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 3,
      "totalCount": 45
    }
  }
}
```

## 💳 Payment & Subscription

### 1. Get Payment Methods

```http
GET /payment/methods
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "savedCards": [
      {
        "id": "card_123",
        "last4": "1234",
        "brand": "visa",
        "expiryMonth": 12,
        "expiryYear": 2025,
        "isDefault": true
      }
    ],
    "availableMethods": ["card", "gcash", "paymaya", "bank_transfer"]
  }
}
```

### 2. Process Payment

```http
POST /payment/process
Authorization: Bearer {token}

{
  "amount": 500.00,
  "paymentMethodId": "card_123",
  "bookingId": "booking_123",
  "currency": "PHP"
}

Response:
{
  "success": true,
  "data": {
    "paymentId": "payment_123",
    "status": "completed",
    "receipt": {
      "receiptNumber": "RCP-2024-001",
      "downloadUrl": "https://api.example.com/receipts/payment_123.pdf"
    }
  }
}
```

### 3. Subscription Management

```http
GET /subscription/current
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "sub_123",
    "type": "classic",
    "status": "active",
    "startDate": "2024-01-01",
    "expiryDate": "2024-01-31",
    "remainingWashes": 3,
    "totalWashes": 4,
    "autoRenew": true,
    "nextBilling": "2024-02-01"
  }
}
```

## 🎫 Voucher System

### 1. Get Available Vouchers

```http
GET /vouchers/available
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "voucher_123",
      "code": "WELCOME20",
      "title": "Welcome Discount",
      "description": "20% off your first wash",
      "discountType": "percentage",
      "discountValue": 20,
      "expiryDate": "2024-12-31",
      "minAmount": 100,
      "isUsed": false
    }
  ]
}
```

### 2. Apply Voucher

```http
POST /vouchers/apply
Authorization: Bearer {token}

{
  "voucherCode": "WELCOME20",
  "bookingAmount": 500.00
}

Response:
{
  "success": true,
  "data": {
    "discountAmount": 100.00,
    "finalAmount": 400.00,
    "voucher": {
      "code": "WELCOME20",
      "title": "Welcome Discount"
    }
  }
}
```

## 📊 Analytics & History

### 1. Dashboard Stats

```http
GET /user/dashboard
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "totalWashes": 15,
    "totalSpent": 7500.00,
    "currentStreak": 3,
    "memberSince": "2024-01-15",
    "recentActivity": [
      {
        "type": "wash_completed",
        "date": "2024-01-20",
        "branch": "Tumaga Hub",
        "service": "Classic Wash"
      }
    ],
    "upcomingBookings": 2,
    "membership": {
      "type": "classic",
      "remainingWashes": 3
    }
  }
}
```

### 2. Service History

```http
GET /user/history
Authorization: Bearer {token}
Query Parameters:
  - page: 1
  - limit: 20
  - dateFrom: 2024-01-01
  - dateTo: 2024-01-31

Response:
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "service_123",
        "date": "2024-01-20T10:30:00Z",
        "branch": "Tumaga Hub",
        "service": "Classic Wash",
        "vehicle": "Toyota Camry 2024",
        "duration": 30,
        "cost": 500.00,
        "rating": 5,
        "status": "completed"
      }
    ],
    "summary": {
      "totalServices": 15,
      "totalCost": 7500.00,
      "averageRating": 4.8
    }
  }
}
```

## 🔔 Notifications

### 1. Get Notifications

```http
GET /notifications
Authorization: Bearer {token}
Query Parameters:
  - page: 1
  - limit: 20
  - type: all|booking|promotion|system

Response:
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "booking_reminder",
        "title": "Booking Reminder",
        "message": "Your car wash is scheduled tomorrow at 9:00 AM",
        "isRead": false,
        "createdAt": "2024-01-20T08:00:00Z",
        "data": {
          "bookingId": "booking_123"
        }
      }
    ],
    "unreadCount": 3
  }
}
```

### 2. Mark as Read

```http
PUT /notifications/{notificationId}/read
Authorization: Bearer {token}
```

### 3. Push Notification Settings

```http
PUT /user/notification-settings
Authorization: Bearer {token}

{
  "pushEnabled": true,
  "emailEnabled": true,
  "smsEnabled": false,
  "categories": {
    "bookingReminders": true,
    "promotions": true,
    "systemUpdates": false
  }
}
```

## 🏢 Branch & Location

### 1. Get Branches

```http
GET /branches
Authorization: Bearer {token}
Query Parameters:
  - lat: 6.9214
  - lng: 122.0790
  - radius: 10

Response:
{
  "success": true,
  "data": [
    {
      "id": "branch_tumaga",
      "name": "Tumaga Hub",
      "address": "Tumaga, Zamboanga City",
      "coordinates": {
        "latitude": 6.9214,
        "longitude": 122.0790
      },
      "distance": 2.5,
      "services": ["classic", "vip_silver", "vip_gold"],
      "operatingHours": {
        "monday": "08:00-18:00",
        "tuesday": "08:00-18:00",
        "sunday": "09:00-17:00"
      },
      "contactNumber": "+639123456789",
      "currentLoad": "medium"
    }
  ]
}
```

## ⚙️ Admin Endpoints (Staff/Manager)

### 1. Admin Dashboard

```http
GET /admin/dashboard
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": {
    "stats": {
      "todayBookings": 25,
      "activeCustomers": 150,
      "revenue": {
        "today": 12500.00,
        "month": 450000.00
      },
      "servicesToday": 30
    },
    "recentBookings": [...],
    "alerts": [...]
  }
}
```

### 2. Customer Management

```http
GET /admin/customers
Authorization: Bearer {admin_token}
Query Parameters:
  - page: 1
  - limit: 20
  - search: john
  - status: active|pending|banned

Response:
{
  "success": true,
  "data": {
    "customers": [...],
    "pagination": {...}
  }
}
```

## 🔧 System Configuration

### 1. App Configuration

```http
GET /config/app
Response:
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "minVersion": "1.0.0",
    "updateRequired": false,
    "maintenanceMode": false,
    "features": {
      "qrScanning": true,
      "biometricAuth": true,
      "socialLogin": true
    },
    "paymentMethods": ["card", "gcash", "paymaya"],
    "supportContact": "+639123456789"
  }
}
```

## 📝 Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### Common Error Codes

- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (422)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)

## 🔐 Security Headers

All API responses should include:

```http
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
```

## 📱 Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **General API**: 100 requests per minute
- **File uploads**: 10 requests per hour
- **Admin endpoints**: 200 requests per minute
