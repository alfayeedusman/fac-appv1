import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../widgets/auth_text_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _pageController = PageController();
  int _currentStep = 0;

  // Step 1: Personal Information
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  // Step 2: Vehicle Information
  final _carModelController = TextEditingController();
  final _plateNumberController = TextEditingController();
  String _vehicleType = 'Sedan';
  String _preferredBranch = 'Tumaga';

  // Step 3: Membership Selection
  String _membershipType = 'Regular';

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  final List<String> _vehicleTypes = [
    'Sedan',
    'SUV',
    'Hatchback',
    'Pickup',
    'Van',
    'Motorcycle',
  ];

  final List<String> _branches = [
    'Tumaga',
    'Boalan',
  ];

  final List<Map<String, dynamic>> _membershipPlans = [
    {
      'name': 'Regular',
      'price': 'Free',
      'description': 'Pay per service',
      'color': AppColors.grey500,
    },
    {
      'name': 'Classic',
      'price': '₱500/month',
      'description': '10 washes + basic services',
      'color': AppColors.facBlue,
    },
    {
      'name': 'VIP Silver',
      'price': '₱1,500/month',
      'description': 'Unlimited basic + premium services',
      'color': AppColors.grey400,
    },
    {
      'name': 'VIP Gold',
      'price': '₱3,000/month',
      'description': 'All services + priority + detailing',
      'color': AppColors.facGold,
    },
  ];

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _carModelController.dispose();
    _plateNumberController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _nextStep() async {
    if (_currentStep < 2) {
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
      await _register();
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
        return _validatePersonalInfo();
      case 1:
        return _validateVehicleInfo();
      case 2:
        return true; // Membership selection doesn't need validation
      default:
        return false;
    }
  }

  bool _validatePersonalInfo() {
    if (_fullNameController.text.length < 2) {
      _showError('Please enter your full name');
      return false;
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(_emailController.text)) {
      _showError('Please enter a valid email');
      return false;
    }
    if (_phoneController.text.length < 10) {
      _showError('Please enter a valid phone number');
      return false;
    }
    if (_addressController.text.length < 10) {
      _showError('Please enter your complete address');
      return false;
    }
    if (_passwordController.text.length < 8) {
      _showError('Password must be at least 8 characters');
      return false;
    }
    if (_passwordController.text != _confirmPasswordController.text) {
      _showError('Passwords do not match');
      return false;
    }
    return true;
  }

  bool _validateVehicleInfo() {
    if (_carModelController.text.isEmpty) {
      _showError('Please enter your car model');
      return false;
    }
    if (_plateNumberController.text.isEmpty) {
      _showError('Please enter your plate number');
      return false;
    }
    return true;
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
      ),
    );
  }

  Future<void> _register() async {
    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.register(
      email: _emailController.text.trim(),
      password: _passwordController.text,
      fullName: _fullNameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
      address: _addressController.text.trim(),
      vehicleType: _vehicleType,
      carModel: _carModelController.text.trim(),
      plateNumber: _plateNumberController.text.trim(),
      preferredBranch: _preferredBranch,
      membershipType: _membershipType,
    );

    if (mounted && success) {
      context.go('/dashboard');
    } else if (mounted && authProvider.errorMessage != null) {
      _showError(authProvider.errorMessage!);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: const Text('Create Account'),
        leading: _currentStep > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: _previousStep,
              )
            : IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => context.go('/login'),
              ),
      ),
      body: Column(
        children: [
          // Progress Indicator
          LinearProgressIndicator(
            value: (_currentStep + 1) / 3,
            backgroundColor: AppColors.grey200,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryOrange),
          ),
          
          // Content
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildPersonalInfoStep(),
                _buildVehicleInfoStep(),
                _buildMembershipStep(),
              ],
            ),
          ),
          
          // Bottom Button
          Padding(
            padding: const EdgeInsets.all(24),
            child: Consumer<AuthProvider>(
              builder: (context, authProvider, child) {
                return SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: authProvider.isLoading ? null : _nextStep,
                    child: authProvider.isLoading && _currentStep == 2
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
                        : Text(_currentStep == 2 ? 'Create Account' : 'Next'),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalInfoStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Personal Information',
              style: AppTextStyles.heading2.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Please provide your personal details',
              style: AppTextStyles.body.copyWith(
                color: AppColors.grey600,
              ),
            ),
            const SizedBox(height: 32),
            
            AuthTextField(
              controller: _fullNameController,
              label: 'Full Name',
              hintText: 'Enter your full name',
              prefixIcon: Icons.person_outline,
            ),
            const SizedBox(height: 16),
            
            AuthTextField(
              controller: _emailController,
              label: 'Email Address',
              hintText: 'Enter your email',
              keyboardType: TextInputType.emailAddress,
              prefixIcon: Icons.email_outlined,
            ),
            const SizedBox(height: 16),
            
            AuthTextField(
              controller: _phoneController,
              label: 'Phone Number',
              hintText: 'Enter your phone number',
              keyboardType: TextInputType.phone,
              prefixIcon: Icons.phone_outlined,
            ),
            const SizedBox(height: 16),
            
            AuthTextField(
              controller: _addressController,
              label: 'Address',
              hintText: 'Enter your complete address',
              maxLines: 2,
              prefixIcon: Icons.location_on_outlined,
            ),
            const SizedBox(height: 16),
            
            AuthTextField(
              controller: _passwordController,
              label: 'Password',
              hintText: 'Create a password',
              obscureText: _obscurePassword,
              prefixIcon: Icons.lock_outline,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility : Icons.visibility_off,
                  color: AppColors.grey500,
                ),
                onPressed: () {
                  setState(() {
                    _obscurePassword = !_obscurePassword;
                  });
                },
              ),
            ),
            const SizedBox(height: 16),
            
            AuthTextField(
              controller: _confirmPasswordController,
              label: 'Confirm Password',
              hintText: 'Confirm your password',
              obscureText: _obscureConfirmPassword,
              prefixIcon: Icons.lock_outline,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirmPassword ? Icons.visibility : Icons.visibility_off,
                  color: AppColors.grey500,
                ),
                onPressed: () {
                  setState(() {
                    _obscureConfirmPassword = !_obscureConfirmPassword;
                  });
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVehicleInfoStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Vehicle Information',
            style: AppTextStyles.heading2.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tell us about your vehicle',
            style: AppTextStyles.body.copyWith(
              color: AppColors.grey600,
            ),
          ),
          const SizedBox(height: 32),
          
          // Vehicle Type Dropdown
          DropdownButtonFormField<String>(
            value: _vehicleType,
            decoration: const InputDecoration(
              labelText: 'Vehicle Type',
              prefixIcon: Icon(Icons.directions_car_outlined),
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
          
          AuthTextField(
            controller: _carModelController,
            label: 'Car Model',
            hintText: 'e.g., Toyota Vios, Honda Civic',
            prefixIcon: Icons.car_repair_outlined,
          ),
          const SizedBox(height: 16),
          
          AuthTextField(
            controller: _plateNumberController,
            label: 'Plate Number',
            hintText: 'Enter your plate number',
            prefixIcon: Icons.credit_card_outlined,
            textCapitalization: TextCapitalization.characters,
          ),
          const SizedBox(height: 16),
          
          // Preferred Branch Dropdown
          DropdownButtonFormField<String>(
            value: _preferredBranch,
            decoration: const InputDecoration(
              labelText: 'Preferred Branch',
              prefixIcon: Icon(Icons.location_on_outlined),
            ),
            items: _branches.map((branch) {
              return DropdownMenuItem(
                value: branch,
                child: Text(branch),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                _preferredBranch = value!;
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMembershipStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Choose Your Plan',
            style: AppTextStyles.heading2.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Select a membership plan that suits your needs',
            style: AppTextStyles.body.copyWith(
              color: AppColors.grey600,
            ),
          ),
          const SizedBox(height: 32),
          
          ...(_membershipPlans.map((plan) {
            final isSelected = _membershipType == plan['name'];
            return Container(
              margin: const EdgeInsets.only(bottom: 16),
              child: InkWell(
                onTap: () {
                  setState(() {
                    _membershipType = plan['name'];
                  });
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? plan['color'] : AppColors.grey200,
                      width: isSelected ? 2 : 1,
                    ),
                    color: isSelected 
                        ? plan['color'].withOpacity(0.05)
                        : AppColors.white,
                  ),
                  child: Row(
                    children: [
                      Radio<String>(
                        value: plan['name'],
                        groupValue: _membershipType,
                        onChanged: (value) {
                          setState(() {
                            _membershipType = value!;
                          });
                        },
                        activeColor: plan['color'],
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              plan['name'],
                              style: AppTextStyles.heading3.copyWith(
                                color: plan['color'],
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              plan['price'],
                              style: AppTextStyles.body.copyWith(
                                color: AppColors.black,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              plan['description'],
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.grey600,
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
          }).toList()),
        ],
      ),
    );
  }
}
