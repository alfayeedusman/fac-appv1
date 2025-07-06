# Fayeed Auto Care Mobile App

A Flutter mobile application for Fayeed Auto Care car wash services with QR scanning, booking management, and payment integration.

## 🚀 Quick Start

### Prerequisites

- Flutter SDK (3.0.0 or higher)
- Android Studio / Xcode
- Firebase project setup
- Node.js (for Express API)

### Installation

1. **Clone and navigate to Flutter app directory:**

```bash
cd flutter_app
```

2. **Install dependencies:**

```bash
flutter pub get
```

3. **Configure Firebase:**

   - Create a Firebase project at https://console.firebase.google.com
   - Add Android/iOS apps to your Firebase project
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Place them in their respective directories:
     - `android/app/google-services.json`
     - `ios/Runner/GoogleService-Info.plist`
   - Update `lib/firebase_options.dart` with your actual Firebase configuration

4. **Update API Configuration:**

   - Open `lib/core/services/api_service.dart`
   - Update the `baseUrl` to match your Express API URL
   - Ensure your Express API is running and accessible

5. **Run the app:**

```bash
flutter run
```

## 🏗️ Project Structure

```
lib/
├── app/                    # App-wide configuration
│   ├── app.dart           # Router setup
│   └── theme/             # App theme and styling
├── core/                  # Core functionality
│   ├── models/            # Data models
│   ├── providers/         # State management
│   └── services/          # External services
├── features/              # Feature-specific modules
│   ├── auth/              # Authentication
│   ├── dashboard/         # Main dashboard
│   ├── qr_scanner/        # QR scanning
│   ├── booking/           # Booking system
│   └── profile/           # User profile
└── main.dart              # App entry point
```

## 🔧 Configuration

### 1. Firebase Setup

Update the following files with your Firebase project details:

**lib/firebase_options.dart:**

```dart
static const FirebaseOptions android = FirebaseOptions(
  apiKey: 'your-actual-api-key',
  appId: 'your-actual-app-id',
  messagingSenderId: 'your-sender-id',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
);
```

### 2. API Configuration

**lib/core/services/api_service.dart:**

```dart
static const String baseUrl = 'https://your-actual-api-domain.com/api';
```

### 3. Branch Coordinates

**lib/core/services/location_service.dart:**

```dart
static const Map<String, Map<String, double>> _branchCoordinates = {
  'tumaga': {
    'latitude': 6.9214,  // Update with actual coordinates
    'longitude': 122.0790,
  },
  'boalan': {
    'latitude': 6.9100,  // Update with actual coordinates
    'longitude': 122.0730,
  },
};
```

## 🚀 Features Implemented

### ✅ Core Features (MVP)

- [x] User authentication (Firebase Auth)
- [x] QR code scanning with validation
- [x] Branch check-in system
- [x] Service booking interface
- [x] Payment integration setup
- [x] User dashboard
- [x] Profile management
- [x] Location-based branch detection

### 🎯 Priority Features

- [x] **QR Scanning System** - Primary feature with camera integration
- [x] **Booking Management** - Service selection and scheduling
- [x] **Payment Integration** - Ready for Stripe/local payment gateways

### 🔄 API Synchronization

- [x] User registration/login sync with Express API
- [x] Booking data synchronization
- [x] QR scan result processing
- [x] Real-time data updates

## 📱 Build & Deploy

### Android APK Build

1. **Configure signing:**

```bash
# Generate keystore
keytool -genkey -v -keystore ~/key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias key
```

2. **Create key.properties:**

```properties
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=key
storeFile=/path/to/key.jks
```

3. **Build APK:**

```bash
flutter build apk --release
```

### iOS Build

1. **Open in Xcode:**

```bash
open ios/Runner.xcworkspace
```

2. **Configure signing and build**

## 🔗 Integration with Existing Web App

The mobile app is designed to work seamlessly with your existing Express API:

### Shared Data Models

- User accounts are synchronized between web and mobile
- Bookings created on mobile appear on web admin
- QR scan history is tracked across platforms

### API Endpoints Used

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/qr/checkin` - Branch check-in
- `POST /api/bookings` - Create booking
- `GET /api/services` - Get available services
- `GET /api/branches` - Get branch information

## 🔒 Security Features

- Firebase Authentication for secure user management
- JWT token-based API authentication
- Location validation for QR check-ins
- Secure payment processing setup
- Data encryption for sensitive information

## 📈 Next Steps for Production

1. **Complete Firebase Configuration:**

   - Set up actual Firebase project
   - Configure authentication providers
   - Set up Firestore security rules

2. **Payment Integration:**

   - Integrate with Stripe or local payment gateways
   - Configure payment processing

3. **Testing:**

   - Extensive testing on physical devices
   - QR code scanning validation
   - Payment flow testing

4. **App Store Preparation:**
   - App icons and screenshots
   - Store listings and descriptions
   - Review and submission

## 🐛 Troubleshooting

### Common Issues

**Firebase not connecting:**

- Verify `google-services.json` and `GoogleService-Info.plist` are correctly placed
- Check Firebase project configuration

**QR Scanner not working:**

- Ensure camera permissions are granted
- Test on physical device (camera doesn't work in simulator)

**API connection failed:**

- Verify Express API is running and accessible
- Check `baseUrl` in `api_service.dart`
- Ensure CORS is configured for mobile app

## 📞 Support

For technical support or questions about the mobile app integration, refer to the main project documentation or contact the development team.

---

**Target Timeline:** Ready for tomorrow's release with core MVP features!
