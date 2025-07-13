import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:firebase_auth/firebase_auth.dart';

import '../models/user_model.dart';
import '../models/booking_model.dart';
import '../models/service_model.dart';
import '../models/branch_model.dart';

class MySQLService {
  // Update this URL to match your Express API
  static const String baseUrl = 'http://localhost:3000/api';
  
  static String? _authToken;

  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_authToken != null) 'Authorization': 'Bearer $_authToken',
  };

  // Initialize with Firebase token
  static Future<void> initialize() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      _authToken = await user.getIdToken();
    }
  }

  static Future<void> updateAuthToken() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      _authToken = await user.getIdToken(true); // Force refresh
    }
  }

  // User Management
  static Future<bool> syncUserWithMySQL(UserModel user) async {
    try {
      await updateAuthToken();
      
      final response = await http.post(
        Uri.parse('$baseUrl/users/sync'),
        headers: _headers,
        body: jsonEncode({
          'firebase_uid': user.uid,
          'email': user.email,
          'full_name': user.fullName,
          'phone_number': user.phoneNumber,
          'address': user.address,
          'profile_image_url': user.profileImageUrl,
        }),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error syncing user with MySQL: $e');
      return false;
    }
  }

  static Future<Map<String, dynamic>?> getUserProfile(String userId) async {
    try {
      await updateAuthToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/users/$userId/profile'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Error getting user profile: $e');
      return null;
    }
  }

  static Future<bool> updateUserProfile(String userId, Map<String, dynamic> profileData) async {
    try {
      await updateAuthToken();
      
      final response = await http.put(
        Uri.parse('$baseUrl/users/$userId/profile'),
        headers: _headers,
        body: jsonEncode(profileData),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error updating user profile: $e');
      return false;
    }
  }

  // Vehicle Management
  static Future<List<Map<String, dynamic>>> getUserVehicles(String userId) async {
    try {
      await updateAuthToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/users/$userId/vehicles'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      print('Error getting user vehicles: $e');
      return [];
    }
  }

  static Future<int?> addVehicle(String userId, Map<String, dynamic> vehicleData) async {
    try {
      await updateAuthToken();
      
      final response = await http.post(
        Uri.parse('$baseUrl/users/$userId/vehicles'),
        headers: _headers,
        body: jsonEncode(vehicleData),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['vehicle_id'];
      }
      return null;
    } catch (e) {
      print('Error adding vehicle: $e');
      return null;
    }
  }

  // Service Management
  static Future<List<ServiceModel>> getServices() async {
    try {
      await updateAuthToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/services'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => ServiceModel.fromMap(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error getting services: $e');
      return [];
    }
  }

  static Future<double> getServicePrice(int serviceId, String vehicleType) async {
    try {
      await updateAuthToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/services/$serviceId/price?vehicle_type=$vehicleType'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['price'] as num).toDouble();
      }
      return 0.0;
    } catch (e) {
      print('Error getting service price: $e');
      return 0.0;
    }
  }

  // Branch Management
  static Future<List<BranchModel>> getBranches() async {
    try {
      await updateAuthToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/branches'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => BranchModel.fromMap(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error getting branches: $e');
      return [];
    }
  }

  static Future<Map<String, dynamic>?> getBranchAvailability(int branchId, DateTime date) async {
    try {
      await updateAuthToken();
      
      final dateStr = date.toIso8601String().split('T')[0];
      final response = await http.get(
        Uri.parse('$baseUrl/branches/$branchId/availability?date=$dateStr'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Error getting branch availability: $e');
      return null;
    }
  }

  // Booking Management
  static Future<int?> createBooking(Map<String, dynamic> bookingData) async {
    try {
      await updateAuthToken();
      
      final response = await http.post(
        Uri.parse('$baseUrl/bookings'),
        headers: _headers,
        body: jsonEncode(bookingData),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['booking_id'];
      }
      return null;
    } catch (e) {
      print('Error creating booking: $e');
      return null;
    }
  }

  static Future<List<BookingModel>> getUserBookings(String userId, {int limit = 50}) async {
    try {
      await updateAuthToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/users/$userId/bookings?limit=$limit'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => BookingModel.fromMap(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error getting user bookings: $e');
      return [];
    }
  }

  static Future<bool> updateBookingStatus(int bookingId, String status) async {
    try {
      await updateAuthToken();
      
      final response = await http.put(
        Uri.parse('$baseUrl/bookings/$bookingId/status'),
        headers: _headers,
        body: jsonEncode({'status': status}),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error updating booking status: $e');
      return false;
    }
  }

  // QR Code Management
  static Future<bool> checkInToBranch(String userId, int branchId, String qrData) async {
    try {
      await updateAuthToken();
      
      final response = await http.post(
        Uri.parse('$baseUrl/qr/checkin'),
        headers: _headers,
        body: jsonEncode({
          'user_id': userId,
          'branch_id': branchId,
          'qr_code_data': qrData,
          'timestamp': DateTime.now().toIso8601String(),
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error checking in: $e');
      return false;
    }
  }

  static Future<bool> checkOutFromBranch(String userId) async {
    try {
      await updateAuthToken();
      
      final response = await http.post(
        Uri.parse('$baseUrl/qr/checkout'),
        headers: _headers,
        body: jsonEncode({
          'user_id': userId,
          'timestamp': DateTime.now().toIso8601String(),
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error checking out: $e');
      return false;
    }
  }

  static Future<bool> logQRScan(String userId, Map<String, dynamic> scanData) async {
    try {
      await updateAuthToken();
      
      final response = await http.post(
        Uri.parse('$baseUrl/qr/log'),
        headers: _headers,
        body: jsonEncode({
          'user_id': userId,
          ...scanData,
          'scanned_at': DateTime.now().toIso8601String(),
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error logging QR scan: $e');
      return false;
    }
  }

  // Membership Management
  static Future<Map<String, dynamic>?> getUserMembership(String userId) async {
    try {
      await updateAuthToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/users/$userId/membership'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Error getting user membership: $e');
      return null;
    }
  }

  static Future<List<Map<String, dynamic>>> getAvailableMemberships() async {
    try {
      await updateAuthToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/memberships'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      print('Error getting memberships: $e');
      return [];
    }
  }

  // Payment Management
  static Future<int?> createPayment(Map<String, dynamic> paymentData) async {
    try {
      await updateAuthToken();
      
      final response = await http.post(
        Uri.parse('$baseUrl/payments'),
        headers: _headers,
        body: jsonEncode(paymentData),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['payment_id'];
      }
      return null;
    } catch (e) {
      print('Error creating payment: $e');
      return null;
    }
  }

  // Voucher Management
  static Future<List<Map<String, dynamic>>> getUserVouchers(String userId) async {
    try {
      await updateAuthToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/users/$userId/vouchers'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      print('Error getting user vouchers: $e');
      return [];
    }
  }

  static Future<bool> useVoucher(String userId, int voucherId) async {
    try {
      await updateAuthToken();
      
      final response = await http.post(
        Uri.parse('$baseUrl/users/$userId/vouchers/$voucherId/use'),
        headers: _headers,
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error using voucher: $e');
      return false;
    }
  }

  // Analytics
  static Future<Map<String, dynamic>?> getUserAnalytics(String userId) async {
    try {
      await updateAuthToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/users/$userId/analytics'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Error getting user analytics: $e');
      return null;
    }
  }

  // Notifications
  static Future<List<Map<String, dynamic>>> getUserNotifications(String userId) async {
    try {
      await updateAuthToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/users/$userId/notifications'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      print('Error getting notifications: $e');
      return [];
    }
  }

  static Future<bool> markNotificationAsRead(String userId, int notificationId) async {
    try {
      await updateAuthToken();
      
      final response = await http.put(
        Uri.parse('$baseUrl/users/$userId/notifications/$notificationId/read'),
        headers: _headers,
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error marking notification as read: $e');
      return false;
    }
  }
}
