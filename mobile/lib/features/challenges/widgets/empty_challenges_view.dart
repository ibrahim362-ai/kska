import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class EmptyChallengesView extends StatelessWidget {
  const EmptyChallengesView({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(40),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF059669), Color(0xFF10B981)],
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF10B981).withOpacity(0.3),
                    blurRadius: 30,
                    spreadRadius: 10,
                  ),
                ],
              ),
              child: const Icon(
                Icons.emoji_events_rounded,
                size: 80,
                color: Colors.white,
              ),
            )
                .animate(onPlay: (controller) => controller.repeat(reverse: true))
                .scale(
                  duration: 2000.ms,
                  begin: const Offset(1, 1),
                  end: const Offset(1.1, 1.1),
                  curve: Curves.easeInOut,
                ),
            
            const SizedBox(height: 40),
            
            const Text(
              'All Caught Up!',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF065F46),
              ),
              textAlign: TextAlign.center,
            )
                .animate()
                .fadeIn(delay: 200.ms, duration: 600.ms),
            
            const SizedBox(height: 16),
            
            Text(
              'No new challenges available right now.\nCheck back later for exciting new opportunities!',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade600,
                height: 1.6,
              ),
              textAlign: TextAlign.center,
            )
                .animate()
                .fadeIn(delay: 400.ms, duration: 600.ms),
            
            const SizedBox(height: 40),
            
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFD1FAE5),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: [
                  const Icon(
                    Icons.lightbulb_outline,
                    size: 48,
                    color: Color(0xFF10B981),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Tip',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF065F46),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Accepting challenges helps you earn points and climb the leaderboard!',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade700,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            )
                .animate()
                .fadeIn(delay: 600.ms, duration: 600.ms)
                .slideY(begin: 0.2, end: 0),
          ],
        ),
      ),
    );
  }
}
