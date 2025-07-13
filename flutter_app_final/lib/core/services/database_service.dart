import 'dart:async';
import 'dart:io';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

class DatabaseService {
  static Database? _database;
  static const String dbName = 'fayeed_auto_care.db';
  static const int dbVersion = 1;

  static Future<Database> get database async {
    _database ??= await _initDatabase();
    return _database!;
  }

  static Future<void> initialize() async {
    await database;
  }

  static Future<Database> _initDatabase() async {
    Directory documentsDirectory = await getApplicationDocumentsDirectory();
    String path = join(documentsDirectory.path, dbName);
    
    return await openDatabase(
      path,
      version: dbVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  static Future<void> _onCreate(Database db, int version) async {
    // Users table
    await db.execute('''
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        phone_number TEXT,
        address TEXT,
        profile_image_url TEXT,
        membership_type TEXT DEFAULT 'regular',
        loyalty_points INTEGER DEFAULT 0,
        total_bookings INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0.0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        last_sync_at TEXT
      )
    ''');

    // Vehicles table
    await db.execute('''
      CREATE TABLE vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        vehicle_type TEXT NOT NULL,
        car_model TEXT NOT NULL,
        plate_number TEXT NOT NULL,
        color TEXT,
        year INTEGER,
        is_default INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    ''');

    // Services table
    await db.execute('''
      CREATE TABLE services (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        base_price REAL NOT NULL,
        duration_minutes INTEGER NOT NULL,
        features TEXT,
        image_url TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT
      )
    ''');

    // Branches table
    await db.execute('''
      CREATE TABLE branches (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        phone_number TEXT,
        operating_hours TEXT,
        current_wait_time INTEGER DEFAULT 0,
        rating REAL DEFAULT 0.0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT
      )
    ''');

    // Bookings table
    await db.execute('''
      CREATE TABLE bookings (
        id INTEGER PRIMARY KEY,
        user_id TEXT NOT NULL,
        service_id INTEGER NOT NULL,
        branch_id INTEGER NOT NULL,
        vehicle_id INTEGER,
        scheduled_date TEXT NOT NULL,
        vehicle_type TEXT,
        plate_number TEXT,
        special_instructions TEXT,
        status TEXT DEFAULT 'pending',
        total_amount REAL,
        payment_method TEXT,
        payment_status TEXT DEFAULT 'pending',
        queue_number INTEGER,
        rating INTEGER,
        review_text TEXT,
        created_at TEXT,
        updated_at TEXT,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (service_id) REFERENCES services (id),
        FOREIGN KEY (branch_id) REFERENCES branches (id),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
      )
    ''');

    // QR Check-ins table
    await db.execute('''
      CREATE TABLE qr_checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        branch_id INTEGER NOT NULL,
        qr_code_data TEXT NOT NULL,
        check_in_time TEXT,
        check_out_time TEXT,
        is_active INTEGER DEFAULT 1,
        latitude REAL,
        longitude REAL,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (branch_id) REFERENCES branches (id)
      )
    ''');

    // Vouchers table
    await db.execute('''
      CREATE TABLE vouchers (
        id INTEGER PRIMARY KEY,
        user_id TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        discount_type TEXT NOT NULL,
        discount_value REAL NOT NULL,
        minimum_amount REAL DEFAULT 0.0,
        valid_from TEXT NOT NULL,
        valid_until TEXT NOT NULL,
        is_used INTEGER DEFAULT 0,
        used_at TEXT,
        booking_id INTEGER,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
      )
    ''');

    // Notifications table
    await db.execute('''
      CREATE TABLE notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        action_url TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    ''');

    // Sync queue table for offline support
    await db.execute('''
      CREATE TABLE sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        action TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT,
        synced_at TEXT,
        is_synced INTEGER DEFAULT 0
      )
    ''');

    // Insert sample data
    await _insertSampleData(db);
  }

  static Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Handle database upgrades here
    if (oldVersion < 2) {
      // Add new columns or tables for version 2
    }
  }

  static Future<void> _insertSampleData(Database db) async {
    // Insert sample services
    await db.insert('services', {
      'id': 1,
      'name': 'Quick Wash',
      'description': 'Basic exterior wash and dry',
      'category': 'basic',
      'base_price': 250.0,
      'duration_minutes': 20,
      'features': '["Exterior wash", "Basic drying", "Tire cleaning"]',
      'is_active': 1,
      'created_at': DateTime.now().toIso8601String(),
    });

    await db.insert('services', {
      'id': 2,
      'name': 'Classic Wash',
      'description': 'Complete wash with interior cleaning',
      'category': 'standard',
      'base_price': 450.0,
      'duration_minutes': 45,
      'features': '["Exterior wash & wax", "Interior vacuum", "Window cleaning", "Dashboard care"]',
      'is_active': 1,
      'created_at': DateTime.now().toIso8601String(),
    });

    await db.insert('services', {
      'id': 3,
      'name': 'Premium Wash',
      'description': 'Full service with detailing',
      'category': 'premium',
      'base_price': 850.0,
      'duration_minutes': 90,
      'features': '["Complete exterior detail", "Interior deep clean", "Tire & rim care", "Engine bay clean"]',
      'is_active': 1,
      'created_at': DateTime.now().toIso8601String(),
    });

    await db.insert('services', {
      'id': 4,
      'name': 'Detailing Service',
      'description': 'Professional car detailing',
      'category': 'luxury',
      'base_price': 2500.0,
      'duration_minutes': 180,
      'features': '["Paint correction", "Interior shampooing", "Engine bay detail", "Ceramic coating"]',
      'is_active': 1,
      'created_at': DateTime.now().toIso8601String(),
    });

    // Insert sample branches
    await db.insert('branches', {
      'id': 1,
      'name': 'Fayeed Auto Care - Tumaga',
      'address': 'Tumaga, Zamboanga City, Philippines',
      'latitude': 6.9214,
      'longitude': 122.0790,
      'phone_number': '+63 998 123 4567',
      'operating_hours': '7:00 AM - 7:00 PM',
      'current_wait_time': 15,
      'rating': 4.8,
      'is_active': 1,
      'created_at': DateTime.now().toIso8601String(),
    });

    await db.insert('branches', {
      'id': 2,
      'name': 'Fayeed Auto Care - Boalan',
      'address': 'Boalan, Zamboanga City, Philippines',
      'latitude': 6.9100,
      'longitude': 122.0730,
      'phone_number': '+63 998 765 4321',
      'operating_hours': '7:00 AM - 7:00 PM',
      'current_wait_time': 25,
      'rating': 4.7,
      'is_active': 1,
      'created_at': DateTime.now().toIso8601String(),
    });
  }

  // User operations
  static Future<int> insertUser(Map<String, dynamic> user) async {
    final db = await database;
    user['created_at'] = DateTime.now().toIso8601String();
    user['updated_at'] = DateTime.now().toIso8601String();
    return await db.insert('users', user);
  }

  static Future<Map<String, dynamic>?> getUser(String userId) async {
    final db = await database;
    final result = await db.query(
      'users',
      where: 'id = ?',
      whereArgs: [userId],
    );
    return result.isNotEmpty ? result.first : null;
  }

  static Future<int> updateUser(String userId, Map<String, dynamic> user) async {
    final db = await database;
    user['updated_at'] = DateTime.now().toIso8601String();
    return await db.update(
      'users',
      user,
      where: 'id = ?',
      whereArgs: [userId],
    );
  }

  // Service operations
  static Future<List<Map<String, dynamic>>> getServices() async {
    final db = await database;
    return await db.query(
      'services',
      where: 'is_active = ?',
      whereArgs: [1],
      orderBy: 'category, base_price',
    );
  }

  // Branch operations
  static Future<List<Map<String, dynamic>>> getBranches() async {
    final db = await database;
    return await db.query(
      'branches',
      where: 'is_active = ?',
      whereArgs: [1],
      orderBy: 'name',
    );
  }

  // Booking operations
  static Future<int> insertBooking(Map<String, dynamic> booking) async {
    final db = await database;
    booking['created_at'] = DateTime.now().toIso8601String();
    booking['updated_at'] = DateTime.now().toIso8601String();
    return await db.insert('bookings', booking);
  }

  static Future<List<Map<String, dynamic>>> getUserBookings(String userId) async {
    final db = await database;
    return await db.rawQuery('''
      SELECT b.*, s.name as service_name, br.name as branch_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN branches br ON b.branch_id = br.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT 50
    ''', [userId]);
  }

  static Future<int> updateBookingStatus(int bookingId, String status) async {
    final db = await database;
    final updateData = {
      'status': status,
      'updated_at': DateTime.now().toIso8601String(),
    };
    
    if (status == 'completed') {
      updateData['completed_at'] = DateTime.now().toIso8601String();
    }
    
    return await db.update(
      'bookings',
      updateData,
      where: 'id = ?',
      whereArgs: [bookingId],
    );
  }

  // QR Check-in operations
  static Future<int> insertQRCheckIn(Map<String, dynamic> checkIn) async {
    final db = await database;
    checkIn['created_at'] = DateTime.now().toIso8601String();
    checkIn['check_in_time'] = DateTime.now().toIso8601String();
    return await db.insert('qr_checkins', checkIn);
  }

  static Future<int> checkOutUser(String userId) async {
    final db = await database;
    return await db.update(
      'qr_checkins',
      {
        'check_out_time': DateTime.now().toIso8601String(),
        'is_active': 0,
      },
      where: 'user_id = ? AND is_active = ?',
      whereArgs: [userId, 1],
    );
  }

  // Vehicle operations
  static Future<int> insertVehicle(Map<String, dynamic> vehicle) async {
    final db = await database;
    vehicle['created_at'] = DateTime.now().toIso8601String();
    return await db.insert('vehicles', vehicle);
  }

  static Future<List<Map<String, dynamic>>> getUserVehicles(String userId) async {
    final db = await database;
    return await db.query(
      'vehicles',
      where: 'user_id = ? AND is_active = ?',
      whereArgs: [userId, 1],
      orderBy: 'is_default DESC, created_at DESC',
    );
  }

  // Voucher operations
  static Future<List<Map<String, dynamic>>> getUserVouchers(String userId) async {
    final db = await database;
    return await db.query(
      'vouchers',
      where: 'user_id = ? AND is_used = ? AND valid_until > ?',
      whereArgs: [userId, 0, DateTime.now().toIso8601String()],
      orderBy: 'valid_until ASC',
    );
  }

  // Analytics
  static Future<Map<String, dynamic>> getUserAnalytics(String userId) async {
    final db = await database;
    
    final user = await getUser(userId);
    if (user == null) return {};

    final thisMonth = DateTime.now();
    final thisMonthStart = DateTime(thisMonth.year, thisMonth.month, 1).toIso8601String();
    
    final thisMonthBookings = await db.query(
      'bookings',
      where: 'user_id = ? AND status = ? AND created_at >= ?',
      whereArgs: [userId, 'completed', thisMonthStart],
    );

    return {
      'totalBookings': user['total_bookings'] ?? 0,
      'totalSpent': user['total_spent'] ?? 0.0,
      'loyaltyPoints': user['loyalty_points'] ?? 0,
      'thisMonthBookings': thisMonthBookings.length,
      'membershipType': user['membership_type'] ?? 'regular',
      'memberSince': user['created_at'],
    };
  }

  // Sync operations
  static Future<void> addToSyncQueue(String tableName, String recordId, String action, Map<String, dynamic> data) async {
    final db = await database;
    await db.insert('sync_queue', {
      'table_name': tableName,
      'record_id': recordId,
      'action': action,
      'data': data.toString(),
      'created_at': DateTime.now().toIso8601String(),
      'is_synced': 0,
    });
  }

  static Future<List<Map<String, dynamic>>> getPendingSyncItems() async {
    final db = await database;
    return await db.query(
      'sync_queue',
      where: 'is_synced = ?',
      whereArgs: [0],
      orderBy: 'created_at ASC',
    );
  }

  static Future<void> markAsSynced(int syncId) async {
    final db = await database;
    await db.update(
      'sync_queue',
      {
        'is_synced': 1,
        'synced_at': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [syncId],
    );
  }

  // Database maintenance
  static Future<void> clearOldData() async {
    final db = await database;
    final thirtyDaysAgo = DateTime.now().subtract(const Duration(days: 30)).toIso8601String();
    
    // Clear old synced items
    await db.delete(
      'sync_queue',
      where: 'is_synced = ? AND synced_at < ?',
      whereArgs: [1, thirtyDaysAgo],
    );
    
    // Clear old notifications
    await db.delete(
      'notifications',
      where: 'created_at < ?',
      whereArgs: [thirtyDaysAgo],
    );
  }

  static Future<void> closeDatabase() async {
    final db = _database;
    if (db != null) {
      await db.close();
      _database = null;
    }
  }
}
