# Fayeed Auto Care - FlutterFlow Page Templates

## 📱 Page-by-Page Implementation Guide

This guide provides step-by-step instructions for building each page in FlutterFlow with exact widget configurations.

## 🚀 1. Splash Page

### Page Setup

- **Page Name**: SplashPage
- **Background Color**: Primary (#FF6B35)
- **Safe Area**: Enabled
- **App Bar**: Disabled

### Widget Structure

```
Column (Main Axis: Center, Cross Axis: Center)
├── Container (Logo Container)
│   ├── Width: 120, Height: 120
│   ├── Decoration: Circle with white background
│   └── Image (FAC Logo)
│       ├── Source: Assets
│       ├── Width: 80, Height: 80
│       └── Fit: Cover
├── SizedBox (Height: 30)
├── Text ("Fayeed Auto Care")
│   ├── Style: Headline Large
│   ├── Color: White
│   └── Font Weight: Bold
├── SizedBox (Height: 10)
├── Text ("Car Care. Redefined.")
│   ├── Style: Body Large
│   ├── Color: White (70% opacity)
│   └── Text Align: Center
├── SizedBox (Height: 50)
└── CircularProgressIndicator
    ├── Color: White
    └── Stroke Width: 3
```

### Page Logic

```
On Page Load:
1. Timer (3 seconds)
2. Check Authentication Status
3. Navigate based on state:
   - If authenticated → DashboardPage
   - If new user → OnboardingPage
   - Else → LoginPage
```

## 🎯 2. Onboarding Page

### Page Setup

- **Page Name**: OnboardingPage
- **Background**: Gradient (Primary to Secondary)
- **App Bar**: Disabled

### Widget Structure

```
Stack
├── PageView (3 screens)
│   ├── Screen 1: Welcome
│   ├── Screen 2: QR Features
│   └── Screen 3: Membership
└── Positioned (Bottom: 50)
    └── Row (Dots + Skip/Next)
        ├── PageViewIndicator
        └── TextButton ("Skip" / "Get Started")
```

#### Screen 1: Welcome

```
Column (Center alignment)
├── Lottie Animation (Car wash animation)
│   ├── Width: 300, Height: 300
│   └── Source: Assets/animations/welcome.json
├── Text ("Welcome to the Future")
│   ├── Style: Headline Large
│   ├── Color: White
│   └── Text Align: Center
├── SizedBox (Height: 20)
└── Text ("Experience seamless car care...")
    ├── Style: Body Large
    ├── Color: White (80% opacity)
    ├── Text Align: Center
    └── Max Lines: 3
```

#### Screen 2: QR Features

```
Column (Center alignment)
├── Container (QR Demo)
│   ├── Width: 200, Height: 200
│   ├── Decoration: Rounded rectangle with border
│   └── Icon (QrCode, size: 100)
├── Text ("Scan. Wash. Go.")
│   ├── Style: Headline Large
│   └── Color: White
├── SizedBox (Height: 20)
└── Text ("Simply scan QR codes...")
    ├── Style: Body Large
    ├── Color: White (80% opacity)
    └── Text Align: Center
```

## 🔐 3. Login Page

### Page Setup

- **Page Name**: LoginPage
- **Background**: Linear Gradient
- **Scroll**: SingleChildScrollView
- **Keyboard Padding**: Enabled

### Widget Structure

```
SingleChildScrollView
└── Container (Padding: 24)
    └── Column
        ├── SizedBox (Height: 100)
        ├── Text ("Welcome Back")
        │   ├── Style: Headline Large
        │   ├── Color: White
        │   └── Text Align: Center
        ├── SizedBox (Height: 10)
        ├── Text ("Sign in to continue")
        │   ├── Style: Body Large
        │   ├── Color: White (70% opacity)
        │   └── Text Align: Center
        ├── SizedBox (Height: 60)
        ├── Card (Login Form)
        │   ├── Margin: 0
        │   ├── Shape: RoundedRectangleBorder (16px)
        │   └── Child: LoginForm
        └── Row (Sign up link)
            ├── Text ("Don't have an account?")
            └── TextButton ("Sign Up")
```

#### Login Form Widget

```
Container (Padding: 24)
└── Column
    ├── FACTextField (Email)
    │   ├── Label: "Email Address"
    │   ├── Hint: "Enter your email"
    │   ├── Type: Email
    │   ├── Icon: Mail
    │   └── Controller: emailController
    ├── SizedBox (Height: 20)
    ├── FACTextField (Password)
    │   ├── Label: "Password"
    │   ├── Hint: "Enter your password"
    │   ├── Type: Password
    │   ├── Icon: Lock
    │   └── Controller: passwordController
    ├── SizedBox (Height: 10)
    ├── Align (Right)
    │   └── TextButton ("Forgot Password?")
    ├── SizedBox (Height: 30)
    ├── FACButton
    │   ├── Text: "Sign In"
    │   ├── Type: "primary"
    │   ├── Loading: isLoading
    │   └── Action: Login API Call
    ├── SizedBox (Height: 20)
    ├── Row (Divider with "OR")
    ├── SizedBox (Height: 20)
    └── OutlinedButton (Google Sign In)
        ├── Icon: Google logo
        ├── Text: "Continue with Google"
        └── Action: Google Sign In
```

### Login Logic

```
Actions:
1. Validate email format
2. Check password length (min 6)
3. Call login API
4. Save auth token
5. Update app state (currentUser, isAuthenticated)
6. Navigate to DashboardPage

Error Handling:
- Show SnackBar for errors
- Highlight invalid fields
- Clear form on repeated failures
```

## 📝 4. Registration Page

### Page Setup

- **Page Name**: RegisterPage
- **Background**: Linear Gradient
- **Stepper**: 3 steps
- **Form Validation**: Enabled

### Widget Structure

```
SingleChildScrollView
└── Container (Padding: 24)
    └── Column
        ├── Header (Back button + Progress)
        ├── Stepper Widget
        │   ├── Step 1: Personal Info
        │   ├── Step 2: Vehicle Info
        │   └── Step 3: Membership
        └── Navigation Buttons
            ├── Previous (if not first step)
            └── Next / Complete
```

#### Step 1: Personal Information

```
Card
└── Container (Padding: 24)
    └── Column
        ├── Text ("Personal Information")
        │   ├── Style: Title Large
        │   └── Color: Primary
        ├── SizedBox (Height: 24)
        ├── FACTextField (Full Name)
        ├── SizedBox (Height: 16)
        ├── FACTextField (Email)
        ├── SizedBox (Height: 16)
        ├── FACTextField (Phone)
        ├── SizedBox (Height: 16)
        ├── FACTextField (Address)
        ├── SizedBox (Height: 16)
        ├── FACTextField (Password)
        ├── SizedBox (Height: 16)
        └── FACTextField (Confirm Password)
```

#### Step 2: Vehicle Information

```
Card
└── Container (Padding: 24)
    └── Column
        ├── Text ("Vehicle Details")
        ├── SizedBox (Height: 24)
        ├── DropdownButtonFormField (Vehicle Type)
        │   ├── Items: Sedan, SUV, Hatchback, etc.
        │   └── Icon: Car
        ├── SizedBox (Height: 16)
        ├── FACTextField (Car Model)
        ├── SizedBox (Height: 16)
        ├── FACTextField (Plate Number)
        ├── SizedBox (Height: 16)
        └── DropdownButtonFormField (Branch)
            ├── Items: Tumaga Hub, Boalan Center
            └── Icon: MapPin
```

#### Step 3: Membership Selection

```
Card
└── Container (Padding: 24)
    └── Column
        ├── Text ("Choose Your Plan")
        ├── SizedBox (Height: 24)
        └── ListView (Membership Cards)
            ├── MembershipCard (Regular)
            ├── MembershipCard (Classic)
            ├── MembershipCard (VIP Silver)
            └── MembershipCard (VIP Gold)
```

#### Membership Card Widget

```
Container
├── Decoration: Border + BorderRadius
├── Padding: 16
└── Column
    ├── Row
    │   ├── Column (Plan details)
    │   │   ├── Text (Plan name)
    │   │   ├── Text (Price)
    │   │   └── Text (Description)
    │   └── Radio Button
    ├── SizedBox (Height: 12)
    └── Wrap (Feature chips)
        ├── Chip ("Feature 1")
        ├── Chip ("Feature 2")
        └── ...
```

## 🏠 5. Dashboard Page

### Page Setup

- **Page Name**: DashboardPage
- **App Bar**: Custom (StickyHeader)
- **Background**: Background color
- **Floating Action Button**: QR Scanner

### Widget Structure

```
Scaffold
├── StickyHeader (Custom App Bar)
├── Body: RefreshIndicator
│   └── SingleChildScrollView
│       └── Column
│           ├── WelcomeHeader
│           ├── MembershipCard
│           ├── QuickActions
│           ├── RecentActivity
│           └── StatsWidget
└── FloatingActionButton (QR Scanner)
    ├── Icon: QrCode
    ├── Background: Primary color
    └── Action: Navigate to QRScannerPage
```

#### Welcome Header Widget

```
Container (Padding: 24, Gradient background)
└── Row
    ├── Column (Greeting)
    │   ├── Text ("Good morning,")
    │   │   ├── Style: Body Large
    │   │   └── Color: White (70% opacity)
    │   ├── Text ("{userName}!")
    │   │   ├── Style: Headline Medium
    │   │   ├── Color: White
    │   │   └── Font Weight: Bold
    │   └── Text ("Ready for your next wash? ✨")
    │       ├── Style: Body Medium
    │       └── Color: White (80% opacity)
    └── CircleAvatar (Profile image)
        ├── Radius: 25
        ├── Background: White
        └── Image: Profile photo
```

#### Membership Card Widget

```
Container (Margin: 24, 16, 24, 0)
└── Card
    ├── Shape: RoundedRectangleBorder (16px)
    ├── Elevation: 4
    └── Container (Padding: 20)
        └── Column
            ├── Row
            │   ├── Column (Membership info)
            │   │   ├── Text ("VIP Gold Ultimate")
            │   │   │   ├── Style: Title Large
            │   │   │   └── Color: Primary
            │   │   ├── Text ("Active until Dec 31, 2024")
            │   │   │   ├── Style: Body Small
            │   │   │   └── Color: Text Secondary
            │   │   └── SizedBox (Height: 8)
            │   └── Icon (Crown)
            │       ├── Size: 32
            │       └── Color: Warning (Gold)
            ├── SizedBox (Height: 16)
            ├── LinearProgressIndicator
            │   ├── Value: 0.6 (remaining washes / total)
            │   ├── Background: Background
            │   └── Color: Primary
            ├── SizedBox (Height: 8)
            ├── Row
            │   ├── Text ("3 washes remaining")
            │   │   ├── Style: Body Small
            │   │   └── Color: Text Secondary
            │   └── Spacer
            │   └── TextButton ("Upgrade")
            │       └── Action: Navigate to subscription
```

#### Quick Actions Widget

```
Container (Padding: 24, 16)
└── Column
    ├── Text ("Quick Actions")
    │   ├── Style: Title Large
    │   └── Color: Text Primary
    ├── SizedBox (Height: 16)
    └── GridView (2 columns, 2 rows)
        ├── ActionCard ("Book Service")
        │   ├── Icon: Calendar
        │   ├── Color: Info
        │   └── Action: Navigate to BookingPage
        ├── ActionCard ("QR Scanner")
        │   ├── Icon: QrCode
        │   ├── Color: Primary
        │   └── Action: Navigate to QRScannerPage
        ├── ActionCard ("Service History")
        │   ├── Icon: History
        │   ├── Color: Success
        │   └── Action: Navigate to HistoryPage
        └── ActionCard ("Vouchers")
            ├── Icon: Gift
            ├── Color: Warning
            └── Action: Navigate to VoucherPage
```

#### Action Card Widget

```
Card
├── Shape: RoundedRectangleBorder (12px)
├── Elevation: 2
└── InkWell (Tap handling)
    └── Container (Padding: 16)
        └── Column (Center alignment)
            ├── Container (Icon container)
            │   ├── Width: 48, Height: 48
            │   ├���─ Decoration: Circle with color/10 opacity
            │   └── Icon
            │       ├── Size: 24
            │       └── Color: Action color
            ├── SizedBox (Height: 12)
            └── Text (Action name)
                ├── Style: Label Large
                ├── Color: Text Primary
                └── Text Align: Center
```

## 📱 6. QR Scanner Page

### Page Setup

- **Page Name**: QRScannerPage
- **Background**: Black
- **Full Screen**: True
- **Camera Permission**: Required

### Widget Structure

```
Stack
├── QRView (Camera widget)
│   ├── Key: GlobalKey
│   ├── onQRViewCreated: Controller setup
│   └── overlay: QRScannerOverlayShape
├── Positioned (Top: 50)
│   └── SafeArea
│       └── Row
│           ├── IconButton (Back)
│           │   ├── Icon: ArrowBack
│           │   ├── Color: White
│           │   └── Action: Navigator.pop
│           ├── Spacer
│           └── IconButton (Flash toggle)
│               ├── Icon: Flash
│               ├── Color: White
│               └── Action: Toggle flash
├── Positioned (Bottom: 100)
│   └── Center
│       └── Container
│           ├── Padding: 16
│           ├── Decoration: Rounded with white background
│           └── Column
│               ├── Icon (QrCode)
│               │   ├── Size: 32
│               │   └── Color: Primary
│               ├── SizedBox (Height: 8)
│               ├── Text ("Align QR code within frame")
│               │   ├── Style: Body Medium
│               │   ├── Color: Text Primary
│               │   └── Text Align: Center
│               └── TextButton ("Enter manually")
│                   └── Action: Show manual entry dialog
└── Positioned (Bottom: 30)
    └── Center
        └── FACButton
            ├── Text: "Manual Entry"
            ├── Type: "outline"
            └── Action: Show input dialog
```

### QR Scanner Logic

```
Controller Setup:
1. Initialize QR controller
2. Listen for QR code detection
3. Process scanned data
4. Show success feedback
5. Navigate based on QR type

QR Processing:
1. Parse QR data format
2. Validate QR code type
3. Check user permissions
4. Update user state
5. Show confirmation dialog
6. Navigate to appropriate page

Error Handling:
- Permission denied → Show settings dialog
- Invalid QR code → Show error message
- Network error → Show retry option
- Location required → Request permission
```

## 📅 7. Booking Page

### Page Setup

- **Page Name**: BookingPage
- **App Bar**: Custom with back button
- **Stepper**: 4 steps
- **Form Validation**: Enabled

### Widget Structure

```
Scaffold
├── AppBar ("Book Service")
└── Body: Stepper
    ├── Step 1: Service Selection
    ├── Step 2: Date & Time
    ├── Step 3: Vehicle & Branch
    └── Step 4: Confirmation
```

#### Step 1: Service Selection

```
Container (Padding: 16)
└── Column
    ├── Text ("Choose Service")
    │   ├── Style: Title Large
    │   └── Color: Primary
    ├── SizedBox (Height: 16)
    └── ListView
        ├── ServiceCard ("Quick Wash")
        ├── ServiceCard ("Classic Wash")
        ├── ServiceCard ("Premium Wash")
        └── ServiceCard ("Detailing")
```

#### Service Card Widget

```
Card
├── Margin: EdgeInsets.only(bottom: 12)
├── Shape: RoundedRectangleBorder (12px)
└── InkWell
    └── Container (Padding: 16)
        └── Row
            ├── Container (Service icon)
            │   ├── Width: 60, Height: 60
            │   ├── Decoration: Circle with service color
            │   └── Icon (Service type)
            ├── SizedBox (Width: 16)
            ├── Expanded
            │   └── Column (Cross: Start)
            │       ├── Text (Service name)
            │       │   ├── Style: Title Medium
            │       │   └── Color: Text Primary
            │       ├── Text (Description)
            │       │   ├── Style: Body Small
            │       │   ├── Color: Text Secondary
            │       │   └── Max Lines: 2
            │       ├── SizedBox (Height: 4)
            │       ├── Text (Duration)
            │       │   ├── Style: Caption
            │       │   └── Color: Primary
            │       └── SizedBox (Height: 8)
            └── Column
                ├── Text (Price)
                │   ├── Style: Title Medium
                │   ├── Color: Primary
                │   └── Font Weight: Bold
                └── Radio Button
                    ├── Value: Service ID
                    ├── Group Value: Selected service
                    └── Action: Update selection
```

## 👤 8. Profile Page

### Page Setup

- **Page Name**: ProfilePage
- **App Bar**: Custom with back button
- **Scroll**: SingleChildScrollView
- **Edit Mode**: Toggle between view/edit

### Widget Structure

```
Scaffold
├── AppBar ("Profile")
└── Body: SingleChildScrollView
    └── Column
        ├── ProfileHeader
        ├── PersonalInfoSection
        ├── VehicleSection
        ├── MembershipSection
        ├── SettingsSection
        └── LogoutButton
```

#### Profile Header Widget

```
Container
├── Padding: 24
├── Decoration: Gradient background
└── Column (Center alignment)
    ├── Stack
    │   ├── CircleAvatar
    │   │   ├── Radius: 50
    │   │   ├── Background: White
    │   │   └── Image: Profile photo
    ���   └── Positioned (Bottom right)
    │       └── CircleAvatar (Edit button)
    │           ├── Radius: 18
    │           ├── Background: Primary
    │           └── Icon (Edit)
    │               ├── Size: 18
    │               └── Color: White
    ├── SizedBox (Height: 16)
    ├── Text (User name)
    │   ├── Style: Headline Medium
    │   ├── Color: White
    │   └── Font Weight: Bold
    ├── Text (Email)
    │   ├── Style: Body Medium
    │   ├── Color: White (80% opacity)
    │   └── Text Align: Center
    └── SizedBox (Height: 8)
    └── Chip (Membership tier)
        ├── Label: "VIP Gold Member"
        ├── Background: Warning/20
        ├── Label Color: Warning
        └── Avatar: Crown icon
```

This template structure provides the foundation for building a professional-quality mobile app in FlutterFlow. Each widget is configured with specific properties and actions that mirror your current web application's functionality.
