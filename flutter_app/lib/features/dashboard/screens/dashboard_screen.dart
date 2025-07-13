import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/auth_provider.dart';
import '../widgets/dashboard_header.dart';
import '../widgets/subscription_card.dart';
import '../widgets/quick_actions.dart';
import '../widgets/level_progress.dart';
import '../widgets/recent_bookings.dart';
import '../widgets/analytics_overview.dart';
import '../../shared/widgets/bottom_navigation.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  bool _showRefreshButton = false;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _scrollController.addListener(_onScroll);
    _animationController.forward();
  }

  void _onScroll() {
    if (_scrollController.offset > 200 && !_showRefreshButton) {
      setState(() {
        _showRefreshButton = true;
      });
    } else if (_scrollController.offset <= 200 && _showRefreshButton) {
      setState(() {
        _showRefreshButton = false;
      });
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _refreshData() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.refreshUser();
    
    // Add haptic feedback
    HapticFeedback.lightImpact();
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Dashboard refreshed!'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.facBlue50,
              AppColors.background,
            ],
            stops: [0.0, 0.3],
          ),
        ),
        child: Stack(
          children: [
            // Background particles effect
            _buildBackgroundParticles(),
            
            // Main content
            RefreshIndicator(
              onRefresh: _refreshData,
              color: AppColors.primary,
              child: CustomScrollView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  // Header
                  SliverToBoxAdapter(
                    child: FadeTransition(
                      opacity: _fadeAnimation,
                      child: const DashboardHeader(),
                    ),
                  ),

                  // Content
                  SliverPadding(
                    padding: const EdgeInsets.all(16.0),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        // Subscription Card
                        _buildAnimatedCard(
                          delay: 100,
                          child: const SubscriptionCard(),
                        ),
                        const SizedBox(height: 16),

                        // Level Progress
                        _buildAnimatedCard(
                          delay: 200,
                          child: const LevelProgress(),
                        ),
                        const SizedBox(height: 16),

                        // Quick Actions
                        _buildAnimatedCard(
                          delay: 300,
                          child: const QuickActions(),
                        ),
                        const SizedBox(height: 16),

                        // Analytics Overview
                        _buildAnimatedCard(
                          delay: 400,
                          child: const AnalyticsOverview(),
                        ),
                        const SizedBox(height: 16),

                        // Recent Bookings
                        _buildAnimatedCard(
                          delay: 500,
                          child: const RecentBookings(),
                        ),
                        const SizedBox(height: 80), // Space for bottom navigation
                      ]),
                    ),
                  ),
                ],
              ),
            ),

            // Floating Refresh Button
            if (_showRefreshButton)
              Positioned(
                bottom: 100,
                right: 16,
                child: AnimatedOpacity(
                  opacity: _showRefreshButton ? 1.0 : 0.0,
                  duration: const Duration(milliseconds: 300),
                  child: FloatingActionButton(
                    onPressed: _refreshData,
                    backgroundColor: AppColors.primary,
                    child: const Icon(
                      Icons.refresh,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
      bottomNavigationBar: const BottomNavigation(),
    );
  }

  Widget _buildBackgroundParticles() {
    return Positioned.fill(
      child: IgnorePointer(
        child: Stack(
          children: [
            // Large floating circles
            Positioned(
              top: 100,
              left: -50,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.facOrange500.withOpacity(0.05),
                ),
              ),
            ),
            Positioned(
              bottom: 200,
              right: -80,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.facBlue500.withOpacity(0.05),
                ),
              ),
            ),
            // Small animated dots
            ...List.generate(5, (index) => _buildFloatingDot(index)),
          ],
        ),
      ),
    );
  }

  Widget _buildFloatingDot(int index) {
    final positions = [
      const Offset(50, 150),
      const Offset(300, 80),
      const Offset(100, 400),
      const Offset(250, 300),
      const Offset(150, 600),
    ];

    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Positioned(
          left: positions[index].dx + (10 * (_animationController.value - 0.5)),
          top: positions[index].dy + (5 * (_animationController.value - 0.5)),
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primary.withOpacity(0.3),
            ),
          ),
        );
      },
    );
  }

  Widget _buildAnimatedCard({required int delay, required Widget child}) {
    return TweenAnimationBuilder<double>(
      duration: Duration(milliseconds: 800 + delay),
      tween: Tween(begin: 0.0, end: 1.0),
      curve: Curves.easeOutBack,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 30 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: child,
    );
  }
}

// Import the HapticFeedback
import 'package:flutter/services.dart';
