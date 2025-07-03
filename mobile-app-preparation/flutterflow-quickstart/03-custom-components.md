# Fayeed Auto Care - FlutterFlow Custom Components

## 🧩 Reusable Components Library

This guide provides detailed specifications for creating custom components in FlutterFlow that match your Fayeed Auto Care design system.

## 📝 1. FACButton (Primary Button Component)

### Component Setup

- **Component Name**: FACButton
- **Category**: Form Elements
- **Description**: Branded button with multiple styles and loading states

### Parameters

```
buttonText (String, Required)
- Description: Text to display on button
- Default: "Button"

buttonType (String, Required)
- Description: Button style variant
- Options: "primary", "secondary", "outline", "text"
- Default: "primary"

buttonSize (String, Optional)
- Description: Button size variant
- Options: "small", "medium", "large"
- Default: "medium"

onPressed (Action, Required)
- Description: Action to execute when tapped
- Type: Action

isLoading (Boolean, Optional)
- Description: Show loading spinner
- Default: false

isDisabled (Boolean, Optional)
- Description: Disable button interaction
- Default: false

iconData (Widget, Optional)
- Description: Leading icon
- Type: Icon

fullWidth (Boolean, Optional)
- Description: Expand to full width
- Default: false
```

### Widget Structure

```
Container
├── Width: fullWidth ? double.infinity : null
├── Height: buttonSize == "small" ? 40 : (buttonSize == "large" ? 56 : 48)
├── Decoration: BoxDecoration
│   ├── BorderRadius: 8px
│   ├── Color: getButtonColor()
│   ├── Border: buttonType == "outline" ? Border.all() : null
│   └── BoxShadow: buttonType == "primary" ? elevation : null
└── Material
    └── InkWell
        ├── BorderRadius: 8px
        ├── OnTap: isDisabled || isLoading ? null : onPressed
        └── Container (Padding based on size)
            └── Row (MainAxisSize: min, Center alignment)
                ├── If (isLoading)
                │   └── SizedBox (16x16)
                │       └── CircularProgressIndicator
                │           ├── StrokeWidth: 2
                │           └── Color: getTextColor()
                ├── Else If (iconData != null)
                │   ├── iconData
                │   └── SizedBox (Width: 8)
                └── Text (buttonText)
                    ├── Style: getTextStyle()
                    └── Color: getTextColor()
```

### Custom Functions

```dart
// Add these as Custom Functions in FlutterFlow

Color getButtonColor(String buttonType, bool isDisabled) {
  if (isDisabled) return Colors.grey.shade300;

  switch (buttonType) {
    case 'primary':
      return Color(0xFFFF6B35); // FAC Orange
    case 'secondary':
      return Color(0xFF6C5CE7); // Purple
    case 'outline':
      return Colors.transparent;
    case 'text':
      return Colors.transparent;
    default:
      return Color(0xFFFF6B35);
  }
}

Color getTextColor(String buttonType, bool isDisabled) {
  if (isDisabled) return Colors.grey.shade600;

  switch (buttonType) {
    case 'primary':
    case 'secondary':
      return Colors.white;
    case 'outline':
    case 'text':
      return Color(0xFFFF6B35);
    default:
      return Colors.white;
  }
}

TextStyle getTextStyle(String buttonSize) {
  switch (buttonSize) {
    case 'small':
      return TextStyle(fontSize: 12, fontWeight: FontWeight.w600);
    case 'large':
      return TextStyle(fontSize: 18, fontWeight: FontWeight.w600);
    default:
      return TextStyle(fontSize: 14, fontWeight: FontWeight.w600);
  }
}
```

## 📱 2. FACTextField (Input Field Component)

### Component Setup

- **Component Name**: FACTextField
- **Category**: Form Elements
- **Description**: Branded text input with validation and icons

### Parameters

