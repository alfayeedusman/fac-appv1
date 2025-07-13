import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import '../models/user_model.dart';

class FirebaseService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  static Future<void> initialize() async {
    // Request notification permissions
    await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Get FCM token for push notifications
    final token = await _messaging.getToken();
    print('FCM Token: $token');
  }

  // User Management
  static Future<void> createUser(UserModel user) async {
    try {
      await _firestore.collection('users').doc(user.uid).set(user.toMap());
    } catch (e) {
      print('Error creating user in Firestore: $e');
      rethrow;
    }
  }

  static Future<Map<String, dynamic>?> getUserData(String uid) async {
    try {
      final doc = await _firestore.collection('users').doc(uid).get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      print('Error getting user data: $e');
      return null;
    }
  }

  static Future<void> updateUser(UserModel user) async {
    try {
      await _firestore.collection('users').doc(user.uid).update(
        user.copyWith(updatedAt: DateTime.now()).toMap(),
      );
    } catch (e) {
      print('Error updating user: $e');
      rethrow;
    }
  }

  // QR Scan History
  static Future<void> logQRScan(String userId, Map<String, dynamic> scanData) async {
    try {
      await _firestore
          .collection('users')
          .doc(userId)
          .collection('qr_scans')
          .add({
        ...scanData,
        'timestamp': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Error logging QR scan: $e');
    }
  }

  // Booking Management
  static Future<void> createBooking(String userId, Map<String, dynamic> bookingData) async {
    try {
      await _firestore
          .collection('users')
          .doc(userId)
          .collection('bookings')
          .add({
        ...bookingData,
        'createdAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('Error creating booking in Firestore: $e');
      rethrow;
    }
  }

  static Stream<QuerySnapshot> getUserBookingsStream(String userId) {
    return _firestore
        .collection('users')
        .doc(userId)
        .collection('bookings')
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  // Push Notifications
  static Future<void> updateFCMToken(String userId) async {
    try {
      final token = await _messaging.getToken();
      if (token != null) {
        await _firestore.collection('users').doc(userId).update({
          'fcmToken': token,
          'lastTokenUpdate': FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {
      print('Error updating FCM token: $e');
    }
  }

  static Future<void> subscribeToTopic(String topic) async {
    try {
      await _messaging.subscribeToTopic(topic);
    } catch (e) {
      print('Error subscribing to topic: $e');
    }
  }

  static Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _messaging.unsubscribeFromTopic(topic);
    } catch (e) {
      print('Error unsubscribing from topic: $e');
    }
  }
}
