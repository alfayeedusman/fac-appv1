import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/user_model.dart';
import '../models/booking_model.dart';
import '../models/service_model.dart';
import '../models/branch_model.dart';
import '../models/qr_scan_result.dart';

class DatabaseService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static final FirebaseAuth _auth = FirebaseAuth.instance;

  // Collections
  static const String _usersCollection = 'users';
  static const String _bookingsCollection = 'bookings';
  static const String _servicesCollection = 'services';
  static const String _branchesCollection = 'branches';
  static const String _qrScansCollection = 'qr_scans';
  static const String _membershipCollection = 'memberships';
  static const String _paymentsCollection = 'payments';
  static const String _vouchersCollection = 'vouchers';

  // Initialize default data
  static Future<void> initializeDefaultData() async {
    await _createDefaultServices();
    await _createDefaultBranches();
  }

  // User Management
  static Future<void> createUser(UserModel user) async {
    try {
      await _firestore.collection(_usersCollection).doc(user.uid).set({
        ...user.toMap(),
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
        'isActive': true,
        'totalBookings': 0,
        'totalSpent': 0.0,
        'loyaltyPoints': 0,
        'membershipStatus': user.membershipType,
        'membershipStartDate': FieldValue.serverTimestamp(),
        'lastLoginAt': FieldValue.serverTimestamp(),
      });

      // Create membership record
      await _createMembershipRecord(user);
    } catch (e) {
      print('Error creating user: $e');
      rethrow;
    }
  }

  static Future<UserModel?> getUser(String uid) async {
    try {
      final doc = await _firestore.collection(_usersCollection).doc(uid).get();
      if (doc.exists) {
        return UserModel.fromMap(doc.data()!);
      }
      return null;
    } catch (e) {
      print('Error getting user: $e');
      return null;
    }
  }

  static Future<void> updateUser(UserModel user) async {
    try {
      await _firestore.collection(_usersCollection).doc(user.uid).update({
        ...user.toMap(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Error updating user: $e');
      rethrow;
    }
  }

  static Future<void> updateUserLoginTime(String uid) async {
    try {
      await _firestore.collection(_usersCollection).doc(uid).update({
        'lastLoginAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Error updating login time: $e');
    }
  }

  // Booking Management
  static Future<String> createBooking(BookingModel booking) async {
    try {
      final docRef = await _firestore.collection(_bookingsCollection).add({
        ...booking.toMap(),
        'userId': _auth.currentUser?.uid,
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
        'status': BookingStatus.pending.toString(),
        'queueNumber': await _generateQueueNumber(booking.branchId, booking.scheduledDate),
      });

      // Update user stats
      await _updateUserBookingStats(booking.userId);

      return docRef.id;
    } catch (e) {
      print('Error creating booking: $e');
      rethrow;
    }
  }

  static Future<List<BookingModel>> getUserBookings(String userId) async {
    try {
      final querySnapshot = await _firestore
          .collection(_bookingsCollection)
          .where('userId', isEqualTo: userId)
          .orderBy('createdAt', descending: true)
          .limit(50)
          .get();

      return querySnapshot.docs
          .map((doc) => BookingModel.fromMap({...doc.data(), 'id': doc.id}))
          .toList();
    } catch (e) {
      print('Error getting user bookings: $e');
      return [];
    }
  }

  static Future<void> updateBookingStatus(String bookingId, BookingStatus status) async {
    try {
      await _firestore.collection(_bookingsCollection).doc(bookingId).update({
        'status': status.toString(),
        'updatedAt': FieldValue.serverTimestamp(),
        if (status == BookingStatus.completed) 'completedAt': FieldValue.serverTimestamp(),
        if (status == BookingStatus.cancelled) 'cancelledAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Error updating booking status: $e');
      rethrow;
    }
  }

  static Stream<QuerySnapshot> getBookingsStream(String userId) {
    return _firestore
        .collection(_bookingsCollection)
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  // Services Management
  static Future<List<ServiceModel>> getServices() async {
    try {
      final querySnapshot = await _firestore
          .collection(_servicesCollection)
          .where('isActive', isEqualTo: true)
          .orderBy('category')
          .orderBy('basePrice')
          .get();

      return querySnapshot.docs
          .map((doc) => ServiceModel.fromMap({...doc.data(), 'id': doc.id}))
          .toList();
    } catch (e) {
      print('Error getting services: $e');
      return [];
    }
  }

  static Future<ServiceModel?> getService(String serviceId) async {
    try {
      final doc = await _firestore.collection(_servicesCollection).doc(serviceId).get();
      if (doc.exists) {
        return ServiceModel.fromMap({...doc.data()!, 'id': doc.id});
      }
      return null;
    } catch (e) {
      print('Error getting service: $e');
      return null;
    }
  }

  // Branches Management
  static Future<List<BranchModel>> getBranches() async {
    try {
      final querySnapshot = await _firestore
          .collection(_branchesCollection)
          .where('isActive', isEqualTo: true)
          .get();

      return querySnapshot.docs
          .map((doc) => BranchModel.fromMap({...doc.data(), 'id': doc.id}))
          .toList();
    } catch (e) {
      print('Error getting branches: $e');
      return [];
    }
  }

  static Future<BranchModel?> getBranch(String branchId) async {
    try {
      final doc = await _firestore.collection(_branchesCollection).doc(branchId).get();
      if (doc.exists) {
        return BranchModel.fromMap({...doc.data()!, 'id': doc.id});
      }
      return null;
    } catch (e) {
      print('Error getting branch: $e');
      return null;
    }
  }

  // QR Scanning
  static Future<void> logQRScan(QRScanResult scanResult) async {
    try {
      await _firestore.collection(_qrScansCollection).add({
        ...scanResult.toMap(),
        'userId': _auth.currentUser?.uid,
        'timestamp': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Error logging QR scan: $e');
    }
  }

  static Future<void> checkInToBranch(String branchId) async {
    try {
      final userId = _auth.currentUser?.uid;
      if (userId == null) throw Exception('User not authenticated');

      await _firestore.collection(_usersCollection).doc(userId).update({
        'currentBranch': branchId,
        'checkedInAt': FieldValue.serverTimestamp(),
        'isCheckedIn': true,
      });

      // Log the check-in
      await _firestore.collection('check_ins').add({
        'userId': userId,
        'branchId': branchId,
        'checkedInAt': FieldValue.serverTimestamp(),
        'type': 'qr_scan',
      });
    } catch (e) {
      print('Error checking in to branch: $e');
      rethrow;
    }
  }

  static Future<void> checkOutFromBranch() async {
    try {
      final userId = _auth.currentUser?.uid;
      if (userId == null) throw Exception('User not authenticated');

      await _firestore.collection(_usersCollection).doc(userId).update({
        'currentBranch': null,
        'checkedOutAt': FieldValue.serverTimestamp(),
        'isCheckedIn': false,
      });
    } catch (e) {
      print('Error checking out: $e');
      rethrow;
    }
  }

  // Membership Management
  static Future<void> _createMembershipRecord(UserModel user) async {
    try {
      final membershipData = {
        'userId': user.uid,
        'type': user.membershipType,
        'startDate': FieldValue.serverTimestamp(),
        'isActive': true,
        'remainingWashes': _getMembershipWashes(user.membershipType),
        'remainingCredits': _getMembershipCredits(user.membershipType),
        'autoRenew': false,
        'createdAt': FieldValue.serverTimestamp(),
      };

      await _firestore.collection(_membershipCollection).add(membershipData);
    } catch (e) {
      print('Error creating membership record: $e');
    }
  }

  static Future<Map<String, dynamic>?> getUserMembership(String userId) async {
    try {
      final querySnapshot = await _firestore
          .collection(_membershipCollection)
          .where('userId', isEqualTo: userId)
          .where('isActive', isEqualTo: true)
          .limit(1)
          .get();

      if (querySnapshot.docs.isNotEmpty) {
        return {...querySnapshot.docs.first.data(), 'id': querySnapshot.docs.first.id};
      }
      return null;
    } catch (e) {
      print('Error getting user membership: $e');
      return null;
    }
  }

  // Payment Management
  static Future<void> createPaymentRecord({
    required String bookingId,
    required double amount,
    required String paymentMethod,
    required String status,
    Map<String, dynamic>? paymentDetails,
  }) async {
    try {
      await _firestore.collection(_paymentsCollection).add({
        'bookingId': bookingId,
        'userId': _auth.currentUser?.uid,
        'amount': amount,
        'paymentMethod': paymentMethod,
        'status': status,
        'paymentDetails': paymentDetails ?? {},
        'createdAt': FieldValue.serverTimestamp(),
      });

      // Update user total spent
      if (status == 'completed') {
        final userId = _auth.currentUser?.uid;
        if (userId != null) {
          await _firestore.collection(_usersCollection).doc(userId).update({
            'totalSpent': FieldValue.increment(amount),
            'loyaltyPoints': FieldValue.increment((amount * 0.1).round()),
          });
        }
      }
    } catch (e) {
      print('Error creating payment record: $e');
      rethrow;
    }
  }

  // Vouchers Management
  static Future<List<Map<String, dynamic>>> getUserVouchers(String userId) async {
    try {
      final querySnapshot = await _firestore
          .collection(_vouchersCollection)
          .where('userId', isEqualTo: userId)
          .where('isUsed', isEqualTo: false)
          .where('expiryDate', isGreaterThan: Timestamp.now())
          .get();

      return querySnapshot.docs
          .map((doc) => {...doc.data(), 'id': doc.id})
          .toList();
    } catch (e) {
      print('Error getting user vouchers: $e');
      return [];
    }
  }

  static Future<void> useVoucher(String voucherId) async {
    try {
      await _firestore.collection(_vouchersCollection).doc(voucherId).update({
        'isUsed': true,
        'usedAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Error using voucher: $e');
      rethrow;
    }
  }

  // Analytics and Reports
  static Future<Map<String, dynamic>> getUserAnalytics(String userId) async {
    try {
      final userDoc = await _firestore.collection(_usersCollection).doc(userId).get();
      final userData = userDoc.data() ?? {};

      final bookingsSnapshot = await _firestore
          .collection(_bookingsCollection)
          .where('userId', isEqualTo: userId)
          .where('status', isEqualTo: BookingStatus.completed.toString())
          .get();

      final thisMonthBookings = bookingsSnapshot.docs.where((doc) {
        final data = doc.data();
        final completedAt = data['completedAt'] as Timestamp?;
        if (completedAt == null) return false;
        
        final now = DateTime.now();
        final completedDate = completedAt.toDate();
        return completedDate.year == now.year && completedDate.month == now.month;
      }).length;

      return {
        'totalBookings': userData['totalBookings'] ?? 0,
        'totalSpent': userData['totalSpent'] ?? 0.0,
        'loyaltyPoints': userData['loyaltyPoints'] ?? 0,
        'thisMonthBookings': thisMonthBookings,
        'membershipType': userData['membershipType'] ?? 'Regular',
        'memberSince': userData['createdAt'],
      };
    } catch (e) {
      print('Error getting user analytics: $e');
      return {};
    }
  }

  // Private helper methods
  static Future<void> _createDefaultServices() async {
    final services = [
      {
        'name': 'Quick Wash',
        'description': 'Basic exterior wash and dry',
        'basePrice': 250.0,
        'duration': 20,
        'category': 'Basic',
        'features': ['Exterior wash', 'Basic drying', 'Tire cleaning'],
        'isActive': true,
      },
      {
        'name': 'Classic Wash',
        'description': 'Complete wash with interior cleaning',
        'basePrice': 450.0,
        'duration': 45,
        'category': 'Standard',
        'features': ['Exterior wash & wax', 'Interior vacuum', 'Window cleaning', 'Dashboard care'],
        'isActive': true,
      },
      {
        'name': 'Premium Wash',
        'description': 'Full service with detailing',
        'basePrice': 850.0,
        'duration': 90,
        'category': 'Premium',
        'features': ['Complete exterior detail', 'Interior deep clean', 'Tire & rim care', 'Engine bay clean'],
        'isActive': true,
      },
      {
        'name': 'Detailing Service',
        'description': 'Professional car detailing',
        'basePrice': 2500.0,
        'duration': 180,
        'category': 'Luxury',
        'features': ['Paint correction', 'Interior shampooing', 'Engine bay detail', 'Ceramic coating'],
        'isActive': true,
      },
    ];

    for (final service in services) {
      await _firestore.collection(_servicesCollection).add(service);
    }
  }

  static Future<void> _createDefaultBranches() async {
    final branches = [
      {
        'name': 'Fayeed Auto Care - Tumaga',
        'address': 'Tumaga, Zamboanga City',
        'latitude': 6.9214,
        'longitude': 122.0790,
        'phoneNumber': '+63 998 123 4567',
        'operatingHours': '7:00 AM - 7:00 PM',
        'availableServices': ['Quick Wash', 'Classic Wash', 'Premium Wash', 'Detailing Service'],
        'isActive': true,
        'currentWaitTime': 15,
        'rating': 4.8,
      },
      {
        'name': 'Fayeed Auto Care - Boalan',
        'address': 'Boalan, Zamboanga City',
        'latitude': 6.9100,
        'longitude': 122.0730,
        'phoneNumber': '+63 998 765 4321',
        'operatingHours': '7:00 AM - 7:00 PM',
        'availableServices': ['Quick Wash', 'Classic Wash', 'Premium Wash'],
        'isActive': true,
        'currentWaitTime': 25,
        'rating': 4.7,
      },
    ];

    for (final branch in branches) {
      await _firestore.collection(_branchesCollection).add(branch);
    }
  }

  static Future<int> _generateQueueNumber(String branchId, DateTime date) async {
    final startOfDay = DateTime(date.year, date.month, date.day);
    final endOfDay = DateTime(date.year, date.month, date.day, 23, 59, 59);

    final querySnapshot = await _firestore
        .collection(_bookingsCollection)
        .where('branchId', isEqualTo: branchId)
        .where('scheduledDate', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay))
        .where('scheduledDate', isLessThanOrEqualTo: Timestamp.fromDate(endOfDay))
        .get();

    return querySnapshot.docs.length + 1;
  }

  static Future<void> _updateUserBookingStats(String userId) async {
    await _firestore.collection(_usersCollection).doc(userId).update({
      'totalBookings': FieldValue.increment(1),
      'lastBookingAt': FieldValue.serverTimestamp(),
    });
  }

  static int _getMembershipWashes(String membershipType) {
    switch (membershipType) {
      case 'Classic':
        return 10;
      case 'VIP Silver':
        return 999; // Unlimited represented as large number
      case 'VIP Gold':
        return 999;
      default:
        return 0;
    }
  }

  static double _getMembershipCredits(String membershipType) {
    switch (membershipType) {
      case 'Classic':
        return 500.0;
      case 'VIP Silver':
        return 1500.0;
      case 'VIP Gold':
        return 3000.0;
      default:
        return 0.0;
    }
  }
}
