class ServiceModel {
  final String id;
  final String name;
  final String description;
  final double basePrice;
  final int duration; // in minutes
  final String category;
  final List<String> features;
  final String? imageUrl;
  final bool isActive;

  ServiceModel({
    required this.id,
    required this.name,
    required this.description,
    required this.basePrice,
    required this.duration,
    required this.category,
    this.features = const [],
    this.imageUrl,
    this.isActive = true,
  });

  factory ServiceModel.fromMap(Map<String, dynamic> map) {
    return ServiceModel(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      description: map['description'] ?? '',
      basePrice: (map['basePrice'] ?? 0).toDouble(),
      duration: map['duration'] ?? 0,
      category: map['category'] ?? '',
      features: List<String>.from(map['features'] ?? []),
      imageUrl: map['imageUrl'],
      isActive: map['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'basePrice': basePrice,
      'duration': duration,
      'category': category,
      'features': features,
      'imageUrl': imageUrl,
      'isActive': isActive,
    };
  }

  String get formattedPrice => '₱${basePrice.toStringAsFixed(0)}';
  
  String get formattedDuration {
    if (duration < 60) {
      return '${duration} mins';
    } else {
      final hours = duration ~/ 60;
      final minutes = duration % 60;
      if (minutes == 0) {
        return '${hours}h';
      } else {
        return '${hours}h ${minutes}m';
      }
    }
  }
}
