import 'package:flutter/material.dart';

import '../../../app/theme/app_theme.dart';

class DashboardHistory extends StatelessWidget {
  const DashboardHistory({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.grey50,
      appBar: AppBar(
        title: const Text('Service History'),
        automaticallyImplyLeading: false,
      ),
      body: const Center(
        child: Text('Service History - Coming Soon'),
      ),
    );
  }
}
