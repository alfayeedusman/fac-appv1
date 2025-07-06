enum QRType {
  branchCheckIn,
  serviceActivation,
}

class QRScanResult {
  final QRType type;
  final String? branchId;
  final String? serviceId;
  final String? timestamp;
  final String rawData;
  final DateTime scannedAt;

  QRScanResult({
    required this.type,
    this.branchId,
    this.serviceId,
    this.timestamp,
    required this.rawData,
    DateTime? scannedAt,
  }) : scannedAt = scannedAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'type': type.toString(),
      'branchId': branchId,
      'serviceId': serviceId,
      'timestamp': timestamp,
      'rawData': rawData,
      'scannedAt': scannedAt.millisecondsSinceEpoch,
    };
  }

  factory QRScanResult.fromMap(Map<String, dynamic> map) {
    return QRScanResult(
      type: QRType.values.firstWhere(
        (e) => e.toString() == map['type'],
        orElse: () => QRType.branchCheckIn,
      ),
      branchId: map['branchId'],
      serviceId: map['serviceId'],
      timestamp: map['timestamp'],
      rawData: map['rawData'] ?? '',
      scannedAt: DateTime.fromMillisecondsSinceEpoch(map['scannedAt'] ?? 0),
    );
  }
}
