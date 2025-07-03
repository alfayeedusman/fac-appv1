# Fayeed Auto Care - FlutterFlow Configuration Guide

## 🚀 FlutterFlow Setup for Fayeed Auto Care

This guide provides step-by-step instructions for creating the Fayeed Auto Care mobile app using FlutterFlow visual builder.

## 📋 Pre-Setup Requirements

### 1. FlutterFlow Account Setup

1. **Create FlutterFlow Account**

   - Visit: https://flutterflow.io
   - Choose Pro plan ($30/month) for full features
   - Enable team collaboration if needed

2. **Required Integrations**
   - Firebase project setup
   - Stripe payment integration
   - Google Maps API
   - Push notification services

### 2. Firebase Project Configuration

```bash
# Firebase services needed:
- Authentication (Email/Password, Google, Facebook)
- Firestore Database
- Cloud Storage
- Cloud Messaging (Push Notifications)
- Analytics
- Crashlytics
```

## 🎨 App Design System in FlutterFlow

### 1. Color Palette Setup

Navigate to **Theme Settings > Colors** and add:

```
Primary Colors:
- Primary: #FF6B35 (FAC Orange)
- Secondary: #6C5CE7 (Purple)
- Accent: #00D4AA (Teal)

Neutral Colors:
- Background: #F8F9FA
- Surface: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280

State Colors:
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- Info: #3B82F6
```

### 2. Typography System

**Theme Settings > Typography:**

```
Heading 1: Poppins, 32px, Bold
Heading 2: Poppins, 24px, SemiBold
Heading 3: Poppins, 20px, SemiBold
Body Large: Inter, 16px, Regular
Body Medium: Inter, 14px, Regular
Body Small: Inter, 12px, Regular
Button Text: Inter, 16px, SemiBold
Caption: Inter, 12px, Regular
```

### 3. Component Library Setup

Create these reusable components:

#### **CustomButton Component**

```
Properties:
- buttonText (String)
- buttonType (Primary/Secondary/Outline)
- onPressed (Action)
- isLoading (Boolean)
- iconData (IconData, optional)

Design:
- Rounded corners (8px)
- Padding: 16px horizontal, 12px vertical
- Color based on buttonType
- Loading state with spinner
```

#### **InputField Component**

```
Properties:
- labelText (String)
- hintText (String)
- isRequired (Boolean)
- inputType (Email/Password/Phone/Text)
- iconData (IconData, optional)
- controller (TextEditingController)

Design:
- Floating label
- Icon on left (optional)
- Error state styling
- Focus state with primary color border
```

#### **ServiceCard Component**

```
Properties:
- serviceTitle (String)
- serviceDescription (String)
- servicePrice (String)
- serviceImage (String)
- isSelected (Boolean)
- onTap (Action)

Design:
- Card with elevation
- Image header
- Title and description
- Price display
- Selection state indicator
```

#### **QRScannerWidget Component**

```
Properties:
- onQRScanned (Action)
- overlayText (String)
- showFlashToggle (Boolean)

Integration:
- Camera permission request
- QR code detection
- Overlay with scanning frame
- Flash toggle button
```

## 📱 Page Structure in FlutterFlow

### 1. Authentication Pages

#### **SplashPage**

- App logo animation
- Loading indicator
- Auto-navigation after 3 seconds
- Check authentication state

#### **OnboardingPage**

- PageView with 3 screens
- Feature highlights
- Skip and Next buttons
- Get Started CTA

#### **LoginPage**

```
Components:
- Email InputField
- Password InputField
- Login CustomButton
- Forgot Password link
- Social login buttons
- Register link

Actions:
- Email/Password authentication
- Google Sign-In
- Navigate to Dashboard on success
- Show error messages
```

#### **RegisterPage**

```
Components:
- Multi-step form (Stepper widget)
- Personal info inputs
- Vehicle information
- Package selection
- Terms agreement checkbox
- Register CustomButton

Actions:
- Form validation
- Firebase user creation
- Navigate to verification
```

### 2. Main Application Pages

#### **DashboardPage**

```
Components:
- Welcome header with user name
- Membership status card
- Quick actions grid
- Recent activity list
- QR scanner FAB

State Management:
- User profile data
- Membership information
- Recent bookings
- Notification count
```

#### **QRScannerPage**

```
Components:
- QRScannerWidget
- Scan instructions overlay
- Manual entry option
- Recent scans list

Actions:
- Camera permission handling
- QR code processing
- Branch check-in logic
- Service activation
```

#### **BookingPage**

```
Components:
- Service selection grid
- Branch selection dropdown
- Date/time picker
- Vehicle selection
- Booking summary
- Payment integration

State Management:
- Available services
- Branch information
- Time slots
- Selected options
```

