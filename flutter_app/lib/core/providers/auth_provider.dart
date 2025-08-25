import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _user;
  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _error;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get error => _error;
  bool get isAdmin => _user?.isAdmin ?? false;
  bool get isCustomer => _user?.isCustomer ?? false;

  AuthProvider() {
    _loadUserFromStorage();
  }

  Future<void> _loadUserFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('user');
      final token = prefs.getString('auth_token');
      
      if (userJson != null && token != null) {
        _user = UserModel.fromJson(Map<String, dynamic>.from(
          // You might need to use a proper JSON decode here
          {}
        ));
        _isAuthenticated = true;
        ApiService.setAuthToken(token);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading user from storage: $e');
    }
  }

  Future<void> _saveUserToStorage(UserModel user, String? token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', user.toJson().toString());
      if (token != null) {
        await prefs.setString('auth_token', token);
      }
      await prefs.setBool('is_authenticated', true);
    } catch (e) {
      debugPrint('Error saving user to storage: $e');
    }
  }

  Future<void> _clearStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('user');
      await prefs.remove('auth_token');
      await prefs.setBool('is_authenticated', false);
    } catch (e) {
      debugPrint('Error clearing storage: $e');
    }
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await ApiService.login(email, password);
      
      if (response.success && response.data != null) {
        _user = response.data;
        _isAuthenticated = true;
        
        // Save to local storage
        await _saveUserToStorage(_user!, null); // Token is set in ApiService
        
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.error ?? 'Login failed');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return false;
    }
  }

  Future<bool> register(Map<String, String> userData) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await ApiService.register(userData);
      
      if (response.success && response.data != null) {
        _user = response.data;
        _isAuthenticated = true;
        
        // Save to local storage
        await _saveUserToStorage(_user!, null);
        
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.error ?? 'Registration failed');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return false;
    }
  }

  Future<void> logout() async {
    _setLoading(true);

    try {
      await ApiService.logout();
    } catch (e) {
      debugPrint('Error during logout: $e');
    }

    // Clear local state regardless of API response
    _user = null;
    _isAuthenticated = false;
    ApiService.clearAuthToken();
    await _clearStorage();
    
    _setLoading(false);
    notifyListeners();
  }

  Future<bool> refreshUser() async {
    if (!_isAuthenticated) return false;

    try {
      final response = await ApiService.getCurrentUser();
      
      if (response.success && response.data != null) {
        _user = response.data;
        await _saveUserToStorage(_user!, null);
        notifyListeners();
        return true;
      } else {
        // If refresh fails, logout the user
        await logout();
        return false;
      }
    } catch (e) {
      debugPrint('Error refreshing user: $e');
      return false;
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> userData) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await ApiService.updateProfile(userData);
      
      if (response.success && response.data != null) {
        _user = response.data;
        await _saveUserToStorage(_user!, null);
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.error ?? 'Failed to update profile');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return false;
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _clearError();
  }

  // Utility methods
  String get userDisplayName => _user?.fullName ?? _user?.email.split('@').first ?? 'User';
  String get userPackage => _user?.packageType ?? 'Regular Member';
  bool get hasActiveSubscription => _user?.hasActiveSubscription ?? false;
  
  // Check if user has specific permissions
  bool canAccessAdminFeatures() => isAdmin;
  bool canBookServices() => isAuthenticated;
  bool canUseVIPServices() => hasActiveSubscription && userPackage != 'Regular Member';
}
