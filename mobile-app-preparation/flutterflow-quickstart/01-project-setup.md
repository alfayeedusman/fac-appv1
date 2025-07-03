# Fayeed Auto Care - FlutterFlow Quick Start Guide

## 🚀 Step 1: FlutterFlow Account & Project Setup

### Create Your FlutterFlow Account

1. **Go to FlutterFlow.io**

   - Visit: https://flutterflow.io
   - Click "Get Started for Free"

2. **Choose Pro Plan** (Recommended)

   - Monthly: $30/month
   - Annual: $25/month (save $60/year)
   - Features you need:
     - Custom functions
     - API integrations
     - Code export
     - Team collaboration

3. **Create New Project**
   - Project Name: "Fayeed Auto Care"
   - Template: Start from blank
   - Platform: iOS & Android

## 📱 Initial Project Configuration

### 1. App Settings

Navigate to **Settings > General**:

```
App Name: Fayeed Auto Care
Bundle ID: com.fayeedautocare.app
Package Name: com.fayeedautocare.app
Version: 1.0.0
Build Number: 1

App Icon: Upload 1024x1024 PNG (see app-store-assets folder)
```

### 2. Firebase Integration

Navigate to **Settings > Firebase**:

1. **Create Firebase Project**

   - Go to https://console.firebase.google.com
   - Create new project: "fayeed-auto-care"
   - Enable Google Analytics (recommended)

2. **Add iOS App**

   - Bundle ID: `com.fayeedautocare.app`
   - Download `GoogleService-Info.plist`

3. **Add Android App**

   - Package name: `com.fayeedautocare.app`
   - Download `google-services.json`

4. **Upload to FlutterFlow**
   - Settings > Firebase > Upload iOS config
   - Settings > Firebase > Upload Android config

### 3. Enable Firebase Services

In Firebase Console, enable:

- ✅ Authentication (Email/Password, Google)
- ✅ Firestore Database
- ✅ Cloud Storage
- ✅ Cloud Messaging
- ✅ Analytics
- ✅ Crashlytics

## 🎨 Design System Setup

### 1. Color Palette

Navigate to **Theme Settings > Colors**:

```
Primary Colors:
- Primary: #FF6B35 (FAC Orange)
- Primary Variant: #E64A19
- Secondary: #6C5CE7 (Purple)
- Secondary Variant: #5A67D8

Background Colors:
- Background: #F8F9FA
- Surface: #FFFFFF
- Error: #EF4444
- Success: #10B981
- Warning: #F59E0B

Text Colors:
- On Primary: #FFFFFF
- On Secondary: #FFFFFF
- On Background: #1A1A1A
- On Surface: #1A1A1A
- On Error: #FFFFFF
```

### 2. Typography

Navigate to **Theme Settings > Typography**:

```
Display Large: Poppins, 57px, Regular
Display Medium: Poppins, 45px, Regular
Display Small: Poppins, 36px, Regular

Headline Large: Poppins, 32px, SemiBold
Headline Medium: Poppins, 28px, SemiBold
Headline Small: Poppins, 24px, SemiBold

Title Large: Poppins, 22px, SemiBold
Title Medium: Poppins, 16px, Medium
Title Small: Poppins, 14px, Medium

Body Large: Inter, 16px, Regular
Body Medium: Inter, 14px, Regular
Body Small: Inter, 12px, Regular

Label Large: Inter, 14px, SemiBold
Label Medium: Inter, 12px, SemiBold
Label Small: Inter, 11px, SemiBold
```

### 3. Custom Widgets

Create these reusable components first:

#### **FACButton (Custom Button)**

- Location: **Widget Library > Create Widget**
- Name: FACButton
- Parameters:
  - buttonText (String)
  - buttonType (String) - "primary", "secondary", "outline"
  - onPressed (Action)
  - isLoading (Boolean)

#### **FACTextField (Custom Input)**

- Name: FACTextField
- Parameters:
  - labelText (String)
  - hintText (String)
  - isRequired (Boolean)
  - inputType (String)
  - controller (TextEditingController)

## 📊 Database Structure Setup

### 1. Firestore Collections

Navigate to **Backend > Firestore** and create:

#### **Users Collection**

```
Collection: users
Document: {userId}
Fields:
- fullName (String)
- email (String)
- phoneNumber (String)
- address (String)
- profileImageUrl (String)
- role (String) - "user", "admin", "staff"
- status (String) - "active", "pending", "banned"
- createdAt (Timestamp)
- membership (Map):
  - type (String)
  - status (String)
  - remainingWashes (Number)
  - expiryDate (Timestamp)
```

#### **Bookings Collection**

```
Collection: bookings
Document: {bookingId}
Fields:
- userId (String)
- branchId (String)
- serviceType (String)
- vehicleId (String)
- bookingDate (Timestamp)
- status (String)
- totalAmount (Number)
- paymentStatus (String)
- createdAt (Timestamp)
```

#### **Branches Collection**

