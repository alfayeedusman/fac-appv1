import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_model.dart';
import '../models/booking_model.dart';
import '../models/service_model.dart';
import '../models/branch_model.dart';

class ApiService {
  // Update this to match your Express API URL
  static const String baseUrl = 'https://your-express-api.com/api';
  
  static String? _authToken;
  
  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_authToken != null) 'Authorization': 'Bearer $_authToken',
  };

  static Future<void> _setAuthToken(String token) async {
    _authToken = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  static Future<void> _loadAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString('auth_token');
  }

  static Future<void> _clearAuthToken() async {
    _authToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  // Authentication APIs
  static Future<bool> syncLoginWithExpressAPI(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: _headers,
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await _setAuthToken(data['token']);
        return true;
      }
      return false;
    } catch (e) {
      print('Login sync error: $e');
      return false;
    }
  }

  static Future<bool> registerWithExpressAPI(UserModel user) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: _headers,
        body: jsonEncode(user.toMap()),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        await _setAuthToken(data['token']);
        return true;
      }
      return false;
    } catch (e) {
      print('Registration sync error: $e');
      return false;
    }
  }

  static Future<void> logoutFromExpressAPI() async {
    try {
      await http.post(
        Uri.parse('$baseUrl/auth/logout'),
        headers: _headers,
      );
    } catch (e) {
      print('Logout sync error: $e');
    } finally {
      await _clearAuthToken();
    }
  }

  // QR Code APIs
  static Future<bool> checkInToBranch(String branchId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/qr/checkin'),
        headers: _headers,
        body: jsonEncode({
          'branchId': branchId,
          'timestamp': DateTime.now().millisecondsSinceEpoch,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Check-in error: $e');
      return false;
    }
  }

  static Future<bool> checkOutFromBranch() async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/qr/checkout'),
        headers: _headers,
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Check-out error: $e');
      return false;
    }
  }

  static Future<bool> activateService(String serviceId, String branchId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/qr/activate-service'),
        headers: _headers,
        body: jsonEncode({
          'serviceId': serviceId,
          'branchId': branchId,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Service activation error: $e');
      return false;
    }
  }

  // Booking APIs
  static Future<List<ServiceModel>> getServices() async {
    try {
      await _loadAuthToken();
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
      print('Get services error: $e');
      return [];
    }
  }

  static Future<List<BranchModel>> getBranches() async {
    try {
      await _loadAuthToken();
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
      print('Get branches error: $e');
      return [];
    }
  }

  static Future<List<BookingModel>> getUserBookings() async {
    try {
      await _loadAuthToken();
      final response = await http.get(
        Uri.parse('$baseUrl/bookings/user'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => BookingModel.fromMap(json)).toList();
      }
      return [];
    } catch (e) {
      print('Get user bookings error: $e');
      return [];
    }
  }

  static Future<BookingModel?> createBooking(BookingModel booking) async {
    try {
      await _loadAuthToken();
      final response = await http.post(
        Uri.parse('$baseUrl/bookings'),
        headers: _headers,
        body: jsonEncode(booking.toMap()),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return BookingModel.fromMap(data);
      }
      return null;
    } catch (e) {
      print('Create booking error: $e');
      return null;
    }
  }

  static Future<bool> cancelBooking(String bookingId) async {
    try {
      await _loadAuthToken();
      final response = await http.put(
        Uri.parse('$baseUrl/bookings/$bookingId/cancel'),
        headers: _headers,
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Cancel booking error: $e');
      return false;
    }
  }

  // Payment APIs
  static Future<Map<String, dynamic>?> processPayment({
    required String bookingId,
    required double amount,
    required String paymentMethod,
    required Map<String, dynamic> paymentDetails,
  }) async {
    try {
      await _loadAuthToken();
      final response = await http.post(
        Uri.parse('$baseUrl/payments/process'),
        headers: _headers,
        body: jsonEncode({
          'bookingId': bookingId,
          'amount': amount,
          'paymentMethod': paymentMethod,
          'paymentDetails': paymentDetails,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Payment processing error: $e');
      return null;
    }
  }
}