#### **ProfilePage**

```
Components:
- Profile image upload
- Personal information form
- Vehicle management
- Subscription details
- Settings options

Actions:
- Image picker integration
- Profile update API calls
- Vehicle CRUD operations
```

## 🔧 FlutterFlow Custom Functions

### 1. QR Code Processing Function

```dart
// Custom Function: processQRCode
String processQRCode(String qrData) {
  // Parse QR code data
  if (qrData.startsWith('branch_')) {
    // Handle branch check-in
    return 'branch_checkin';
  } else if (qrData.startsWith('service_')) {
    // Handle service activation
    return 'service_activation';
  }
  return 'unknown';
}
```

### 2. Date Formatting Function

```dart
// Custom Function: formatBookingDate
String formatBookingDate(DateTime date) {
  return DateFormat('EEEE, MMMM d, y').format(date);
}
```

### 3. Price Formatting Function

```dart
// Custom Function: formatPrice
String formatPrice(double amount) {
  return NumberFormat.currency(
    locale: 'en_PH',
    symbol: '₱',
    decimalDigits: 2,
  ).format(amount);
}
```

## 🗄️ Database Schema in Firestore

### 1. Users Collection

```javascript
users/{userId} {
  // Personal Information
  fullName: "John Dela Cruz",
  email: "john@email.com",
  phoneNumber: "+639123456789",
  address: "123 Main St, Zamboanga City",
  profileImageUrl: "https://...",

  // Account Information
  role: "user", // user, admin, staff
  status: "active", // active, pending, banned
  createdAt: timestamp,
  lastLoginAt: timestamp,

  // Preferences
  preferredBranch: "tumaga",
  notificationSettings: {
    push: true,
    email: true,
    sms: false
  },

  // Membership
  membership: {
    type: "classic", // regular, classic, vip_silver, vip_gold
    status: "active",
    startDate: timestamp,
    expiryDate: timestamp,
    remainingWashes: 4,
    autoRenew: true
  }
}
```

### 2. Vehicles Subcollection

```javascript
users/{userId}/vehicles/{vehicleId} {
  type: "sedan", // sedan, suv, hatchback, pickup, van, motorcycle
  unit: "Toyota Camry 2024",
  plateNumber: "ABC 1234",
  isDefault: true,
  addedAt: timestamp
}
```

### 3. Bookings Collection

```javascript
bookings/{bookingId} {
  userId: "user123",
  branchId: "branch_tumaga",
  serviceType: "classic_wash",
  vehicleId: "vehicle123",

  // Booking Details
  bookingDate: timestamp,
  bookingTime: "09:00",
  duration: 30,
  status: "upcoming", // upcoming, in_progress, completed, cancelled

  // Pricing
  basePrice: 500.00,
  discountAmount: 50.00,
  totalAmount: 450.00,

  // Payment
  paymentStatus: "paid", // pending, paid, failed
  paymentMethod: "card",
  paymentId: "payment123",

  // Additional
  notes: "Please focus on the wheels",
  qrCode: "booking_qr_data",
  rating: 5,
  feedback: "Excellent service!",

  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. Branches Collection

```javascript
branches/{branchId} {
  name: "Tumaga Hub",
  address: "Tumaga, Zamboanga City",
  coordinates: {
    latitude: 6.9214,
    longitude: 122.0790
  },

  // Services
  availableServices: ["classic", "vip_silver", "vip_gold"],
  operatingHours: {
    monday: { open: "08:00", close: "18:00" },
    tuesday: { open: "08:00", close: "18:00" },
    // ... other days
    sunday: { open: "09:00", close: "17:00" }
  },

  // Contact
  contactNumber: "+639123456789",
  managerEmail: "tumaga@fayeedautocare.com",

  // Status
  isActive: true,
  currentLoad: "medium", // low, medium, high

  createdAt: timestamp
}
```

## 🔌 API Integration Setup

### 1. HTTP Requests Configuration

**Settings > API Calls:**

#### **Login API Call**

```
Method: POST
URL: https://api.fayeedautocare.com/v1/auth/login
Headers:
- Content-Type: application/json

Body:
{
  "email": "[email]",
  "password": "[password]"
}

Response Variables:
- token (String)
- user (JSON)
- success (Boolean)
```

#### **QR Scan API Call**

```
Method: POST
URL: https://api.fayeedautocare.com/v1/qr/scan
Headers:
- Authorization: Bearer [token]
- Content-Type: application/json

