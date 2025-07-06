import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/providers/booking_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/models/service_model.dart';
import '../../../core/models/branch_model.dart';
import '../../../core/services/database_service.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;

  // Step 1: Service Selection
  ServiceModel? _selectedService;
  
  // Step 2: Branch & Time Selection
  BranchModel? _selectedBranch;
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  
  // Step 3: Vehicle & Details
  String _vehicleType = 'Sedan';
  final _plateNumberController = TextEditingController();
  final _specialInstructionsController = TextEditingController();
  
  // Step 4: Payment
  String _paymentMethod = 'credit_card';

  List<ServiceModel> _services = [];
  List<BranchModel> _branches = [];
  bool _isLoading = true;

  final List<String> _vehicleTypes = [
    'Sedan',
    'SUV', 
    'Hatchback',
    'Pickup',
    'Van',
    'Motorcycle',
  ];

  final List<Map<String, dynamic>> _paymentMethods = [
    {
      'id': 'credit_card',
      'name': 'Credit/Debit Card',
      'icon': Icons.credit_card,
    },
    {
      'id': 'gcash',
      'name': 'GCash',
      'icon': Icons.phone_android,
    },
    {
      'id': 'cash',
      'name': 'Cash (Pay at Branch)',
      'icon': Icons.money,
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadBookingData();
  }

  @override
  void dispose() {
    _plateNumberController.dispose();
    _specialInstructionsController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _loadBookingData() async {
    try {
      final services = await DatabaseService.getServices();
      final branches = await DatabaseService.getBranches();
      
      setState(() {
        _services = services;
        _branches = branches;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading booking data: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _nextStep() {
    if (_currentStep < 3) {
      if (_validateCurrentStep()) {
        setState(() {
          _currentStep++;
        });
        _pageController.nextPage(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      }
    } else {
      _createBooking();
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() {
        _currentStep--;
      });
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  bool _validateCurrentStep() {
    switch (_currentStep) {
      case 0:
        if (_selectedService == null) {
          _showError('Please select a service');
          return false;
        }
        return true;
      case 1:
        if (_selectedBranch == null) {
          _showError('Please select a branch');
          return false;
        }
        if (_selectedDate == null) {
          _showError('Please select a date');
          return false;
        }
        if (_selectedTime == null) {
          _showError('Please select a time');
          return false;
        }
        return true;
      case 2:
        if (_plateNumberController.text.isEmpty) {
          _showError('Please enter your plate number');
          return false;
        }
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
      ),
    );
  }

  Future<void> _createBooking() async {
    if (_selectedService == null || _selectedBranch == null || 
        _selectedDate == null || _selectedTime == null) {
      _showError('Please complete all required fields');
      return;
    }

    try {
      final bookingProvider = context.read<BookingProvider>();
      final authProvider = context.read<AuthProvider>();
      
      final scheduledDateTime = DateTime(
        _selectedDate!.year,
        _selectedDate!.month,
        _selectedDate!.day,
        _selectedTime!.hour,
        _selectedTime!.minute,
      );

      final success = await bookingProvider.createBooking(
        serviceId: _selectedService!.id,
        branchId: _selectedBranch!.id,
        scheduledDate: scheduledDateTime,
        vehicleType: _vehicleType,
        plateNumber: _plateNumberController.text.trim(),
        specialInstructions: _specialInstructionsController.text.trim(),
        paymentMethod: _paymentMethod,
      );

      if (success && mounted) {
        context.go('/booking-confirmation?bookingId=${bookingProvider.currentBooking?.id}');
      } else if (mounted) {
        _showError(bookingProvider.errorMessage ?? 'Failed to create booking');
      }
    } catch (e) {
      if (mounted) {
        _showError('An error occurred while creating your booking');
      }
    }
  }

  double _calculatePrice() {
    if (_selectedService == null) return 0.0;
    
    double basePrice = _selectedService!.basePrice;
    
    // Apply vehicle type multiplier
    switch (_vehicleType.toLowerCase()) {
      case 'motorcycle':
        basePrice *= 0.5;
        break;
      case 'suv':
      case 'pickup':
        basePrice *= 1.2;
        break;
      case 'van':
        basePrice *= 1.3;
        break;
    }
    
    return basePrice;
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

    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: const Text('Book Service'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: _currentStep > 0 ? _previousStep : () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // Progress Indicator
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: List.generate(4, (index) {
                return Expanded(
                  child: Container(
                    margin: EdgeInsets.only(right: index < 3 ? 8 : 0),
                    height: 4,
                    decoration: BoxDecoration(
                      color: index <= _currentStep 
                          ? AppColors.primaryOrange 
                          : AppColors.grey200,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                );
              }),
            ),
          ),
          
          // Content
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildServiceSelection(),
                _buildBranchAndTimeSelection(),
                _buildVehicleDetails(),
                _buildPaymentSelection(),
              ],
            ),
          ),
          
          // Bottom Button
          Container(
            padding: const EdgeInsets.all(16),
            child: Consumer<BookingProvider>(
              builder: (context, bookingProvider, child) {
                return SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: bookingProvider.isLoading ? null : _nextStep,
                    child: bookingProvider.isLoading && _currentStep == 3
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
                        : Text(_currentStep == 3 ? 'Confirm Booking' : 'Next'),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceSelection() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Select Service',
            style: AppTextStyles.heading2.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose the service that best fits your needs',
            style: AppTextStyles.body.copyWith(
              color: AppColors.grey600,
            ),
          ),
          const SizedBox(height: 24),
          
          ...(_services.map((service) {
            final isSelected = _selectedService?.id == service.id;
            return Container(
              margin: const EdgeInsets.only(bottom: 16),
              child: InkWell(
                onTap: () {
                  setState(() {
                    _selectedService = service;
                  });
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? AppColors.primaryOrange : AppColors.grey200,
                      width: isSelected ? 2 : 1,
                    ),
                    color: isSelected 
                        ? AppColors.primaryOrange.withOpacity(0.05)
                        : AppColors.white,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              service.name,
                              style: AppTextStyles.heading3.copyWith(
                                fontWeight: FontWeight.bold,
                                color: isSelected ? AppColors.primaryOrange : AppColors.black,
                              ),
                            ),
                          ),
                          Text(
                            service.formattedPrice,
                            style: AppTextStyles.heading3.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryOrange,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        service.description,
                        style: AppTextStyles.body.copyWith(
                          color: AppColors.grey600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(
                            Icons.access_time,
                            size: 16,
                            color: AppColors.grey500,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            service.formattedDuration,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.grey500,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Icon(
                            Icons.category,
                            size: 16,
                            color: AppColors.grey500,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            service.category,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.grey500,
                            ),
                          ),
                        ],
                      ),
                      if (service.features.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 4,
                          children: service.features.map((feature) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.grey100,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                feature,
                                style: AppTextStyles.caption.copyWith(
                                  color: AppColors.grey700,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          }).toList()),
        ],
      ),
    );
  }

  Widget _buildBranchAndTimeSelection() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Select Branch & Time',
            style: AppTextStyles.heading2.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose your preferred branch and appointment time',
            style: AppTextStyles.body.copyWith(
              color: AppColors.grey600,
            ),
          ),
          const SizedBox(height: 24),
          
          // Branch Selection
          Text(
            'Branch',
            style: AppTextStyles.heading3.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          
          ...(_branches.map((branch) {
            final isSelected = _selectedBranch?.id == branch.id;
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              child: InkWell(
                onTap: () {
                  setState(() {
                    _selectedBranch = branch;
                  });
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? AppColors.primaryOrange : AppColors.grey200,
                      width: isSelected ? 2 : 1,
                    ),
                    color: isSelected 
                        ? AppColors.primaryOrange.withOpacity(0.05)
                        : AppColors.white,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        branch.name,
                        style: AppTextStyles.body.copyWith(
                          fontWeight: FontWeight.bold,
                          color: isSelected ? AppColors.primaryOrange : AppColors.black,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        branch.address,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.grey600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(
                            Icons.access_time,
                            size: 16,
                            color: AppColors.grey500,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            branch.operatingHours,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.grey500,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Icon(
                            Icons.schedule,
                            size: 16,
                            color: AppColors.grey500,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            branch.waitTimeText,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.grey500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList()),
          
          const SizedBox(height: 24),
          
          // Date Selection
          Text(
            'Date',
            style: AppTextStyles.heading3.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          
          InkWell(
            onTap: () async {
              final date = await showDatePicker(
                context: context,
                initialDate: DateTime.now().add(const Duration(days: 1)),
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 30)),
              );
              if (date != null) {
                setState(() {
                  _selectedDate = date;
                });
              }
            },
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.grey200),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.calendar_today,
                    color: AppColors.grey500,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    _selectedDate != null
                        ? DateFormat('EEEE, MMMM d, y').format(_selectedDate!)
                        : 'Select date',
                    style: AppTextStyles.body.copyWith(
                      color: _selectedDate != null 
                          ? AppColors.black 
                          : AppColors.grey500,
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Time Selection
          Text(
            'Time',
            style: AppTextStyles.heading3.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          
          InkWell(
            onTap: () async {
              final time = await showTimePicker(
                context: context,
                initialTime: TimeOfDay.now(),
              );
              if (time != null) {
                setState(() {
                  _selectedTime = time;
                });
              }
            },
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.grey200),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.access_time,
                    color: AppColors.grey500,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    _selectedTime != null
                        ? _selectedTime!.format(context)
                        : 'Select time',
                    style: AppTextStyles.body.copyWith(
                      color: _selectedTime != null 
                          ? AppColors.black 
                          : AppColors.grey500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleDetails() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Vehicle Details',
            style: AppTextStyles.heading2.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Provide details about your vehicle',
            style: AppTextStyles.body.copyWith(
              color: AppColors.grey600,
            ),
          ),
          const SizedBox(height: 24),
          
          // Vehicle Type
          Text(
            'Vehicle Type',
            style: AppTextStyles.body.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: _vehicleType,
            decoration: InputDecoration(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
              ),
            ),
            items: _vehicleTypes.map((type) {
              return DropdownMenuItem(
                value: type,
                child: Text(type),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                _vehicleType = value!;
              });
            },
          ),
          
          const SizedBox(height: 16),
          
          // Plate Number
          Text(
            'Plate Number',
            style: AppTextStyles.body.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _plateNumberController,
            textCapitalization: TextCapitalization.characters,
            decoration: InputDecoration(
              hintText: 'Enter your plate number',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Special Instructions
          Text(
            'Special Instructions (Optional)',
            style: AppTextStyles.body.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _specialInstructionsController,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Any special requests or instructions...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Price Summary
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.grey50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.grey200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Price Summary',
                  style: AppTextStyles.body.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _selectedService?.name ?? 'Service',
                      style: AppTextStyles.body,
                    ),
                    Text(
                      '₱${_selectedService?.basePrice.toStringAsFixed(0)}',
                      style: AppTextStyles.body,
                    ),
                  ],
                ),
                if (_vehicleType != 'Sedan' && _vehicleType != 'Hatchback') ...[
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '$_vehicleType surcharge',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.grey600,
                        ),
                      ),
                      Text(
                        _vehicleType == 'Motorcycle' 
                            ? '-50%'
                            : _vehicleType == 'Van' 
                                ? '+30%'
                                : '+20%',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.grey600,
                        ),
                      ),
                    ],
                  ),
                ],
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Total',
                      style: AppTextStyles.body.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '₱${_calculatePrice().toStringAsFixed(0)}',
                      style: AppTextStyles.body.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryOrange,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentSelection() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Payment Method',
            style: AppTextStyles.heading2.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose how you would like to pay',
            style: AppTextStyles.body.copyWith(
              color: AppColors.grey600,
            ),
          ),
          const SizedBox(height: 24),
          
          ...(_paymentMethods.map((method) {
            final isSelected = _paymentMethod == method['id'];
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              child: InkWell(
                onTap: () {
                  setState(() {
                    _paymentMethod = method['id'];
                  });
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? AppColors.primaryOrange : AppColors.grey200,
                      width: isSelected ? 2 : 1,
                    ),
                    color: isSelected 
                        ? AppColors.primaryOrange.withOpacity(0.05)
                        : AppColors.white,
                  ),
                  child: Row(
                    children: [
                      Icon(
                        method['icon'],
                        color: isSelected ? AppColors.primaryOrange : AppColors.grey500,
                        size: 24,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Text(
                          method['name'],
                          style: AppTextStyles.body.copyWith(
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                            color: isSelected ? AppColors.primaryOrange : AppColors.black,
                          ),
                        ),
                      ),
                      if (isSelected)
                        Icon(
                          Icons.check_circle,
                          color: AppColors.primaryOrange,
                          size: 20,
                        ),
                    ],
                  ),
                ),
              ),
            );
          }).toList()),
          
          const SizedBox(height: 24),
          
          // Booking Summary
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.grey50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.grey200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Booking Summary',
                  style: AppTextStyles.body.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                _buildSummaryRow('Service', _selectedService?.name ?? ''),
                _buildSummaryRow('Branch', _selectedBranch?.name ?? ''),
                _buildSummaryRow(
                  'Date & Time', 
                  _selectedDate != null && _selectedTime != null
                      ? '${DateFormat('MMM d, y').format(_selectedDate!)} at ${_selectedTime!.format(context)}'
                      : ''
                ),
                _buildSummaryRow('Vehicle', '$_vehicleType - ${_plateNumberController.text}'),
                _buildSummaryRow('Payment Method', _paymentMethods.firstWhere((m) => m['id'] == _paymentMethod)['name']),
                const Divider(),
                _buildSummaryRow(
                  'Total Amount', 
                  '₱${_calculatePrice().toStringAsFixed(0)}',
                  isTotal: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTextStyles.body.copyWith(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isTotal ? AppColors.black : AppColors.grey600,
            ),
          ),
          Text(
            value,
            style: AppTextStyles.body.copyWith(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isTotal ? AppColors.primaryOrange : AppColors.black,
            ),
          ),
        ],
      ),
    );
  }
}