```
Collection: branches
Document: {branchId}
Fields:
- name (String)
- address (String)
- coordinates (GeoPoint)
- operatingHours (Map)
- contactNumber (String)
- isActive (Boolean)
- services (Array)
```

### 2. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Branches are publicly readable
    match /branches/{branchId} {
      allow read: if true;
      allow write: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'staff'];
    }

    // Bookings are user-specific
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'staff']);
    }
  }
}
```

## 🔐 Authentication Setup

### 1. Firebase Authentication

Navigate to **Backend > Authentication**:

1. **Enable Sign-in Methods**:

   - ✅ Email/Password
   - ✅ Google (recommended)
   - 🔲 Facebook (optional)

2. **Create Auth Pages**:
   - Login Page
   - Registration Page
   - Forgot Password Page

### 2. App State Variables

Navigate to **App Settings > App State**:

```
Global Variables:
- currentUser (UserStruct)
- isAuthenticated (Boolean)
- authToken (String)
- membershipData (MembershipStruct)
- selectedVehicle (VehicleStruct)
```

## 📱 Page Structure

### 1. Create Initial Pages

Create these pages in order:

1. **SplashPage** - Loading and authentication check
2. **OnboardingPage** - Welcome flow for new users
3. **LoginPage** - User authentication
4. **RegisterPage** - User registration
5. **DashboardPage** - Main home screen
6. **QRScannerPage** - QR code scanning
7. **BookingPage** - Service booking
8. **ProfilePage** - User profile management

### 2. Navigation Setup

Navigate to **App Settings > Navigation**:

```
Initial Page: SplashPage

Navigation Logic:
- SplashPage → (authenticated) → DashboardPage
- SplashPage → (new user) → OnboardingPage
- SplashPage → (returning) → LoginPage

Bottom Navigation:
- Dashboard (Home icon)
- QR Scanner (QrCode icon) - Center FAB
- History (Clock icon)
- Profile (User icon)
```

## 🔌 API Integration Setup

### 1. API Base Configuration

Navigate to **Backend > API Calls**:

#### **Base Settings**

```
Base URL: https://api.fayeedautocare.com/v1
Default Headers:
- Content-Type: application/json
- Authorization: Bearer [authToken]
```

#### **Login API Call**

```
Name: loginUser
Method: POST
Endpoint: /auth/login
Body:
{
  "email": "[email]",
  "password": "[password]"
}
Response Variables:
- token (String)
- user (JSON)
```

#### **Register API Call**

```
Name: registerUser
Method: POST
Endpoint: /auth/register
Body:
{
  "fullName": "[fullName]",
  "email": "[email]",
  "password": "[password]",
  "contactNumber": "[contactNumber]",
  "address": "[address]"
}
```

### 2. Custom Functions

Navigate to **Custom Code > Custom Functions**:

#### **QR Code Processor**

```dart
String processQRCode(String qrData) {
  if (qrData.startsWith('branch_')) {
    return 'branch_checkin';
  } else if (qrData.startsWith('service_')) {
    return 'service_activation';
  }
  return 'unknown';
}
```

#### **Price Formatter**

```dart
String formatPrice(double amount) {
  return '₱${amount.toStringAsFixed(2)}';
}
```

## 📲 Device Features Setup

### 1. Permissions

Navigate to **Settings > Permissions**:

```
Required Permissions:
✅ Camera (QR scanning)
✅ Location (branch detection)
✅ Push Notifications
✅ Photo Library (profile pictures)
✅ Contacts (referrals)
```

### 2. Third-party Integrations

Add these packages in **Settings > Dependencies**:

```yaml
qr_code_scanner: ^1.0.1
geolocator: ^10.1.0
image_picker: ^1.0.4
url_launcher: ^6.2.1
share_plus: ^7.2.1
```

## 🧪 Testing Setup

### 1. Preview Configuration

Navigate to **Run > Test on Device**:

1. **Download FlutterFlow Viewer**

   - iOS: Download from App Store
   - Android: Download from Play Store

2. **Connect Device**
   - Scan QR code from FlutterFlow
   - Test real-time changes

### 2. Simulator Testing

1. **Web Preview**

   - Use built-in web preview
   - Test basic functionality

2. **Device Preview**
   - Test on actual devices
   - Verify camera functionality
   - Test location services

## 🎯 Next Steps Checklist

- [ ] Create FlutterFlow account and upgrade to Pro
- [ ] Set up Firebase project with all services
- [ ] Configure app settings and branding
- [ ] Set up color palette and typography
- [ ] Create database collections in Firestore
- [ ] Build authentication pages
- [ ] Create custom components
- [ ] Set up API integrations
- [ ] Test on real devices

## 📞 Support Resources

- **FlutterFlow Documentation**: https://docs.flutterflow.io
- **FlutterFlow Community**: https://community.flutterflow.io
- **Firebase Documentation**: https://firebase.google.com/docs
- **Flutter Documentation**: https://flutter.dev/docs

Ready to start building! The next guide will cover creating your first pages and components.
