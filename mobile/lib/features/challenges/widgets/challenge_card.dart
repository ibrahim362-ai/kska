import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../models/challenge.dart';

class ChallengeCard extends StatelessWidget {
  final Challenge challenge;
  final bool isResponding;
  final VoidCallback onAccept;
  final VoidCallback onReject;
  final VoidCallback onSkip;

  const ChallengeCard({
    super.key,
    required this.challenge,
    required this.isResponding,
    required this.onAccept,
    required this.onReject,
    required this.onSkip,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Challenge Card
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF10B981).withOpacity(0.2),
                    blurRadius: 30,
                    spreadRadius: 5,
                    offset: const Offset(0, 15),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(28),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Image (if available)
                      if (challenge.imageUrl != null)
                        CachedNetworkImage(
                          imageUrl: challenge.imageUrl!,
                          height: 250,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(
                            height: 250,
                            color: const Color(0xFFD1FAE5),
                            child: const Center(
                              child: CircularProgressIndicator(
                                color: Color(0xFF10B981),
                              ),
                            ),
                          ),
                          errorWidget: (context, url, error) => Container(
                            height: 250,
                            color: const Color(0xFFD1FAE5),
                            child: const Icon(
                              Icons.image,
                              size: 64,
                              color: Color(0xFF10B981),
                            ),
                          ),
                        ),
                      
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Type & Points Badge
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [Color(0xFF059669), Color(0xFF10B981)],
                                    ),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.stars,
                                        size: 16,
                                        color: Colors.white,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '+${challenge.points} Points',
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFD1FAE5),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.access_time,
                                        size: 14,
                                        color: Color(0xFF065F46),
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        challenge.timeRemaining,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFF065F46),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            
                            const SizedBox(height: 20),
                            
                            // Title
                            Text(
                              challenge.title,
                              style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF065F46),
                                height: 1.2,
                              ),
                            ),
                            
                            const SizedBox(height: 16),
                            
                            // Description
                            Text(
                              challenge.description,
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey.shade700,
                                height: 1.6,
                              ),
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // Creator Info
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 20,
                                  backgroundColor: const Color(0xFFD1FAE5),
                                  backgroundImage: challenge.creator.avatar != null
                                      ? CachedNetworkImageProvider(challenge.creator.avatar!)
                                      : null,
                                  child: challenge.creator.avatar == null
                                      ? Text(
                                          challenge.creator.fullName[0].toUpperCase(),
                                          style: const TextStyle(
                                            color: Color(0xFF065F46),
                                            fontWeight: FontWeight.bold,
                                          ),
                                        )
                                      : null,
                                ),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      challenge.creator.fullName,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: Color(0xFF065F46),
                                      ),
                                    ),
                                    Text(
                                      '@${challenge.creator.username}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey.shade600,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            )
                .animate()
                .fadeIn(duration: 600.ms)
                .scale(begin: const Offset(0.9, 0.9), curve: Curves.elasticOut),
          ),
          
          const SizedBox(height: 32),
          
          // Action Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // Reject Button
              _ActionButton(
                icon: Icons.close_rounded,
                label: 'Reject',
                color: Colors.red,
                onTap: isResponding ? null : onReject,
              ),
              
              // Accept Button (Larger & Primary)
              _PrimaryActionButton(
                icon: Icons.check_rounded,
                label: 'Accept',
                onTap: isResponding ? null : onAccept,
                isLoading: isResponding,
              ),
              
              // Skip Button
              _ActionButton(
                icon: Icons.arrow_forward_rounded,
                label: 'Skip',
                color: Colors.orange,
                onTap: isResponding ? null : onSkip,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color, width: 2),
          boxShadow: onTap != null
              ? [
                  BoxShadow(
                    color: color.withOpacity(0.2),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ]
              : [],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 32, color: onTap != null ? color : Colors.grey),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: onTap != null ? color : Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PrimaryActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool isLoading;

  const _PrimaryActionButton({
    required this.icon,
    required this.label,
    this.onTap,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
        decoration: BoxDecoration(
          gradient: onTap != null
              ? const LinearGradient(
                  colors: [Color(0xFF059669), Color(0xFF10B981)],
                )
              : null,
          color: onTap == null ? Colors.grey.shade300 : null,
          borderRadius: BorderRadius.circular(24),
          boxShadow: onTap != null
              ? [
                  BoxShadow(
                    color: const Color(0xFF10B981).withOpacity(0.5),
                    blurRadius: 25,
                    spreadRadius: 2,
                    offset: const Offset(0, 12),
                  ),
                ]
              : [],
        ),
        child: isLoading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    icon,
                    size: 40,
                    color: onTap != null ? Colors.white : Colors.grey.shade600,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: onTap != null ? Colors.white : Colors.grey.shade600,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
