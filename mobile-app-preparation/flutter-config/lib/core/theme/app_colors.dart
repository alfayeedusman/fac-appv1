import 'package:flutter/material.dart';

class AppColors {
  // Brand Colors
  static const Color primary = Color(0xFFFF6B35); // FAC Orange
  static const Color primaryLight = Color(0xFFFF8A65);
  static const Color primaryDark = Color(0xFFE64A19);
  
  static const Color secondary = Color(0xFF6C5CE7); // Purple
  static const Color secondaryLight = Color(0xFF9C88FF);
  static const Color secondaryDark = Color(0xFF5A67D8);
  
  static const Color accent = Color(0xFF00D4AA); // Teal
  static const Color accentLight = Color(0xFF4ECCA3);
  static const Color accentDark = Color(0xFF00A693);
  
  // Neutral Colors
  static const Color background = Color(0xFFF8F9FA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF5F5F5);
  
  // Text Colors
  static const Color textPrimary = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textTertiary = Color(0xFF9CA3AF);
  static const Color textDisabled = Color(0xFFD1D5DB);
  
  // State Colors
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFF34D399);
  static const Color successDark = Color(0xFF059669);
  
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFBBF24);
  static const Color warningDark = Color(0xFFD97706);
  
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFF87171);
  static const Color errorDark = Color(0xFFDC2626);
  
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFF60A5FA);
  static const Color infoDark = Color(0xFF2563EB);
  
  // Border and Divider Colors
  static const Color border = Color(0xFFE5E7EB);
  static const Color divider = Color(0xFFF3F4F6);
  
  // Input Colors
  static const Color inputBackground = Color(0xFFFAFAFA);
  static const Color inputBorder = Color(0xFFE5E7EB);
  static const Color inputFocused = primary;
  
  // Shadow Colors
  static const Color shadow = Color(0x1A000000);
  static const Color shadowLight = Color(0x0D000000);
  static const Color shadowDark = Color(0x26000000);
  
  // QR Scanner Colors
  static const Color qrScannerOverlay = Color(0x80000000);
  static const Color qrScannerFrame = primary;
  static const Color qrScannerCorner = accent;
  
  // Booking Status Colors
  static const Color bookingPending = warning;
  static const Color bookingConfirmed = info;
  static const Color bookingInProgress = accent;
  static const Color bookingCompleted = success;
  static const Color bookingCancelled = error;
  
  // Membership Colors
  static const Color membershipRegular = Color(0xFF6B7280);
  static const Color membershipClassic = Color(0xFF3B82F6);
  static const Color membershipSilver = Color(0xFF9CA3AF);
  static const Color membershipGold = Color(0xFFF59E0B);
  
  // Dark Theme Colors
  static const Color darkBackground = Color(0xFF121212);
  static const Color darkSurface = Color(0xFF1E1E1E);
  static const Color darkSurfaceVariant = Color(0xFF2C2C2C);
  
  static const Color darkTextPrimary = Color(0xFFFFFFFF);
  static const Color darkTextSecondary = Color(0xFFB3B3B3);
  static const Color darkTextTertiary = Color(0xFF999999);
  
  static const Color darkBorder = Color(0xFF333333);
  static const Color darkDivider = Color(0xFF2C2C2C);
  
  // Gradient Colors
  static const List<Color> primaryGradient = [primary, primaryDark];
  static const List<Color> secondaryGradient = [secondary, secondaryDark];
  static const List<Color> accentGradient = [accent, accentDark];
  static const List<Color> successGradient = [success, successDark];
  
  // Vehicle Type Colors
  static const Color vehicleSedan = Color(0xFF3B82F6);
  static const Color vehicleSUV = Color(0xFF10B981);
  static const Color vehicleHatchback = Color(0xFFF59E0B);
  static const Color vehiclePickup = Color(0xFF8B5CF6);
  static const Color vehicleVan = Color(0xFFEF4444);
  static const Color vehicleMotorcycle = Color(0xFF06B6D4);
  
  // Service Type Colors
  static const Color serviceExterior = Color(0xFF3B82F6);
  static const Color serviceInterior = Color(0xFF10B981);
  static const Color servicePremium = Color(0xFFF59E0B);
  static const Color serviceDetailing = Color(0xFF8B5CF6);
  
  // Rating Colors
  static const Color ratingExcellent = success;
  static const Color ratingGood = accent;
  static const Color ratingAverage = warning;
  static const Color ratingPoor = error;
  
  // Notification Colors
  static const Color notificationPromotion = primary;
  static const Color notificationReminder = info;
  static const Color notificationAlert = warning;
  static const Color notificationSystem = secondary;
}
