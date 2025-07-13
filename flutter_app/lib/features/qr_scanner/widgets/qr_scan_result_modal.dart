import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/models/qr_scan_result.dart';
import '../../../core/providers/qr_provider.dart';
import '../../../core/services/database_service.dart';

class QRScanResultModal extends StatelessWidget {
  final QRScanResult result;
  final VoidCallback onClose;

  const QRScanResultModal({
    super.key,
    required this.result,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Success Icon
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle,
                color: AppColors.success,
                size: 48,
              ),
            ),
            const SizedBox(height: 24),
            
            // Title
            Text(
              _getTitle(),
              style: AppTextStyles.heading2.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.success,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            
            // Description
            Text(
              _getDescription(),
              style: AppTextStyles.body.copyWith(
                color: AppColors.grey600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            
            // Details Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.grey50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.grey200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildDetailRow('Type', _getTypeText()),
                  if (result.branchId != null) ...[
                    const SizedBox(height: 8),
                    _buildDetailRow('Branch', _getBranchName()),
                  ],
                  if (result.serviceId != null) ...[
                    const SizedBox(height: 8),
                    _buildDetailRow('Service', result.serviceId!),
                  ],
                  const SizedBox(height: 8),
                  _buildDetailRow('Time', _formatTime()),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Action Buttons
            Row(
              children: [
                if (result.type == QRType.branchCheckIn) ...[
                  Expanded(
                    child: Consumer<QRProvider>(
                      builder: (context, qrProvider, child) {
                        return ElevatedButton(
                          onPressed: qrProvider.isProcessing
                              ? null
                              : () async {
                                  await qrProvider.checkOut();
                                  onClose();
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.error,
                          ),
                          child: qrProvider.isProcessing
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      AppColors.white,
                                    ),
                                  ),
                                )
                              : const Text('Check Out'),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: ElevatedButton(
                    onPressed: onClose,
                    child: const Text('Done'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTextStyles.bodySmall.copyWith(
            color: AppColors.grey600,
          ),
        ),
        Text(
          value,
          style: AppTextStyles.bodySmall.copyWith(
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  String _getTitle() {
    switch (result.type) {
      case QRType.branchCheckIn:
        return 'Check-in Successful!';
      case QRType.serviceActivation:
        return 'Service Activated!';
    }
  }

  String _getDescription() {
    switch (result.type) {
      case QRType.branchCheckIn:
        return 'You have successfully checked in to the branch. You can now activate services or book appointments.';
      case QRType.serviceActivation:
        return 'Your service has been activated. Please proceed to the service area and wait for staff assistance.';
    }
  }

  String _getTypeText() {
    switch (result.type) {
      case QRType.branchCheckIn:
        return 'Branch Check-in';
      case QRType.serviceActivation:
        return 'Service Activation';
    }
  }

  String _getBranchName() {
    switch (result.branchId?.toLowerCase()) {
      case 'tumaga':
        return 'Fayeed Auto Care - Tumaga';
      case 'boalan':
        return 'Fayeed Auto Care - Boalan';
      default:
        return result.branchId ?? 'Unknown Branch';
    }
  }

  String _formatTime() {
    final time = result.scannedAt;
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }
}