```
labelText (String, Required)
- Description: Field label
- Default: "Label"

hintText (String, Optional)
- Description: Placeholder text
- Default: ""

isRequired (Boolean, Optional)
- Description: Show required indicator
- Default: false

inputType (String, Required)
- Description: Input type for validation
- Options: "text", "email", "password", "phone", "number"
- Default: "text"

controller (TextEditingController, Required)
- Description: Text controller
- Type: TextEditingController

leadingIcon (Widget, Optional)
- Description: Icon on the left
- Type: Icon

errorText (String, Optional)
- Description: Error message to display
- Default: ""

maxLines (Integer, Optional)
- Description: Maximum lines for text area
- Default: 1

isEnabled (Boolean, Optional)
- Description: Enable/disable input
- Default: true
```

### Widget Structure

```
Column (CrossAxisAlignment: start)
├── If (labelText.isNotEmpty)
│   ├── Row
│   │   ├── Text (labelText)
│   │   │   ├── Style: Body Medium, FontWeight: 600
│   │   │   └── Color: Text Primary
│   │   └── If (isRequired)
│   │       └── Text (" *")
│   │           └── Color: Error
│   └── SizedBox (Height: 8)
├── Container
│   ├── Decoration: BoxDecoration
│   │   ├── Border: Border.all(color: getBorderColor())
│   │   ├── BorderRadius: 8px
│   │   └── Color: Background
│   └── TextField
│       ├── Controller: controller
│       ├── Decoration: InputDecoration
│       │   ├─��� HintText: hintText
│       │   ├── HintStyle: Body Medium, Color: Text Secondary
│       │   ├── PrefixIcon: leadingIcon
│       │   ├── SuffixIcon: getSuffixIcon()
│       │   ├── Border: InputBorder.none
│       │   ├── ContentPadding: 16px all
│       │   └── ErrorText: null
│       ├── KeyboardType: getKeyboardType()
│       ├── ObscureText: inputType == "password"
│       ├── MaxLines: maxLines
│       ├── Enabled: isEnabled
│       └── Style: Body Medium
└── If (errorText.isNotEmpty)
    ├── SizedBox (Height: 4)
    └── Text (errorText)
        ├── Style: Caption
        └── Color: Error
```

### Custom Functions

```dart
Color getBorderColor(String errorText, bool isFocused) {
  if (errorText.isNotEmpty) return Color(0xFFEF4444); // Error
  if (isFocused) return Color(0xFFFF6B35); // Primary
  return Color(0xFFE5E7EB); // Border
}

TextInputType getKeyboardType(String inputType) {
  switch (inputType) {
    case 'email':
      return TextInputType.emailAddress;
    case 'phone':
      return TextInputType.phone;
    case 'number':
      return TextInputType.number;
    default:
      return TextInputType.text;
  }
}

Widget? getSuffixIcon(String inputType, bool obscureText, VoidCallback? toggleObscure) {
  if (inputType == 'password') {
    return IconButton(
      icon: Icon(obscureText ? Icons.visibility : Icons.visibility_off),
      onPressed: toggleObscure,
    );
  }
  return null;
}
```

## 🎴 3. ServiceCard (Service Selection Component)

### Component Setup

- **Component Name**: ServiceCard
- **Category**: Display
- **Description**: Card for displaying service options

### Parameters

```
serviceTitle (String, Required)
- Description: Service name
- Default: "Service"

serviceDescription (String, Required)
- Description: Service description
- Default: "Description"

servicePrice (String, Required)
- Description: Price display
- Default: "₱0"

serviceDuration (String, Optional)
- Description: Estimated duration
- Default: ""

serviceIcon (Widget, Required)
- Description: Service icon
- Type: Icon

isSelected (Boolean, Optional)
- Description: Selection state
- Default: false

onTap (Action, Required)
- Description: Selection action
- Type: Action

showBadge (Boolean, Optional)
- Description: Show popular/recommended badge
- Default: false

badgeText (String, Optional)
- Description: Badge text
- Default: "Popular"
```

### Widget Structure

