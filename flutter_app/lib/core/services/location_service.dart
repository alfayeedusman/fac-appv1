import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

class LocationService {
  static const double _branchProximityRadius = 100.0; // 100 meters

  // Branch coordinates (update with actual coordinates)
  static const Map<String, Map<String, double>> _branchCoordinates = {
    'tumaga': {
      'latitude': 6.9214,
      'longitude': 122.0790,
    },
    'boalan': {
      'latitude': 6.9100,
      'longitude': 122.0730,
    },
  };

  static Future<bool> requestLocationPermission() async {
    final status = await Permission.location.request();
    return status == PermissionStatus.granted;
  }

  static Future<Position?> getCurrentLocation() async {
    try {
      final hasPermission = await requestLocationPermission();
      if (!hasPermission) return null;

      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return null;

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      print('Error getting current location: $e');
      return null;
    }
  }

  static Future<bool> isNearBranch(String branchId) async {
    try {
      final currentPosition = await getCurrentLocation();
      if (currentPosition == null) return false;

      final branchCoords = _branchCoordinates[branchId.toLowerCase()];
      if (branchCoords == null) return false;

      final distance = Geolocator.distanceBetween(
        currentPosition.latitude,
        currentPosition.longitude,
        branchCoords['latitude']!,
        branchCoords['longitude']!,
      );

      return distance <= _branchProximityRadius;
    } catch (e) {
      print('Error checking branch proximity: $e');
      return false;
    }
  }

  static double calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2);
  }

  static String formatDistance(double distanceInMeters) {
    if (distanceInMeters < 1000) {
      return '${distanceInMeters.round()}m';
    } else {
      return '${(distanceInMeters / 1000).toStringAsFixed(1)}km';
    }
  }

  static Future<List<Map<String, dynamic>>> getNearbyBranches() async {
    try {
      final currentPosition = await getCurrentLocation();
      if (currentPosition == null) return [];

      final branches = <Map<String, dynamic>>[];

      for (final entry in _branchCoordinates.entries) {
        final branchId = entry.key;
        final coords = entry.value;
        
        final distance = calculateDistance(
          currentPosition.latitude,
          currentPosition.longitude,
          coords['latitude']!,
          coords['longitude']!,
        );

        branches.add({
          'branchId': branchId,
          'distance': distance,
          'formattedDistance': formatDistance(distance),
          'latitude': coords['latitude'],
          'longitude': coords['longitude'],
        });
      }

      // Sort by distance
      branches.sort((a, b) => a['distance'].compareTo(b['distance']));
      
      return branches;
    } catch (e) {
      print('Error getting nearby branches: $e');
      return [];
    }
  }
}
