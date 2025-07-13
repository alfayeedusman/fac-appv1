import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/widgets/skeleton_loader.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/dashboard_header.dart';
import '../widgets/membership_card.dart';
import '../widgets/quick_actions_grid.dart';
import '../widgets/statistics_section.dart';
import '../widgets/vouchers_section.dart';
import '../widgets/recent_activity.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    // Load dashboard data on screen init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(dashboardProvider.notifier).loadDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(dashboardProvider);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await ref.read(dashboardProvider.notifier).loadDashboardData();
          },
          color: AppTheme.primaryColor,
          child: CustomScrollView(
            slivers: [
              // App Bar
              SliverAppBar(
                floating: true,
                backgroundColor: Colors.white,
                elevation: 0,
                title: Row(
                  children: [
                    Image.asset(
                      'assets/icons/app_icon.png',
                      height: 32,
                      width: 32,
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Fayeed Auto Care',
                      style: TextStyle(
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
                actions: [
                  Stack(
                    children: [
                      IconButton(
                        onPressed: () => context.push('/notifications'),
                        icon: const Icon(
                          Icons.notifications_outlined,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      if (dashboardState.unreadNotifications > 0)
                        Positioned(
                          right: 8,
                          top: 8,
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              color: Colors.red,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            constraints: const BoxConstraints(
                              minWidth: 16,
                              minHeight: 16,
                            ),
                            child: Text(
                              '${dashboardState.unreadNotifications}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),

              // Content
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    // Header Section
                    if (dashboardState.isLoading)
                      _buildHeaderSkeleton()
                    else
                      DashboardHeader(
                        userName: dashboardState.user?.fullName ?? 'User',
                        greeting: _getGreeting(),
                      ),

                    const SizedBox(height: 24),

                    // Membership Card
                    if (dashboardState.isLoading)
                      _buildMembershipCardSkeleton()
                    else
                      MembershipCard(
                        membershipType: dashboardState.user?.membershipType ?? 'regular',
                        remainingWashes: dashboardState.membership?['remainingWashes'] ?? 0,
                        remainingCredits: dashboardState.membership?['remainingCredits'] ?? 0.0,
                        onUpgrade: () => context.push('/membership'),
                        onViewDetails: () => context.push('/membership-details'),
                      ),

                    const SizedBox(height: 24),

                    // Quick Actions
                    if (dashboardState.isLoading)
                      _buildQuickActionsSkeleton()
                    else
                      QuickActionsGrid(
                        onQRScan: () => context.push('/qr-scanner'),
                        onBookService: () => context.push('/booking'),
                        onViewHistory: () => context.push('/history'),
                        onSupport: () => context.push('/support'),
                      ),

                    const SizedBox(height: 24),

                    // Statistics Section
                    if (dashboardState.isLoading)
                      _buildStatisticsSkeleton()
                    else
                      StatisticsSection(
                        analytics: dashboardState.analytics ?? {},
                      ),

                    const SizedBox(height: 24),

                    // Active Vouchers
                    if (dashboardState.isLoading)
                      _buildVouchersSkeleton()
                    else if (dashboardState.vouchers.isNotEmpty)
                      VouchersSection(
                        vouchers: dashboardState.vouchers,
                        onViewAll: () => context.push('/vouchers'),
                      ),

                    if (!dashboardState.isLoading && dashboardState.vouchers.isNotEmpty)
                      const SizedBox(height: 24),

                    // Recent Activity
                    if (dashboardState.isLoading)
                      _buildRecentActivitySkeleton()
                    else
                      RecentActivity(
                        activities: dashboardState.recentBookings,
                        onViewAll: () => context.push('/history'),
                      ),

                    // Bottom padding for FAB
                    const SizedBox(height: 80),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),

      // QR Scanner FAB
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/qr-scanner'),
        backgroundColor: AppTheme.primaryColor,
        child: const Icon(
          Icons.qr_code_scanner,
          color: Colors.white,
          size: 28,
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,

      // Bottom Navigation
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        notchMargin: 8,
        child: SizedBox(
          height: 60,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildBottomNavItem(
                icon: Icons.home_outlined,
                activeIcon: Icons.home,
                label: 'Home',
                isActive: true,
                onTap: () {},
              ),
              _buildBottomNavItem(
                icon: Icons.calendar_today_outlined,
                activeIcon: Icons.calendar_today,
                label: 'Bookings',
                isActive: false,
                onTap: () => context.push('/bookings'),
              ),
              const SizedBox(width: 40), // Space for FAB
              _buildBottomNavItem(
                icon: Icons.history_outlined,
                activeIcon: Icons.history,
                label: 'History',
                isActive: false,
                onTap: () => context.push('/history'),
              ),
              _buildBottomNavItem(
                icon: Icons.person_outline,
                activeIcon: Icons.person,
                label: 'Profile',
                isActive: false,
                onTap: () => context.push('/profile'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomNavItem({
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isActive ? activeIcon : icon,
              color: isActive ? AppTheme.primaryColor : Colors.grey[400],
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isActive ? AppTheme.primaryColor : Colors.grey[400],
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  // Skeleton Loading Widgets
  Widget _buildHeaderSkeleton() {
    return Row(
      children: [
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SkeletonText(fontSize: 14, width: 100),
              SizedBox(height: 4),
              SkeletonText(fontSize: 20, width: 150),
            ],
          ),
        ),
        const SkeletonLoader.circular(size: 48),
      ],
    );
  }

  Widget _buildMembershipCardSkeleton() {
    return SkeletonLoader(
      width: double.infinity,
      height: 160,
      borderRadius: BorderRadius.circular(16),
    );
  }

  Widget _buildQuickActionsSkeleton() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SkeletonText(fontSize: 18, width: 120),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.5,
          children: List.generate(
            4,
            (index) => SkeletonLoader(
              width: double.infinity,
              height: double.infinity,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatisticsSkeleton() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SkeletonText(fontSize: 18, width: 140),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.2,
          children: List.generate(
            4,
            (index) => const SkeletonCard(
              hasImage: false,
              hasTitle: true,
              hasSubtitle: true,
              bodyLines: 1,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildVouchersSkeleton() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const SkeletonText(fontSize: 18, width: 120),
            SkeletonLoader(
              width: 60,
              height: 20,
              borderRadius: BorderRadius.circular(10),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: 3,
            itemBuilder: (context, index) {
              return Container(
                width: 200,
                margin: EdgeInsets.only(right: index < 2 ? 12 : 0),
                child: SkeletonLoader(
                  width: double.infinity,
                  height: double.infinity,
                  borderRadius: BorderRadius.circular(12),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRecentActivitySkeleton() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const SkeletonText(fontSize: 18, width: 140),
            SkeletonLoader(
              width: 60,
              height: 20,
              borderRadius: BorderRadius.circular(10),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: List.generate(
              3,
              (index) => Padding(
                padding: EdgeInsets.only(
                  bottom: index < 2 ? 16 : 0,
                ),
                child: const SkeletonListTile(
                  hasLeading: true,
                  hasTrailing: false,
                  hasSubtitle: true,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
