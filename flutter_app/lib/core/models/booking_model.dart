class BookingModel {
  final String id;
  final String userId;
  final String customerName;
  final String customerEmail;
  final String customerPhone;
  final String vehicleType;
  final String vehiclePlate;
  final String serviceType;
  final String packageType;
  final String branch;
  final String branchId;
  final DateTime preferredDate;
  final String preferredTime;
  final String status;
  final double totalAmount;
  final String paymentStatus;
  final String? paymentMethod;
  final String? specialRequests;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? completedBy;
  final DateTime? completedAt;
  final int? rating;
  final String? feedback;
  final QRScanData? qrScanData;

  BookingModel({
    required this.id,
    required this.userId,
    required this.customerName,
    required this.customerEmail,
    required this.customerPhone,
    required this.vehicleType,
    required this.vehiclePlate,
    required this.serviceType,
    required this.packageType,
    required this.branch,
    required this.branchId,
    required this.preferredDate,
    required this.preferredTime,
    required this.status,
    required this.totalAmount,
    required this.paymentStatus,
    this.paymentMethod,
    this.specialRequests,
    required this.createdAt,
    this.updatedAt,
    this.completedBy,
    this.completedAt,
    this.rating,
    this.feedback,
    this.qrScanData,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      customerName: json['customerName'] ?? '',
      customerEmail: json['customerEmail'] ?? '',
      customerPhone: json['customerPhone'] ?? '',
      vehicleType: json['vehicleType'] ?? '',
      vehiclePlate: json['vehiclePlate'] ?? '',
      serviceType: json['serviceType'] ?? '',
      packageType: json['packageType'] ?? '',
      branch: json['branch'] ?? '',
      branchId: json['branchId'] ?? '',
      preferredDate: DateTime.parse(json['preferredDate']),
      preferredTime: json['preferredTime'] ?? '',
      status: json['status'] ?? 'pending',
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      paymentStatus: json['paymentStatus'] ?? 'pending',
      paymentMethod: json['paymentMethod'],
      specialRequests: json['specialRequests'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
      completedBy: json['completedBy'],
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt']) : null,
      rating: json['rating'],
      feedback: json['feedback'],
      qrScanData: json['qrScanData'] != null ? QRScanData.fromJson(json['qrScanData']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'customerName': customerName,
      'customerEmail': customerEmail,
      'customerPhone': customerPhone,
      'vehicleType': vehicleType,
      'vehiclePlate': vehiclePlate,
      'serviceType': serviceType,
      'packageType': packageType,
      'branch': branch,
      'branchId': branchId,
      'preferredDate': preferredDate.toIso8601String(),
      'preferredTime': preferredTime,
      'status': status,
      'totalAmount': totalAmount,
      'paymentStatus': paymentStatus,
      'paymentMethod': paymentMethod,
      'specialRequests': specialRequests,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'completedBy': completedBy,
      'completedAt': completedAt?.toIso8601String(),
      'rating': rating,
      'feedback': feedback,
      'qrScanData': qrScanData?.toJson(),
    };
  }

  BookingModel copyWith({
    String? id,
    String? userId,
    String? customerName,
    String? customerEmail,
    String? customerPhone,
    String? vehicleType,
    String? vehiclePlate,
    String? serviceType,
    String? packageType,
    String? branch,
    String? branchId,
    DateTime? preferredDate,
    String? preferredTime,
    String? status,
    double? totalAmount,
    String? paymentStatus,
    String? paymentMethod,
    String? specialRequests,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? completedBy,
    DateTime? completedAt,
    int? rating,
    String? feedback,
    QRScanData? qrScanData,
  }) {
    return BookingModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      customerName: customerName ?? this.customerName,
      customerEmail: customerEmail ?? this.customerEmail,
      customerPhone: customerPhone ?? this.customerPhone,
      vehicleType: vehicleType ?? this.vehicleType,
      vehiclePlate: vehiclePlate ?? this.vehiclePlate,
      serviceType: serviceType ?? this.serviceType,
      packageType: packageType ?? this.packageType,
      branch: branch ?? this.branch,
      branchId: branchId ?? this.branchId,
      preferredDate: preferredDate ?? this.preferredDate,
      preferredTime: preferredTime ?? this.preferredTime,
      status: status ?? this.status,
      totalAmount: totalAmount ?? this.totalAmount,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      specialRequests: specialRequests ?? this.specialRequests,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      completedBy: completedBy ?? this.completedBy,
      completedAt: completedAt ?? this.completedAt,
      rating: rating ?? this.rating,
      feedback: feedback ?? this.feedback,
      qrScanData: qrScanData ?? this.qrScanData,
    );
  }

  bool get isPending => status == 'pending';
  bool get isConfirmed => status == 'confirmed';
  bool get isInProgress => status == 'in_progress';
  bool get isCompleted => status == 'completed';
  bool get isCancelled => status == 'cancelled';
  
  bool get isPaymentPending => paymentStatus == 'pending';
  bool get isPaymentCompleted => paymentStatus == 'completed';
  bool get isPaymentFailed => paymentStatus == 'failed';
  
  String get statusDisplayName {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }
}

class QRScanData {
  final String type;
  final String? branchId;
  final String? branchName;
  final String? serviceId;
  final String? customerId;
  final DateTime timestamp;

  QRScanData({
    required this.type,
    this.branchId,
    this.branchName,
    this.serviceId,
    this.customerId,
    required this.timestamp,
  });

  factory QRScanData.fromJson(Map<String, dynamic> json) {
    return QRScanData(
      type: json['type'] ?? '',
      branchId: json['branchId'],
      branchName: json['branchName'],
      serviceId: json['serviceId'],
      customerId: json['customerId'],
      timestamp: DateTime.parse(json['timestamp']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'branchId': branchId,
      'branchName': branchName,
      'serviceId': serviceId,
      'customerId': customerId,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

// Service Types
class ServiceType {
  static const String classic = 'classic';
  static const String vipProMax = 'vip_pro_max';
  static const String premium = 'premium';
  
  static const Map<String, String> displayNames = {
    classic: 'Classic Wash',
    vipProMax: 'VIP ProMax',
    premium: 'Premium Wash',
  };
  
  static const Map<String, double> prices = {
    classic: 150.0,
    vipProMax: 250.0,
    premium: 400.0,
  };
}

// Vehicle Types
class VehicleType {
  static const String car = 'car';
  static const String motorcycle = 'motorcycle';
  static const String suv = 'suv';
  static const String van = 'van';
  
  static const Map<String, String> displayNames = {
    car: 'Car',
    motorcycle: 'Motorcycle',
    suv: 'SUV',
    van: 'Van',
  };
}

// Booking Status
class BookingStatus {
  static const String pending = 'pending';
  static const String confirmed = 'confirmed';
  static const String inProgress = 'in_progress';
  static const String completed = 'completed';
  static const String cancelled = 'cancelled';
}

// Payment Status
class PaymentStatus {
  static const String pending = 'pending';
  static const String completed = 'completed';
  static const String failed = 'failed';
  static const String refunded = 'refunded';
}