```
Container
├── Margin: EdgeInsets.only(bottom: 12)
├── Decoration: BoxDecoration
│   ├── Border: Border.all(
│   │     color: isSelected ? Primary : Border,
│   │     width: isSelected ? 2 : 1
│   │   )
│   ├── BorderRadius: 12px
│   ├── Color: isSelected ? Primary/10 : Surface
│   └── BoxShadow: isSelected ? elevation : subtle elevation
└── Material
    └── InkWell
        ├── BorderRadius: 12px
        ├── OnTap: onTap
        └── Container (Padding: 16)
            └── Stack
                ├── Row
                │   ├── Container (Icon container)
                │   │   ├── Width: 56, Height: 56
                │   │   ├── Decoration: Circle
                │   │   │   └── Color: getServiceColor()/20
                │   │   └── serviceIcon
                │   │       ├── Size: 28
                │   │       └── Color: getServiceColor()
                │   ├── SizedBox (Width: 16)
                │   ├── Expanded
                │   │   └── Column (CrossAxisAlignment: start)
                │   │       ├── Text (serviceTitle)
                │   │       │   ├── Style: Title Medium
                │   │       │   ├── Color: Text Primary
                │   │       │   └── FontWeight: 600
                │   │       ├── SizedBox (Height: 4)
                │   │       ├── Text (serviceDescription)
                │   │       │   ├── Style: Body Small
                │   │       │   ├── Color: Text Secondary
                │   │       │   └── MaxLines: 2
                │   │       ├── If (serviceDuration.isNotEmpty)
                │   │       │   ├── SizedBox (Height: 8)
                │   │       │   └── Row
                │   │       │       ├── Icon (Clock, size: 16)
                │   │       │       │   └── Color: Primary
                │   │       │       ├── SizedBox (Width: 4)
                │   │       │       └── Text (serviceDuration)
                │   │       │           ├── Style: Caption
                │   │       │           └── Color: Primary
                │   │       └── SizedBox (Height: 8)
                │   └── Column
                │       ├── Text (servicePrice)
                │       │   ├── Style: Title Medium
                │       │   ├── Color: Primary
                │       │   └── FontWeight: Bold
                │       ├── SizedBox (Height: 8)
                │       └── Radio Button
                │           ├── Value: serviceTitle
                │           ├── GroupValue: selectedService
                │           ├── ActiveColor: Primary
                │           └── OnChanged: onTap
                └── If (showBadge)
                    └── Positioned (Top: 0, Right: 0)
                        └── Container
                            ├── Padding: 6px horizontal, 4px vertical
                            ├── Decoration: Rounded (8px)
                            │   └── Color: Warning
                            └── Text (badgeText)
                                ├── Style: Caption
                                ├── Color: White
                                └── FontWeight: Bold
```

## 📊 4. MembershipCard (Dashboard Component)

### Component Setup

- **Component Name**: MembershipCard
- **Category**: Display
- **Description**: Membership status and usage display

### Parameters

```
membershipType (String, Required)
- Description: Membership tier
- Options: "regular", "classic", "vip_silver", "vip_gold"
- Default: "regular"

membershipStatus (String, Required)
- Description: Membership status
- Options: "active", "expired", "pending"
- Default: "active"

remainingWashes (Integer, Required)
- Description: Remaining wash count
- Default: 0

totalWashes (Integer, Required)
- Description: Total washes in package
- Default: 0

expiryDate (String, Required)
- Description: Membership expiry
- Default: ""

onUpgrade (Action, Optional)
- Description: Upgrade action
- Type: Action

onRenew (Action, Optional)
- Description: Renew action
- Type: Action
```

### Widget Structure

