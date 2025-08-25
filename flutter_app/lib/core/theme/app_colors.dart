import 'package:flutter/material.dart';

class AppColors {
  // Fayeed Auto Care Brand Colors (matching React app)
  static const Color facOrange50 = Color(0xFFFFF7ED);
  static const Color facOrange100 = Color(0xFFFFEDD5);
  static const Color facOrange200 = Color(0xFFFED7AA);
  static const Color facOrange300 = Color(0xFFFDBA74);
  static const Color facOrange400 = Color(0xFFFB923C);
  static const Color facOrange500 = Color(0xFFF97316); // Primary Brand Color
  static const Color facOrange600 = Color(0xFFEA580C);
  static const Color facOrange700 = Color(0xFFC2410C);
  static const Color facOrange800 = Color(0xFF9A3412);
  static const Color facOrange900 = Color(0xFF7C2D12);

  // Fayeed Auto Care Blue Colors
  static const Color facBlue50 = Color(0xFFEFF6FF);
  static const Color facBlue100 = Color(0xFFDBEAFE);
  static const Color facBlue200 = Color(0xFFBFDBFE);
  static const Color facBlue300 = Color(0xFF93C5FD);
  static const Color facBlue400 = Color(0xFF60A5FA);
  static const Color facBlue500 = Color(0xFF3B82F6);
  static const Color facBlue600 = Color(0xFF2563EB);
  static const Color facBlue700 = Color(0xFF1D4ED8);
  static const Color facBlue800 = Color(0xFF1E40AF);
  static const Color facBlue900 = Color(0xFF1E3A8A);

  // Fayeed Auto Care Gold Colors
  static const Color facGold50 = Color(0xFFFFFBEB);
  static const Color facGold100 = Color(0xFFFEF3C7);
  static const Color facGold200 = Color(0xFFFDE68A);
  static const Color facGold300 = Color(0xFFFCD34D);
  static const Color facGold400 = Color(0xFFFBBF24);
  static const Color facGold500 = Color(0xFFF59E0B);
  static const Color facGold600 = Color(0xFFD97706);
  static const Color facGold700 = Color(0xFFB45309);
  static const Color facGold800 = Color(0xFF92400E);
  static const Color facGold900 = Color(0xFF78350F);

  // System Colors
  static const Color background = Color(0xFFFFFFFF);
  static const Color backgroundDark = Color(0xFF1F2937);
  static const Color surface = Color(0xFFF9FAFB);
  static const Color surfaceDark = Color(0xFF374151);
  
  static const Color foreground = Color(0xFF111827);
  static const Color foregroundDark = Color(0xFFF9FAFB);
  
  static const Color muted = Color(0xFFF3F4F6);
  static const Color mutedDark = Color(0xFF4B5563);
  static const Color mutedForeground = Color(0xFF6B7280);
  static const Color mutedForegroundDark = Color(0xFFD1D5DB);
  
  static const Color border = Color(0xFFE5E7EB);
  static const Color borderDark = Color(0xFF6B7280);
  
  static const Color input = Color(0xFFE5E7EB);
  static const Color inputDark = Color(0xFF6B7280);
  
  static const Color primary = facOrange500;
  static const Color primaryForeground = Color(0xFFFFFFFF);
  
  static const Color secondary = Color(0xFFF3F4F6);
  static const Color secondaryDark = Color(0xFF4B5563);
  static const Color secondaryForeground = Color(0xFF111827);
  static const Color secondaryForegroundDark = Color(0xFFF9FAFB);
  
  static const Color destructive = Color(0xFFEF4444);
  static const Color destructiveForeground = Color(0xFFFFFFFF);
  
  static const Color success = Color(0xFF10B981);
  static const Color successForeground = Color(0xFFFFFFFF);
  
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningForeground = Color(0xFFFFFFFF);
  
  static const Color info = Color(0xFF3B82F6);
  static const Color infoForeground = Color(0xFFFFFFFF);

  // Gradients
  static const Gradient primaryGradient = LinearGradient(
    colors: [facOrange500, facOrange600],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const Gradient goldGradient = LinearGradient(
    colors: [facGold400, facGold600],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const Gradient blueGradient = LinearGradient(
    colors: [facBlue500, facBlue700],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const Gradient futuristicGradient = LinearGradient(
    colors: [facOrange500, facGold500],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
