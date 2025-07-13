import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/user_model.dart';
import '../../../core/models/booking_model.dart';
import '../../../core/services/database_service.dart';
import '../../../core/services/api_service.dart';

class DashboardState {
  final bool isLoading;
  final UserModel? user;
  final Map<String, dynamic>? membership;
  final Map<String, dynamic>? analytics;
  final List<Map<String, dynamic>> vouchers;
  final List<BookingModel> recentBookings;
  final int unreadNotifications;
  final String? error;

  const DashboardState({
    this.isLoading = false,
    this.user,
    this.membership,
    this.analytics,
    this.vouchers = const [],
    this.recentBookings = const [],
    this.unreadNotifications = 0,
    this.error,
  });

  DashboardState copyWith({
    bool? isLoading,
    UserModel? user,
    Map<String, dynamic>? membership,
    Map<String, dynamic>? analytics,
    List<Map<String, dynamic>>? vouchers,
    List<BookingModel>? recentBookings,
    int? unreadNotifications,
    String? error,
  }) {
    return DashboardState(
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      membership: membership ?? this.membership,
      analytics: analytics ?? this.analytics,
      vouchers: vouchers ?? this.vouchers,
      recentBookings: recentBookings ?? this.recentBookings,
      unreadNotifications: unreadNotifications ?? this.unreadNotifications,
      error: error ?? this.error,
    );
  }
}

class DashboardNotifier extends StateNotifier<DashboardState> {
  DashboardNotifier() : super(const DashboardState());

  Future<void> loadDashboardData() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // Simulate loading delay for skeleton effect
      await Future.delayed(const Duration(milliseconds: 1500));

      // Load user data
      final userData = await DatabaseService.getUser('current_user_id');
      UserModel? user;
      if (userData != null) {
        user = UserModel.fromMap(userData);
      }

      // Load analytics
      final analytics = await DatabaseService.getUserAnalytics('current_user_id');

      // Load membership info
      final membership = await _loadMembershipInfo();

      // Load vouchers
      final vouchers = await DatabaseService.getUserVouchers('current_user_id');

      // Load recent bookings
      final bookingsData = await DatabaseService.getUserBookings('current_user_id');
      final recentBookings = bookingsData
          .take(5)
          .map((data) => BookingModel.fromMap(data))
          .toList();

      // Mock unread notifications
      const unreadNotifications = 3;

      state = state.copyWith(
        isLoading: false,
        user: user,
        membership: membership,
        analytics: analytics,
        vouchers: vouchers,
        recentBookings: recentBookings,
        unreadNotifications: unreadNotifications,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<Map<String, dynamic>> _loadMembershipInfo() async {
    // Mock membership data
    return {
      'type': 'vip_silver',
      'remainingWashes': 999,
      'remainingCredits': 1200.0,
      'startDate': DateTime.now().subtract(const Duration(days: 30)),
      'endDate': DateTime.now().add(const Duration(days: 30)),
      'isActive': true,
    };
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  void updateUnreadNotifications(int count) {
    state = state.copyWith(unreadNotifications: count);
  }
}

final dashboardProvider = StateNotifierProvider<DashboardNotifier, DashboardState>(
  (ref) => DashboardNotifier(),
);
