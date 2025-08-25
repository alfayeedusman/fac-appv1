class UserModel {
  final String id;
  final String email;
  final String fullName;
  final String? phone;
  final String? profileImage;
  final String userRole;
  final DateTime createdAt;
  final DateTime? lastLogin;
  final bool isActive;
  final UserSubscription? subscription;
  final UserGameStats? gameStats;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    this.phone,
    this.profileImage,
    required this.userRole,
    required this.createdAt,
    this.lastLogin,
    this.isActive = true,
    this.subscription,
    this.gameStats,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? '',
      phone: json['phone'],
      profileImage: json['profileImage'],
      userRole: json['userRole'] ?? 'customer',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      lastLogin: json['lastLogin'] != null ? DateTime.parse(json['lastLogin']) : null,
      isActive: json['isActive'] ?? true,
      subscription: json['subscription'] != null 
          ? UserSubscription.fromJson(json['subscription']) 
          : null,
      gameStats: json['gameStats'] != null 
          ? UserGameStats.fromJson(json['gameStats']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'phone': phone,
      'profileImage': profileImage,
      'userRole': userRole,
      'createdAt': createdAt.toIso8601String(),
      'lastLogin': lastLogin?.toIso8601String(),
      'isActive': isActive,
      'subscription': subscription?.toJson(),
      'gameStats': gameStats?.toJson(),
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? fullName,
    String? phone,
    String? profileImage,
    String? userRole,
    DateTime? createdAt,
    DateTime? lastLogin,
    bool? isActive,
    UserSubscription? subscription,
    UserGameStats? gameStats,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      profileImage: profileImage ?? this.profileImage,
      userRole: userRole ?? this.userRole,
      createdAt: createdAt ?? this.createdAt,
      lastLogin: lastLogin ?? this.lastLogin,
      isActive: isActive ?? this.isActive,
      subscription: subscription ?? this.subscription,
      gameStats: gameStats ?? this.gameStats,
    );
  }

  bool get isAdmin => userRole == 'admin' || userRole == 'superadmin';
  bool get isCustomer => userRole == 'customer';
  bool get hasActiveSubscription => subscription?.isActive ?? false;
  String get packageType => subscription?.packageType ?? 'Regular Member';
}

class UserSubscription {
  final String packageType;
  final DateTime currentCycleStart;
  final DateTime currentCycleEnd;
  final int daysLeft;
  final bool autoRenewal;
  final RemainingWashes remainingWashes;
  final TotalWashes totalWashes;

  UserSubscription({
    required this.packageType,
    required this.currentCycleStart,
    required this.currentCycleEnd,
    required this.daysLeft,
    required this.autoRenewal,
    required this.remainingWashes,
    required this.totalWashes,
  });

  factory UserSubscription.fromJson(Map<String, dynamic> json) {
    return UserSubscription(
      packageType: json['packageType'] ?? 'Regular Member',
      currentCycleStart: DateTime.parse(json['currentCycleStart']),
      currentCycleEnd: DateTime.parse(json['currentCycleEnd']),
      daysLeft: json['daysLeft'] ?? 0,
      autoRenewal: json['autoRenewal'] ?? false,
      remainingWashes: RemainingWashes.fromJson(json['remainingWashes'] ?? {}),
      totalWashes: TotalWashes.fromJson(json['totalWashes'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'packageType': packageType,
      'currentCycleStart': currentCycleStart.toIso8601String(),
      'currentCycleEnd': currentCycleEnd.toIso8601String(),
      'daysLeft': daysLeft,
      'autoRenewal': autoRenewal,
      'remainingWashes': remainingWashes.toJson(),
      'totalWashes': totalWashes.toJson(),
    };
  }

  bool get isActive => daysLeft > 0 && packageType != 'Regular Member';
  bool get isExpiring => daysLeft <= 7 && daysLeft > 0;
  bool get isExpired => daysLeft <= 0;
}

class RemainingWashes {
  final int classic;
  final int vipProMax;
  final int premium;

  RemainingWashes({
    required this.classic,
    required this.vipProMax,
    required this.premium,
  });

  factory RemainingWashes.fromJson(Map<String, dynamic> json) {
    return RemainingWashes(
      classic: json['classic'] ?? 0,
      vipProMax: json['vipProMax'] ?? 0,
      premium: json['premium'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'classic': classic,
      'vipProMax': vipProMax,
      'premium': premium,
    };
  }
}

class TotalWashes {
  final int classic;
  final int vipProMax;
  final int premium;

  TotalWashes({
    required this.classic,
    required this.vipProMax,
    required this.premium,
  });

  factory TotalWashes.fromJson(Map<String, dynamic> json) {
    return TotalWashes(
      classic: json['classic'] ?? 0,
      vipProMax: json['vipProMax'] ?? 0,
      premium: json['premium'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'classic': classic,
      'vipProMax': vipProMax,
      'premium': premium,
    };
  }
}

class UserGameStats {
  final int level;
  final int xp;
  final int xpForNextLevel;
  final int totalBookings;
  final int loyaltyPoints;
  final List<String> achievements;

  UserGameStats({
    required this.level,
    required this.xp,
    required this.xpForNextLevel,
    required this.totalBookings,
    required this.loyaltyPoints,
    required this.achievements,
  });

  factory UserGameStats.fromJson(Map<String, dynamic> json) {
    return UserGameStats(
      level: json['level'] ?? 1,
      xp: json['xp'] ?? 0,
      xpForNextLevel: json['xpForNextLevel'] ?? 100,
      totalBookings: json['totalBookings'] ?? 0,
      loyaltyPoints: json['loyaltyPoints'] ?? 0,
      achievements: List<String>.from(json['achievements'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'level': level,
      'xp': xp,
      'xpForNextLevel': xpForNextLevel,
      'totalBookings': totalBookings,
      'loyaltyPoints': loyaltyPoints,
      'achievements': achievements,
    };
  }
}
