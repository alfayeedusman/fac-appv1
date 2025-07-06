class BranchModel {
  final String id;
  final String name;
  final String address;
  final double latitude;
  final double longitude;
  final String phoneNumber;
  final String operatingHours;
  final List<String> availableServices;
  final bool isActive;
  final int currentWaitTime; // in minutes
  final double rating;

  BranchModel({
    required this.id,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.phoneNumber,
    required this.operatingHours,
    this.availableServices = const [],
    this.isActive = true,
    this.currentWaitTime = 0,
    this.rating = 0.0,
  });

  factory BranchModel.fromMap(Map<String, dynamic> map) {
    return BranchModel(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      address: map['address'] ?? '',
      latitude: (map['latitude'] ?? 0.0).toDouble(),
      longitude: (map['longitude'] ?? 0.0).toDouble(),
      phoneNumber: map['phoneNumber'] ?? '',
      operatingHours: map['operatingHours'] ?? '',
      availableServices: List<String>.from(map['availableServices'] ?? []),
      isActive: map['isActive'] ?? true,
      currentWaitTime: map['currentWaitTime'] ?? 0,
      rating: (map['rating'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'phoneNumber': phoneNumber,
      'operatingHours': operatingHours,
      'availableServices': availableServices,
      'isActive': isActive,
      'currentWaitTime': currentWaitTime,
      'rating': rating,
    };
  }

  String get waitTimeText {
    if (currentWaitTime == 0) {
      return 'No wait';
    } else if (currentWaitTime < 60) {
      return '${currentWaitTime} min wait';
    } else {
      final hours = currentWaitTime ~/ 60;
      final minutes = currentWaitTime % 60;
      return '${hours}h ${minutes}m wait';
    }
  }

  String get ratingText => rating > 0 ? rating.toStringAsFixed(1) : 'No rating';
}
