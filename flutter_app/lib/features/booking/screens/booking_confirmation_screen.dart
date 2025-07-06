import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/services/database_service.dart';
import '../../../core/models/booking_model.dart';

class BookingConfirmationScreen extends StatefulWidget {
  final String bookingId;

  const BookingConfirmationScreen({
    super.key,
    required this.bookingId,
  });

  @override
  State<BookingConfirmationScreen> createState() => _BookingConfirmationScreenState();
}

class _BookingConfirmationScreenState extends State<BookingConfirmationScreen>
    with TickerProviderStateMixin {
  late AnimationController _successController;
  late AnimationController _slideController;
  late Animation<double> _successAnimation;
  late Animation<Offset> _slideAnimation;

  BookingModel? _booking;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _loadBookingDetails();
  }

  void _setupAnimations() {
    _successController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _successAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _successController,
      curve: Curves.elasticOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutCubic,
    ));

    _successController.forward();
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) _slideController.forward();
    });
  }

  Future<void> _loadBookingDetails() async {
    try {
      // In a real app, you would fetch booking details by ID
      // For now, we'll create a mock booking
      await Future.delayed(const Duration(milliseconds: 500));
      
      setState(() {
        _booking = BookingModel(
          id: widget.bookingId,
          userId: 'current_user',
          serviceId: 'classic_wash',
          branchId: 'tumaga',
          scheduledDate: DateTime.now().add(const Duration(days: 1)),
          vehicleType: 'Sedan',
          plateNumber: 'ABC 123',
          paymentMethod: 'credit_card',
          status: BookingStatus.pending,
          createdAt: DateTime.now(),
          totalAmount: 450.0,
          serviceName: 'Classic Wash',
          branchName: 'Fayeed Auto Care - Tumaga',
        );
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading booking: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _successController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryOrange),
          ),
        ),
      );
    }

    if (_booking == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Booking Error'),
        ),
        body: const Center(
          child: Text('Failed to load booking details'),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 40),
              
              // Success Animation
              AnimatedBuilder(
                animation: _successAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _successAnimation.value,
                    child: Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: AppColors.success.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check_circle,
                        color: AppColors.success,
                        size: 60,
                      ),
                    ),
                  );
                },
              ),
              
              const SizedBox(height: 32),
              
              // Success Message
              SlideTransition(
                position: _slideAnimation,
                child: Column(
                  children: [
                    Text(
                      'Booking Confirmed!',
                      style: AppTextStyles.heading1.copyWith(
                        color: AppColors.success,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Your car wash service has been successfully booked',
                      style: AppTextStyles.body.copyWith(
                        color: AppColors.grey600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 40),
              
              // Booking Details Card
              SlideTransition(
                position: _slideAnimation,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.grey200),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.grey200.withOpacity(0.5),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: AppColors.primaryOrange.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.receipt,
                              color: AppColors.primaryOrange,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Booking Details',
                                  style: AppTextStyles.heading3.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'ID: ${_booking!.id}',
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.grey500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: _getStatusColor().withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _booking!.statusText,
                              style: AppTextStyles.caption.copyWith(
                                color: _getStatusColor(),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Service Details
                      _buildDetailSection(
                        'Service Information',
                        [
                          _buildDetailRow('Service', _booking!.serviceName ?? 'N/A'),
                          _buildDetailRow('Vehicle', '${_booking!.vehicleType} (${_booking!.plateNumber})'),
                          _buildDetailRow('Amount', '₱${_booking!.totalAmount?.toStringAsFixed(0) ?? '0'}'),
                        ],
                      ),
                      
                      const SizedBox(height: 20),
                      
                      // Schedule Details
                      _buildDetailSection(
                        'Schedule & Location',
                        [
                          _buildDetailRow('Branch', _booking!.branchName ?? 'N/A'),
                          _buildDetailRow('Date', DateFormat('EEEE, MMMM d, y').format(_booking!.scheduledDate)),
                          _buildDetailRow('Time', DateFormat('h:mm a').format(_booking!.scheduledDate)),
                        ],
                      ),
                      
                      const SizedBox(height: 20),
                      
                      // Payment Details
                      _buildDetailSection(
                        'Payment Information',
                        [
                          _buildDetailRow('Payment Method', _getPaymentMethodText()),
                          _buildDetailRow('Status', 'Pending'),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Important Notes
              SlideTransition(
                position: _slideAnimation,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.info.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.info.withOpacity(0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.info_outline,
                            color: AppColors.info,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Important Notes',
                            style: AppTextStyles.body.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.info,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '• Please arrive 10 minutes before your scheduled time\n'
                        '• Bring your vehicle registration documents\n'
                        '• Use QR scanner to check-in at the branch\n'
                        '• Contact support if you need to reschedule',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.info,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Action Buttons
              SlideTransition(
                position: _slideAnimation,
                child: Column(
                  children: [
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => context.go('/dashboard'),
                        child: const Text('Back to Dashboard'),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: TextButton(
                        onPressed: () {
                          // Navigate to bookings history
                        },
                        child: const Text('View My Bookings'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailSection(String title, List<Widget> details) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTextStyles.body.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.primaryOrange,
          ),
        ),
        const SizedBox(height: 12),
        ...details,
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTextStyles.body.copyWith(
              color: AppColors.grey600,
            ),
          ),
          Flexible(
            child: Text(
              value,
              style: AppTextStyles.body.copyWith(
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor() {
    switch (_booking!.status) {
      case BookingStatus.pending:
        return AppColors.warning;
      case BookingStatus.confirmed:
        return AppColors.info;
      case BookingStatus.inProgress:
        return AppColors.primaryOrange;
      case BookingStatus.completed:
        return AppColors.success;
      case BookingStatus.cancelled:
        return AppColors.error;
    }
  }

  String _getPaymentMethodText() {
    switch (_booking!.paymentMethod) {
      case 'credit_card':
        return 'Credit/Debit Card';
      case 'gcash':
        return 'GCash';
      case 'cash':
        return 'Cash (Pay at Branch)';
      default:
        return _booking!.paymentMethod;
    }
  }
}