```
Container
├── Margin: 16px horizontal
├── Decoration: BoxDecoration
│   ├── Gradient: LinearGradient (getMembershipGradient())
│   ├── BorderRadius: 16px
│   └── BoxShadow: Elevation 4
└── Container (Padding: 20)
    └── Column
        ├── Row
        │   ├── Column (CrossAxisAlignment: start)
        │   │   ├── Text (getMembershipDisplayName())
        │   │   │   ├── Style: Title Large
        │   │   │   ├── Color: White
        │   │   │   └── FontWeight: Bold
        │   │   ├── SizedBox (Height: 4)
        │   │   ├── Text ("Active until $expiryDate")
        │   │   │   ├── Style: Body Small
        │   │   │   └── Color: White/80
        │   │   └── SizedBox (Height: 16)
        │   ├── Spacer
        │   └── Icon (getMembershipIcon())
        │       ├── Size: 32
        │       └── Color: White
        ├── If (totalWashes > 0)
        │   ├── LinearProgressIndicator
        │   │   ├── Value: remainingWashes / totalWashes
        │   │   ├── BackgroundColor: White/30
        │   │   ├── ValueColor: White
        │   │   └── MinHeight: 6
        │   ├── SizedBox (Height: 8)
        │   ├── Row
        │   │   ├── Text ("$remainingWashes washes remaining")
        │   │   │   ├── Style: Body Small
        │   │   │   └── Color: White/90
        │   │   ├── Spacer
        │   │   └── Text ("$totalWashes total")
        │   │       ├── Style: Body Small
        │   │       └── Color: White/70
        │   └── SizedBox (Height: 16)
        └── Row
            ├── If (membershipType != "vip_gold")
            │   └── Expanded
            │       └── FACButton
            │           ├── Text: "Upgrade"
            │           ├── Type: "outline"
            │           ├── TextColor: White
            │           ├── BorderColor: White
            │           └── OnPressed: onUpgrade
            ├── If (membershipType != "vip_gold")
            │   └── SizedBox (Width: 12)
            └���─ Expanded
                └── FACButton
                    ├── Text: "Renew"
                    ├── Type: "primary"
                    ├── BackgroundColor: White
                    ├── TextColor: getPrimaryColor()
                    └── OnPressed: onRenew
```

### Custom Functions

```dart
List<Color> getMembershipGradient(String membershipType) {
  switch (membershipType) {
    case 'regular':
      return [Color(0xFF6B7280), Color(0xFF4B5563)];
    case 'classic':
      return [Color(0xFF3B82F6), Color(0xFF1D4ED8)];
    case 'vip_silver':
      return [Color(0xFF9CA3AF), Color(0xFF6B7280)];
    case 'vip_gold':
      return [Color(0xFFF59E0B), Color(0xFFD97706)];
    default:
      return [Color(0xFF6B7280), Color(0xFF4B5563)];
  }
}

String getMembershipDisplayName(String membershipType) {
  switch (membershipType) {
    case 'regular':
      return 'Regular Member';
    case 'classic':
      return 'Classic Pro';
    case 'vip_silver':
      return 'VIP Silver Elite';
    case 'vip_gold':
      return 'VIP Gold Ultimate';
    default:
      return 'Member';
  }
}

IconData getMembershipIcon(String membershipType) {
  switch (membershipType) {
    case 'regular':
      return Icons.person;
    case 'classic':
      return Icons.star;
    case 'vip_silver':
      return Icons.diamond;
    case 'vip_gold':
      return Icons.workspace_premium;
    default:
      return Icons.person;
  }
}
```

## 🔍 5. QRScannerOverlay (Camera Overlay Component)

### Component Setup

- **Component Name**: QRScannerOverlay
- **Category**: Camera
- **Description**: QR scanner camera overlay with frame

### Parameters

```
scanAreaSize (Double, Optional)
- Description: Size of scan area
- Default: 250.0

borderColor (Color, Optional)
- Description: Border color
- Default: Primary

borderWidth (Double, Optional)
- Description: Border thickness
- Default: 3.0

borderRadius (Double, Optional)
- Description: Corner radius
- Default: 12.0

overlayColor (Color, Optional)
- Description: Overlay background
- Default: Black/60
```

### Widget Structure

```
Stack
├── Container (Full screen overlay)
│   └── CustomPaint
│       └── QRScannerPainter
│           ├── scanAreaSize: scanAreaSize
│           ├── borderColor: borderColor
│           ���── borderWidth: borderWidth
│           ├── borderRadius: borderRadius
│           └── overlayColor: overlayColor
├── Positioned (Center)
│   └── Container
│       ├── Width: scanAreaSize
│       ├── Height: scanAreaSize
│       └── Decoration: BoxDecoration
│           ├── Border: Border.all(color: borderColor, width: borderWidth)
│           └── BorderRadius: borderRadius
└── Positioned (Bottom of scan area + 20)
    └── Center
        └── Container
            ├── Padding: 12px horizontal, 8px vertical
            ├── Decoration: Rounded rectangle (8px)
            │   └── Color: Black/70
            └── Text ("Align QR code within frame")
                ├── Style: Body Small
                ├── Color: White
                └── TextAlign: Center
```

