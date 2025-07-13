enum BookingStatus {
  pending,
  confirmed,
  inProgress,
  completed,
  cancelled,
}

class BookingModel {
  final String id;
  final String userId;
  final String serviceId;
  final String branchId;
  final DateTime scheduledDate;
  final String vehicleType;
  final String plateNumber;
  final String? specialInstructions;
  final String paymentMethod;
  final BookingStatus status;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final double? totalAmount;
  final String? serviceName;
  final String? branchName;

  BookingModel({
    required this.id,
    required this.userId,
    required this.serviceId,
    required this.branchId,
    required this.scheduledDate,
    required this.vehicleType,
    required this.plateNumber,
    this.specialInstructions,
    required this.paymentMethod,
    required this.status,
    required this.createdAt,
    this.updatedAt,
    this.totalAmount,
    this.serviceName,
    this.branchName,
  });

  factory BookingModel.fromMap(Map<String, dynamic> map) {
    return BookingModel(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      serviceId: map['serviceId'] ?? '',
      branchId: map['branchId'] ?? '',
      scheduledDate: DateTime.fromMillisecondsSinceEpoch(map['scheduledDate'] ?? 0),
      vehicleType: map['vehicleType'] ?? '',
      plateNumber: map['plateNumber'] ?? '',
      specialInstructions: map['specialInstructions'],
      paymentMethod: map['paymentMethod'] ?? '',
      status: BookingStatus.values.firstWhere(
        (e) => e.toString() == map['status'],
        orElse: () => BookingStatus.pending,
      ),
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['createdAt'] ?? 0),
      updatedAt: map['updatedAt'] != null 
          ? DateTime.fromMillisecondsSinceEpoch(map['updatedAt'])
          : null,
      totalAmount: map['totalAmount']?.toDouble(),
      serviceName: map['serviceName'],
      branchName: map['branchName'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'serviceId': serviceId,
      'branchId': branchId,
      'scheduledDate': scheduledDate.millisecondsSinceEpoch,
      'vehicleType': vehicleType,
      'plateNumber': plateNumber,
      'specialInstructions': specialInstructions,
      'paymentMethod': paymentMethod,
      'status': status.toString(),
      'createdAt': createdAt.millisecondsSinceEpoch,
      'updatedAt': updatedAt?.millisecondsSinceEpoch,
      'totalAmount': totalAmount,
      'serviceName': serviceName,
      'branchName': branchName,
    };
  }

  BookingModel copyWith({
    String? id,
    String? userId,
    String? serviceId,
    String? branchId,
    DateTime? scheduledDate,
    String? vehicleType,
    String? plateNumber,
    String? specialInstructions,
    String? paymentMethod,
    BookingStatus? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    double? totalAmount,
    String? serviceName,
    String? branchName,
  }) {
    return BookingModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      serviceId: serviceId ?? this.serviceId,
      branchId: branchId ?? this.branchId,
      scheduledDate: scheduledDate ?? this.scheduledDate,
      vehicleType: vehicleType ?? this.vehicleType,
      plateNumber: plateNumber ?? this.plateNumber,
      specialInstructions: specialInstructions ?? this.specialInstructions,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      totalAmount: totalAmount ?? this.totalAmount,
      serviceName: serviceName ?? this.serviceName,
      branchName: branchName ?? this.branchName,
    );
  }

  String get statusText {
    switch (status) {
      case BookingStatus.pending:
        return 'Pending';
      case BookingStatus.confirmed:
        return 'Confirmed';
      case BookingStatus.inProgress:
        return 'In Progress';
      case BookingStatus.completed:
        return 'Completed';
      case BookingStatus.cancelled:
        return 'Cancelled';
    }
  }
}
