class UserModel {
  final String uid;
  final String email;
  final String fullName;
  final String phoneNumber;
  final String address;
  final String vehicleType;
  final String carModel;
  final String plateNumber;
  final String preferredBranch;
  final String membershipType;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? profileImageUrl;

  UserModel({
    required this.uid,
    required this.email,
    required this.fullName,
    required this.phoneNumber,
    required this.address,
    required this.vehicleType,
    required this.carModel,
    required this.plateNumber,
    required this.preferredBranch,
    required this.membershipType,
    required this.createdAt,
    this.updatedAt,
    this.profileImageUrl,
  });

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      uid: map['uid'] ?? '',
      email: map['email'] ?? '',
      fullName: map['fullName'] ?? '',
      phoneNumber: map['phoneNumber'] ?? '',
      address: map['address'] ?? '',
      vehicleType: map['vehicleType'] ?? '',
      carModel: map['carModel'] ?? '',
      plateNumber: map['plateNumber'] ?? '',
      preferredBranch: map['preferredBranch'] ?? '',
      membershipType: map['membershipType'] ?? 'Regular',
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['createdAt'] ?? 0),
      updatedAt: map['updatedAt'] != null 
          ? DateTime.fromMillisecondsSinceEpoch(map['updatedAt'])
          : null,
      profileImageUrl: map['profileImageUrl'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'fullName': fullName,
      'phoneNumber': phoneNumber,
      'address': address,
      'vehicleType': vehicleType,
      'carModel': carModel,
      'plateNumber': plateNumber,
      'preferredBranch': preferredBranch,
      'membershipType': membershipType,
      'createdAt': createdAt.millisecondsSinceEpoch,
      'updatedAt': updatedAt?.millisecondsSinceEpoch,
      'profileImageUrl': profileImageUrl,
    };
  }

  UserModel copyWith({
    String? uid,
    String? email,
    String? fullName,
    String? phoneNumber,
    String? address,
    String? vehicleType,
    String? carModel,
    String? plateNumber,
    String? preferredBranch,
    String? membershipType,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? profileImageUrl,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      address: address ?? this.address,
      vehicleType: vehicleType ?? this.vehicleType,
      carModel: carModel ?? this.carModel,
      plateNumber: plateNumber ?? this.plateNumber,
      preferredBranch: preferredBranch ?? this.preferredBranch,
      membershipType: membershipType ?? this.membershipType,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
    );
  }
}
