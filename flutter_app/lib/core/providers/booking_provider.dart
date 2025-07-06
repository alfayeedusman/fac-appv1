import 'package:flutter/foundation.dart';

import '../models/booking_model.dart';
import '../models/service_model.dart';
import '../models/branch_model.dart';
import '../services/api_service.dart';

class BookingProvider extends ChangeNotifier {
  List<ServiceModel> _services = [];
  List<BranchModel> _branches = [];
  List<BookingModel> _bookings = [];
  BookingModel? _currentBooking;
  bool _isLoading = false;
  String? _errorMessage;

  List<ServiceModel> get services => _services;
  List<BranchModel> get branches => _branches;
  List<BookingModel> get bookings => _bookings;
  BookingModel? get currentBooking => _currentBooking;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadServices() async {
    try {
      _setLoading(true);
      _clearError();
      
      _services = await ApiService.getServices();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load services: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadBranches() async {
    try {
      _setLoading(true);
      _clearError();
      
      _branches = await ApiService.getBranches();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load branches: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadUserBookings() async {
    try {
      _setLoading(true);
      _clearError();
      
      _bookings = await ApiService.getUserBookings();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load bookings: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> createBooking({
    required String serviceId,
    required String branchId,
    required DateTime scheduledDate,
    required String vehicleType,
    required String plateNumber,
    String? specialInstructions,
    required String paymentMethod,
  }) async {
    try {
      _setLoading(true);
      _clearError();

      final booking = BookingModel(
        id: '', // Will be set by API
        userId: '', // Will be set by API
        serviceId: serviceId,
        branchId: branchId,
        scheduledDate: scheduledDate,
        vehicleType: vehicleType,
        plateNumber: plateNumber,
        specialInstructions: specialInstructions,
        paymentMethod: paymentMethod,
        status: BookingStatus.pending,
        createdAt: DateTime.now(),
      );

      final createdBooking = await ApiService.createBooking(booking);
      
      if (createdBooking != null) {
        _currentBooking = createdBooking;
        _bookings.insert(0, createdBooking);
        notifyListeners();
        return true;
      }
      
      return false;
    } catch (e) {
      _setError('Failed to create booking: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> cancelBooking(String bookingId) async {
    try {
      _setLoading(true);
      _clearError();
      
      final success = await ApiService.cancelBooking(bookingId);
      
      if (success) {
        _bookings.removeWhere((booking) => booking.id == bookingId);
        if (_currentBooking?.id == bookingId) {
          _currentBooking = null;
        }
        notifyListeners();
        return true;
      }
      
      return false;
    } catch (e) {
      _setError('Failed to cancel booking: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  List<DateTime> getAvailableTimeSlots(String branchId, DateTime date) {
    // Generate available time slots based on branch operating hours
    final slots = <DateTime>[];
    final baseDate = DateTime(date.year, date.month, date.day);
    
    // Operating hours: 8 AM to 6 PM
    for (int hour = 8; hour < 18; hour++) {
      for (int minute = 0; minute < 60; minute += 30) {
        slots.add(baseDate.add(Duration(hours: hour, minutes: minute)));
      }
    }
    
    return slots;
  }

  double calculateServicePrice(String serviceId, String vehicleType) {
    final service = _services.firstWhere(
      (s) => s.id == serviceId,
      orElse: () => ServiceModel(
        id: '',
        name: '',
        description: '',
        basePrice: 0,
        duration: 0,
        category: '',
      ),
    );
    
    double price = service.basePrice;
    
    // Apply vehicle type multiplier
    switch (vehicleType.toLowerCase()) {
      case 'motorcycle':
        price *= 0.5;
        break;
      case 'suv':
      case 'pickup':
        price *= 1.2;
        break;
      case 'van':
        price *= 1.3;
        break;
      default: // sedan, hatchback
        break;
    }
    
    return price;
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void clearCurrentBooking() {
    _currentBooking = null;
    notifyListeners();
  }
}
