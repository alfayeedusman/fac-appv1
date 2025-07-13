import 'package:flutter/foundation.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';

import '../models/qr_scan_result.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';

class QRProvider extends ChangeNotifier {
  QRScanResult? _lastScanResult;
  bool _isProcessing = false;
  String? _errorMessage;
  bool _isCheckedIn = false;
  String? _currentBranch;

  QRScanResult? get lastScanResult => _lastScanResult;
  bool get isProcessing => _isProcessing;
  String? get errorMessage => _errorMessage;
  bool get isCheckedIn => _isCheckedIn;
  String? get currentBranch => _currentBranch;

  Future<bool> processQRCode(Barcode barcode) async {
    try {
      _setProcessing(true);
      _clearError();

      final qrData = barcode.code;
      if (qrData == null || qrData.isEmpty) {
        _setError('Invalid QR code');
        return false;
      }

      // Parse QR code data
      final qrResult = _parseQRCode(qrData);
      if (qrResult == null) {
        _setError('QR code format not recognized');
        return false;
      }

      // Validate location if it's a branch check-in
      if (qrResult.type == QRType.branchCheckIn) {
        final isNearBranch = await LocationService.isNearBranch(qrResult.branchId!);
        if (!isNearBranch) {
          _setError('You must be near the branch to check in');
          return false;
        }
      }

      // Process with API
      final success = await _processWithAPI(qrResult);
      
      if (success) {
        _lastScanResult = qrResult;
        
        if (qrResult.type == QRType.branchCheckIn) {
          _isCheckedIn = true;
          _currentBranch = qrResult.branchId;
        }
        
        return true;
      }
      
      return false;
    } catch (e) {
      _setError('Failed to process QR code: $e');
      return false;
    } finally {
      _setProcessing(false);
    }
  }

  QRScanResult? _parseQRCode(String qrData) {
    try {
      // Branch check-in format: "branch_{branchId}_{timestamp}"
      if (qrData.startsWith('branch_')) {
        final parts = qrData.split('_');
        if (parts.length >= 3) {
          return QRScanResult(
            type: QRType.branchCheckIn,
            branchId: parts[1],
            timestamp: parts[2],
            rawData: qrData,
          );
        }
      }
      
      // Service activation format: "service_{serviceId}_{branchId}"
      if (qrData.startsWith('service_')) {
        final parts = qrData.split('_');
        if (parts.length >= 3) {
          return QRScanResult(
            type: QRType.serviceActivation,
            serviceId: parts[1],
            branchId: parts[2],
            rawData: qrData,
          );
        }
      }
      
      return null;
    } catch (e) {
      debugPrint('Error parsing QR code: $e');
      return null;
    }
  }

  Future<bool> _processWithAPI(QRScanResult qrResult) async {
    try {
      switch (qrResult.type) {
        case QRType.branchCheckIn:
          return await ApiService.checkInToBranch(qrResult.branchId!);
        case QRType.serviceActivation:
          return await ApiService.activateService(
            qrResult.serviceId!,
            qrResult.branchId!,
          );
      }
    } catch (e) {
      _setError('API error: $e');
      return false;
    }
  }

  Future<void> checkOut() async {
    try {
      _setProcessing(true);
      _clearError();
      
      final success = await ApiService.checkOutFromBranch();
      if (success) {
        _isCheckedIn = false;
        _currentBranch = null;
        _lastScanResult = null;
      } else {
        _setError('Failed to check out');
      }
    } catch (e) {
      _setError('Check out failed: $e');
    } finally {
      _setProcessing(false);
    }
  }

  void _setProcessing(bool processing) {
    _isProcessing = processing;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void clearLastScan() {
    _lastScanResult = null;
    _clearError();
    notifyListeners();
  }
}
