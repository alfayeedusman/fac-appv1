import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class SkeletonLoader extends StatelessWidget {
  final double width;
  final double height;
  final BorderRadius borderRadius;
  final Color? baseColor;
  final Color? highlightColor;

  const SkeletonLoader({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = const BorderRadius.all(Radius.circular(8)),
    this.baseColor,
    this.highlightColor,
  });

  const SkeletonLoader.rectangular({
    super.key,
    required this.width,
    required this.height,
    this.baseColor,
    this.highlightColor,
  }) : borderRadius = const BorderRadius.all(Radius.circular(8));

  const SkeletonLoader.circular({
    super.key,
    required double size,
    this.baseColor,
    this.highlightColor,
  }) : width = size,
       height = size,
       borderRadius = const BorderRadius.all(Radius.circular(50));

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: baseColor ?? Colors.grey.shade300,
      highlightColor: highlightColor ?? Colors.grey.shade100,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: borderRadius,
        ),
      ),
    );
  }
}

class SkeletonText extends StatelessWidget {
  final double fontSize;
  final int lines;
  final double lineSpacing;
  final double? width;

  const SkeletonText({
    super.key,
    this.fontSize = 14,
    this.lines = 1,
    this.lineSpacing = 8,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(lines, (index) {
        final isLastLine = index == lines - 1;
        final lineWidth = width ?? 
          (isLastLine && lines > 1 ? MediaQuery.of(context).size.width * 0.6 : double.infinity);
        
        return Padding(
          padding: EdgeInsets.only(bottom: isLastLine ? 0 : lineSpacing),
          child: SkeletonLoader(
            width: lineWidth,
            height: fontSize * 1.2,
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }
}

class SkeletonCard extends StatelessWidget {
  final double? width;
  final double height;
  final EdgeInsets padding;
  final bool hasImage;
  final bool hasTitle;
  final bool hasSubtitle;
  final int bodyLines;

  const SkeletonCard({
    super.key,
    this.width,
    this.height = 200,
    this.padding = const EdgeInsets.all(16),
    this.hasImage = true,
    this.hasTitle = true,
    this.hasSubtitle = true,
    this.bodyLines = 2,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      padding: padding,
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (hasImage) ...[
            SkeletonLoader(
              width: double.infinity,
              height: height * 0.4,
              borderRadius: BorderRadius.circular(8),
            ),
            const SizedBox(height: 12),
          ],
          if (hasTitle) ...[
            const SkeletonText(fontSize: 18, width: 200),
            const SizedBox(height: 8),
          ],
          if (hasSubtitle) ...[
            const SkeletonText(fontSize: 14, width: 150),
            const SizedBox(height: 12),
          ],
          Expanded(
            child: SkeletonText(
              fontSize: 12,
              lines: bodyLines,
              lineSpacing: 6,
            ),
          ),
        ],
      ),
    );
  }
}

class SkeletonListTile extends StatelessWidget {
  final bool hasLeading;
  final bool hasTrailing;
  final bool hasSubtitle;

  const SkeletonListTile({
    super.key,
    this.hasLeading = true,
    this.hasTrailing = true,
    this.hasSubtitle = true,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Row(
        children: [
          if (hasLeading) ...[
            const SkeletonLoader.circular(size: 48),
            const SizedBox(width: 16),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SkeletonText(fontSize: 16, width: 180),
                if (hasSubtitle) ...[
                  const SizedBox(height: 4),
                  const SkeletonText(fontSize: 12, width: 120),
                ],
              ],
            ),
          ),
          if (hasTrailing) ...[
            const SizedBox(width: 16),
            const SkeletonLoader(width: 60, height: 20),
          ],
        ],
      ),
    );
  }
}

class SkeletonGrid extends StatelessWidget {
  final int itemCount;
  final int crossAxisCount;
  final double childAspectRatio;
  final double spacing;

  const SkeletonGrid({
    super.key,
    this.itemCount = 6,
    this.crossAxisCount = 2,
    this.childAspectRatio = 1.0,
    this.spacing = 16,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: EdgeInsets.all(spacing),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        childAspectRatio: childAspectRatio,
        crossAxisSpacing: spacing,
        mainAxisSpacing: spacing,
      ),
      itemCount: itemCount,
      itemBuilder: (context, index) {
        return const SkeletonCard(
          hasImage: true,
          hasTitle: true,
          hasSubtitle: false,
          bodyLines: 1,
        );
      },
    );
  }
}

class SkeletonDashboard extends StatelessWidget {
  const SkeletonDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Skeleton
          Row(
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
          ),
          const SizedBox(height: 24),
          
          // Membership Card Skeleton
          SkeletonLoader(
            width: double.infinity,
            height: 160,
            borderRadius: BorderRadius.circular(16),
          ),
          const SizedBox(height: 24),
          
          // Quick Actions Title
          const SkeletonText(fontSize: 18, width: 120),
          const SizedBox(height: 16),
          
          // Quick Actions Grid
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.5,
            children: List.generate(4, (index) => 
              SkeletonLoader(
                width: double.infinity,
                height: double.infinity,
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 24),
          
          // Statistics Title
          const SkeletonText(fontSize: 18, width: 140),
          const SizedBox(height: 16),
          
          // Statistics Grid
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.2,
            children: List.generate(4, (index) => 
              const SkeletonCard(
                hasImage: false,
                hasTitle: true,
                hasSubtitle: true,
                bodyLines: 1,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class SkeletonBookingList extends StatelessWidget {
  final int itemCount;

  const SkeletonBookingList({
    super.key,
    this.itemCount = 5,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: itemCount,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Container(
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const SkeletonText(fontSize: 16, width: 120),
                    SkeletonLoader(
                      width: 80,
                      height: 24,
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const SkeletonText(fontSize: 14, lines: 2),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const SkeletonText(fontSize: 18, width: 80),
                    SkeletonLoader(
                      width: 60,
                      height: 32,
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// Loading States
class LoadingWidget extends StatelessWidget {
  final String message;
  final bool showSpinner;

  const LoadingWidget({
    super.key,
    this.message = 'Loading...',
    this.showSpinner = true,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (showSpinner) ...[
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFFF6B35)),
            ),
            const SizedBox(height: 16),
          ],
          Text(
            message,
            style: const TextStyle(
              fontSize: 16,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }
}
