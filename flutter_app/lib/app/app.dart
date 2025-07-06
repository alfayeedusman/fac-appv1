import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/providers/auth_provider.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/auth/screens/onboarding_screen.dart';
import '../features/dashboard/screens/dashboard_screen.dart';
import '../features/qr_scanner/screens/qr_scanner_screen.dart';
import '../features/booking/screens/booking_screen.dart';
import '../features/booking/screens/booking_confirmation_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/splash/screens/splash_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final authProvider = context.read<AuthProvider>();
      final isLoggedIn = authProvider.isAuthenticated;
      final isOnboarded = authProvider.isOnboarded;
      
      // Handle authentication redirects
      if (state.location == '/splash') return null;
      
      if (!isOnboarded && state.location != '/onboarding') {
        return '/onboarding';
      }
      
      if (!isLoggedIn && !['/login', '/register', '/onboarding'].contains(state.location)) {
        return '/login';
      }
      
      if (isLoggedIn && ['/login', '/register'].contains(state.location)) {
        return '/dashboard';
      }
      
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/qr-scanner',
        builder: (context, state) => const QRScannerScreen(),
      ),
      GoRoute(
        path: '/booking',
        builder: (context, state) => const BookingScreen(),
      ),
      GoRoute(
        path: '/booking-confirmation',
        builder: (context, state) => BookingConfirmationScreen(
          bookingId: state.queryParameters['bookingId'] ?? '',
        ),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
    ],
  );
}