### Custom Painter Class

```dart
class QRScannerPainter extends CustomPainter {
  final double scanAreaSize;
  final Color borderColor;
  final double borderWidth;
  final double borderRadius;
  final Color overlayColor;

  QRScannerPainter({
    required this.scanAreaSize,
    required this.borderColor,
    required this.borderWidth,
    required this.borderRadius,
    required this.overlayColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = overlayColor;

    // Draw overlay with cutout
    final path = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height));

    final cutoutRect = Rect.fromCenter(
      center: size.center(Offset.zero),
      width: scanAreaSize,
      height: scanAreaSize,
    );

    final cutoutPath = Path()
      ..addRRect(RRect.fromRectAndRadius(cutoutRect, Radius.circular(borderRadius)));

    final overlayPath = Path.combine(PathOperation.difference, path, cutoutPath);
    canvas.drawPath(overlayPath, paint);

    // Draw corner brackets
    final cornerPaint = Paint()
      ..color = borderColor
      ..strokeWidth = borderWidth
      ..style = PaintingStyle.stroke;

    final cornerLength = 20.0;

    // Top-left corner
    canvas.drawPath(
      Path()
        ..moveTo(cutoutRect.left, cutoutRect.top + cornerLength)
        ..lineTo(cutoutRect.left, cutoutRect.top + borderRadius)
        ..arcToPoint(
          Offset(cutoutRect.left + borderRadius, cutoutRect.top),
          radius: Radius.circular(borderRadius),
        )
        ..lineTo(cutoutRect.left + cornerLength, cutoutRect.top),
      cornerPaint,
    );

    // Repeat for other corners...
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
```

## 📱 6. NotificationBadge (Badge Component)

### Component Setup

- **Component Name**: NotificationBadge
- **Category**: Display
- **Description**: Notification count badge

### Parameters

```
count (Integer, Required)
- Description: Notification count
- Default: 0

maxCount (Integer, Optional)
- Description: Maximum count to display
- Default: 99

showZero (Boolean, Optional)
- Description: Show badge when count is 0
- Default: false

backgroundColor (Color, Optional)
- Description: Badge background color
- Default: Error

textColor (Color, Optional)
- Description: Badge text color
- Default: White

size (String, Optional)
- Description: Badge size
- Options: "small", "medium", "large"
- Default: "medium"
```

### Widget Structure

```
If (count > 0 || showZero)
└── Container
    ├── Padding: getPadding()
    ├── Decoration: BoxDecoration
    │   ├── Color: backgroundColor
    │   ├── BorderRadius: getBorderRadius()
    │   └── BoxShadow: subtle elevation
    └── Text (getDisplayText())
        ├── Style: getTextStyle()
        ├── Color: textColor
        └── TextAlign: Center
```

### Custom Functions

```dart
EdgeInsets getPadding(String size) {
  switch (size) {
    case 'small':
      return EdgeInsets.symmetric(horizontal: 4, vertical: 2);
    case 'large':
      return EdgeInsets.symmetric(horizontal: 8, vertical: 4);
    default:
      return EdgeInsets.symmetric(horizontal: 6, vertical: 3);
  }
}

BorderRadius getBorderRadius(String size) {
  switch (size) {
    case 'small':
      return BorderRadius.circular(8);
    case 'large':
      return BorderRadius.circular(12);
    default:
      return BorderRadius.circular(10);
  }
}

String getDisplayText(int count, int maxCount) {
  if (count <= maxCount) {
    return count.toString();
  } else {
    return '${maxCount}+';
  }
}

TextStyle getTextStyle(String size) {
  switch (size) {
    case 'small':
      return TextStyle(fontSize: 10, fontWeight: FontWeight.bold);
    case 'large':
      return TextStyle(fontSize: 14, fontWeight: FontWeight.bold);
    default:
      return TextStyle(fontSize: 12, fontWeight: FontWeight.bold);
  }
}
```

These custom components provide a consistent design system across your FlutterFlow app and can be easily reused throughout different pages. Each component includes proper parameter handling, custom styling functions, and responsive design considerations.
