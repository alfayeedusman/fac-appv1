import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/providers/qr_provider.dart';
import '../widgets/qr_scan_result_modal.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final GlobalKey _qrKey = GlobalKey(debugLabel: 'QR');
  QRViewController? _controller;
  bool _isFlashOn = false;
  bool _hasPermission = false;

  @override
  void initState() {
    super.initState();
    _requestPermission();
  }

  Future<void> _requestPermission() async {
    final status = await Permission.camera.request();
    setState(() {
      _hasPermission = status == PermissionStatus.granted;
    });
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  void _onQRViewCreated(QRViewController controller) {
    setState(() {
      _controller = controller;
    });
    
    controller.scannedDataStream.listen((scanData) async {
      await controller.pauseCamera();
      await _processScanResult(scanData);
    });
  }

  Future<void> _processScanResult(Barcode scanData) async {
    final qrProvider = context.read<QRProvider>();
    final success = await qrProvider.processQRCode(scanData);
    
    if (mounted) {
      if (success) {
        await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => QRScanResultModal(
            result: qrProvider.lastScanResult!,
            onClose: () {
              Navigator.of(context).pop();
              context.pop();
            },
          ),
        );
      } else {
        // Show error and resume scanning
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(qrProvider.errorMessage ?? 'Failed to process QR code'),
            backgroundColor: AppColors.error,
          ),
        );
        await _controller?.resumeCamera();
      }
    }
  }

  Future<void> _toggleFlash() async {
    await _controller?.toggleFlash();
    setState(() {
      _isFlashOn = !_isFlashOn;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_hasPermission) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('QR Scanner'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.camera_alt_outlined,
                size: 64,
                color: AppColors.grey400,
              ),
              const SizedBox(height: 16),
              Text(
                'Camera Permission Required',
                style: AppTextStyles.heading3,
              ),
              const SizedBox(height: 8),
              Text(
                'Please allow camera access to scan QR codes',
                style: AppTextStyles.body.copyWith(
                  color: AppColors.grey600,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _requestPermission,
                child: const Text('Grant Permission'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.black,
      body: Stack(
        children: [
          // QR Scanner View
          QRView(
            key: _qrKey,
            onQRViewCreated: _onQRViewCreated,
            overlay: QrScannerOverlayShape(
              borderColor: AppColors.primaryOrange,
              borderRadius: 16,
              borderLength: 30,
              borderWidth: 4,
              cutOutSize: 250,
            ),
          ),
          
          // Top Bar
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(
                      Icons.arrow_back,
                      color: AppColors.white,
                      size: 28,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      'Scan QR Code',
                      style: AppTextStyles.heading3.copyWith(
                        color: AppColors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  IconButton(
                    onPressed: _toggleFlash,
                    icon: Icon(
                      _isFlashOn ? Icons.flash_on : Icons.flash_off,
                      color: AppColors.white,
                      size: 28,
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Bottom Instructions
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    AppColors.black.withOpacity(0.8),
                    Colors.transparent,
                  ],
                ),
              ),
              child: SafeArea(
                child: Column(
                  children: [
                    Icon(
                      Icons.qr_code_scanner,
                      color: AppColors.white.withOpacity(0.8),
                      size: 48,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Position QR code within the frame',
                      style: AppTextStyles.body.copyWith(
                        color: AppColors.white,
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'The QR code will be scanned automatically',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.white.withOpacity(0.7),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Loading Overlay
          Consumer<QRProvider>(
            builder: (context, qrProvider, child) {
              if (!qrProvider.isProcessing) return const SizedBox.shrink();
              
              return Container(
                color: AppColors.black.withOpacity(0.7),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(
                          AppColors.primaryOrange,
                        ),
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Processing QR Code...',
                        style: TextStyle(
                          color: AppColors.white,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
