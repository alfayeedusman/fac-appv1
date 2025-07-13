import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';
import '../models/booking_model.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8080/api'; // Change to your backend URL
  static String? _authToken;
  
  static const Map<String, String> _headers = {
    'Content-Type': 'application/json',
  };

  static Map<String, String> get headers {
    if (_authToken != null) {
      return {
        ..._headers,
        'Authorization': 'Bearer $_authToken',
      };
    }
    return _headers;
  }

  static void setAuthToken(String token) {
    _authToken = token;
  }

  static void clearAuthToken() {
    _authToken = null;
  }

  // Auth Endpoints
  static Future<ApiResponse<UserModel>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: headers,
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final user = UserModel.fromJson(data['user']);
        if (data['token'] != null) {
          setAuthToken(data['token']);
        }
        return ApiResponse.success(user);
      } else {
        return ApiResponse.error(data['message'] ?? 'Login failed');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  static Future<ApiResponse<UserModel>> register(Map<String, String> userData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: headers,
        body: jsonEncode(userData),
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        final user = UserModel.fromJson(data['user']);
        if (data['token'] != null) {
          setAuthToken(data['token']);
        }
        return ApiResponse.success(user);
      } else {
        return ApiResponse.error(data['message'] ?? 'Registration failed');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  static Future<ApiResponse<String>> logout() async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/logout'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        clearAuthToken();
        return ApiResponse.success('Logged out successfully');
      } else {
        return ApiResponse.error('Logout failed');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  // User Endpoints
  static Future<ApiResponse<UserModel>> getCurrentUser() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/user/profile'),
        headers: headers,
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final user = UserModel.fromJson(data['user']);
        return ApiResponse.success(user);
      } else {
        return ApiResponse.error(data['message'] ?? 'Failed to get user');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  static Future<ApiResponse<UserModel>> updateProfile(Map<String, dynamic> userData) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/user/profile'),
        headers: headers,
        body: jsonEncode(userData),
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final user = UserModel.fromJson(data['user']);
        return ApiResponse.success(user);
      } else {
        return ApiResponse.error(data['message'] ?? 'Failed to update profile');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  // Booking Endpoints
  static Future<ApiResponse<BookingModel>> createBooking(Map<String, dynamic> bookingData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/bookings'),
        headers: headers,
        body: jsonEncode(bookingData),
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        final booking = BookingModel.fromJson(data['booking']);
        return ApiResponse.success(booking);
      } else {
        return ApiResponse.error(data['message'] ?? 'Failed to create booking');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  static Future<ApiResponse<List<BookingModel>>> getUserBookings() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/bookings/user'),
        headers: headers,
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final List<dynamic> bookingsJson = data['bookings'];
        final bookings = bookingsJson.map((json) => BookingModel.fromJson(json)).toList();
        return ApiResponse.success(bookings);
      } else {
        return ApiResponse.error(data['message'] ?? 'Failed to get bookings');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  static Future<ApiResponse<BookingModel>> getBooking(String bookingId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/bookings/$bookingId'),
        headers: headers,
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final booking = BookingModel.fromJson(data['booking']);
        return ApiResponse.success(booking);
      } else {
        return ApiResponse.error(data['message'] ?? 'Failed to get booking');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  static Future<ApiResponse<BookingModel>> updateBooking(String bookingId, Map<String, dynamic> updates) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/bookings/$bookingId'),
        headers: headers,
        body: jsonEncode(updates),
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final booking = BookingModel.fromJson(data['booking']);
        return ApiResponse.success(booking);
      } else {
        return ApiResponse.error(data['message'] ?? 'Failed to update booking');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  static Future<ApiResponse<String>> cancelBooking(String bookingId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/bookings/$bookingId'),
        headers: headers,
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return ApiResponse.success(data['message'] ?? 'Booking cancelled');
      } else {
        return ApiResponse.error(data['message'] ?? 'Failed to cancel booking');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  // QR Code Endpoints
  static Future<ApiResponse<Map<String, dynamic>>> validateQRCode(String qrData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/qr/validate'),
        headers: headers,
        body: jsonEncode({'qrData': qrData}),
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return ApiResponse.success(data);
      } else {
        return ApiResponse.error(data['message'] ?? 'Invalid QR code');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  // Subscription Endpoints
  static Future<ApiResponse<Map<String, dynamic>>> getSubscriptionPlans() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/subscriptions/plans'),
        headers: headers,
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return ApiResponse.success(data);
      } else {
        return ApiResponse.error(data['message'] ?? 'Failed to get plans');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  static Future<ApiResponse<String>> submitPaymentRequest(Map<String, dynamic> paymentData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/subscriptions/payment-request'),
        headers: headers,
        body: jsonEncode(paymentData),
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return ApiResponse.success(data['message'] ?? 'Payment request submitted');
      } else {
        return ApiResponse.error(data['message'] ?? 'Failed to submit payment request');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  // Voucher Endpoints
  static Future<ApiResponse<List<Map<String, dynamic>>>> getUserVouchers() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/vouchers/user'),
        headers: headers,
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final List<dynamic> vouchersJson = data['vouchers'];
        return ApiResponse.success(vouchersJson.cast<Map<String, dynamic>>());
      } else {
        return ApiResponse.error(data['message'] ?? 'Failed to get vouchers');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  static Future<ApiResponse<String>> redeemVoucher(String voucherCode) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/vouchers/redeem'),
        headers: headers,
        body: jsonEncode({'code': voucherCode}),
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return ApiResponse.success(data['message'] ?? 'Voucher redeemed');
      } else {
        return ApiResponse.error(data['message'] ?? 'Failed to redeem voucher');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }

  // Ping endpoint
  static Future<ApiResponse<String>> ping() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/ping'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return ApiResponse.success('Connected to server');
      } else {
        return ApiResponse.error('Server not responding');
      }
    } catch (e) {
      return ApiResponse.error('Network error: $e');
    }
  }
}

class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? error;

  ApiResponse.success(this.data) : success = true, error = null;
  ApiResponse.error(this.error) : success = false, data = null;
}