Body:
{
  "qrData": "[qrData]",
  "location": {
    "latitude": "[latitude]",
    "longitude": "[longitude]"
  }
}
```

### 2. State Management Setup

**App State Variables:**

```
Global Variables:
- currentUser (UserStruct)
- authToken (String)
- selectedVehicle (VehicleStruct)
- membershipInfo (MembershipStruct)
- notificationCount (int)

Page State Variables:
- isLoading (Boolean)
- errorMessage (String)
- bookingData (BookingStruct)
- availableSlots (List<String>)
```

## 📲 Device Features Integration

### 1. Camera/QR Scanner Setup

**Settings > Dependencies:**

```yaml
qr_code_scanner: ^1.0.1
permission_handler: ^11.0.1
```

**Custom Widget:**

- Create QR Scanner custom widget
- Handle camera permissions
- Process scanned QR codes
- Show scanning overlay

### 2. Location Services

**Dependencies:**

```yaml
geolocator: ^10.1.0
geocoding: ^2.1.1
```

**Permission Setup:**

- Request location permission
- Get current coordinates
- Calculate distance to branches
- Show nearest branch

### 3. Push Notifications

**Firebase Messaging Setup:**

- Configure FCM in Firebase console
- Setup notification channels
- Handle notification clicks
- Badge count management

## 💳 Payment Integration

### 1. Stripe Payment Setup

**FlutterFlow Settings > Integrations > Stripe:**

- Add publishable key
- Configure payment methods
- Setup subscription billing
- Handle payment callbacks

### 2. Philippine Payment Methods

**Additional Integrations:**

- GCash API integration
- PayMaya API setup
- Bank transfer options
- Cash payment tracking

## 🧪 Testing Strategy

### 1. FlutterFlow Testing

**Test Plan:**

1. **Design Review** - Check all pages and components
2. **Navigation Testing** - Verify all page transitions
3. **API Testing** - Test all backend integrations
4. **Device Testing** - Test on various screen sizes
5. **Performance Testing** - Check loading times

### 2. Beta Testing Setup

**TestFlight (iOS) Configuration:**

1. Export FlutterFlow project
2. Build in Xcode
3. Upload to App Store Connect
4. Invite beta testers
5. Collect feedback

**Google Play Internal Testing:**

1. Export Flutter project
2. Build APK/AAB
3. Upload to Play Console
4. Add internal testers
5. Monitor crash reports

## 🚀 Deployment Process

### 1. FlutterFlow to Production

**Steps:**

1. **Final Review** - Check all functionality
2. **Export Code** - Download Flutter project
3. **Code Customization** - Add any custom features
4. **Build Process** - Create production builds
5. **Store Submission** - Submit to app stores

### 2. Continuous Updates

**Update Process:**

1. **FlutterFlow Changes** - Make updates in visual builder
2. **Code Export** - Download updated project
3. **Testing** - Verify all changes
4. **Store Updates** - Push updates to stores

## 📊 Analytics Setup

### 1. FlutterFlow Analytics

**Built-in Analytics:**

- User engagement tracking
- Page view analytics
- Button click tracking
- Form completion rates

### 2. Firebase Analytics

**Event Tracking:**

```
Custom Events:
- qr_code_scanned
- booking_created
- payment_completed
- service_rated
- subscription_upgraded
```

## 🔧 Advanced Customizations

### 1. Custom Code Integration

**When to use Custom Code:**

- Complex QR scanning logic
- Advanced payment processing
- Biometric authentication
- Complex animations

### 2. Third-party Plugins

**Required Plugins:**

```yaml
# Camera and QR
qr_code_scanner: ^1.0.1
camera: ^0.10.5

# Authentication
local_auth: ^2.1.7
google_sign_in: ^6.1.5

# Maps and Location
google_maps_flutter: ^2.5.0
geolocator: ^10.1.0

# Payments
flutter_stripe: ^9.4.0

# Utils
intl: ^0.19.0
share_plus: ^7.2.1
url_launcher: ^6.2.1
```

## 🎯 Success Checklist

### Pre-Launch Checklist

- [ ] All pages designed and functional
- [ ] API integrations working
- [ ] Payment system tested
- [ ] QR scanner operational
- [ ] Push notifications configured
- [ ] App store assets prepared
- [ ] Privacy policy implemented
- [ ] Terms of service added
- [ ] Beta testing completed
- [ ] Performance optimized

### Post-Launch Monitoring

- [ ] User analytics tracking
- [ ] Crash monitoring setup
- [ ] Payment transaction monitoring
- [ ] Customer feedback collection
- [ ] App store review monitoring
- [ ] Performance metrics tracking

This comprehensive FlutterFlow guide ensures successful development and deployment of the Fayeed Auto Care mobile application with all required features and professional quality standards.
