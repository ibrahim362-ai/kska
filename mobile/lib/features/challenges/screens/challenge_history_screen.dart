import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../providers/challenge_provider.dart';
import '../../../models/challenge.dart';

class ChallengeHistoryScreen extends ConsumerStatefulWidget {
  const ChallengeHistoryScreen({super.key});

  @override
  ConsumerState<ChallengeHistoryScreen> createState() => _ChallengeHistoryScreenState();
}

class _ChallengeHistoryScreenState extends ConsumerState<ChallengeHistoryScreen> {
  int _currentPage = 1;

  @override
  Widget build(BuildContext context) {
    final historyAsync = ref.watch(challengeHistoryProvider(_currentPage));

    return Scaffold(
      backgroundColor: const Color(0xFFF0FDF4),
      appBar: AppBar(
        title: const Text('Challenge History'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: historyAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(
            color: Color(0xFF10B981),
          ),
        ),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'Failed to load history',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => ref.invalidate(challengeHistoryProvider(_currentPage)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (data) {
          final responses = data['responses'] as List<ChallengeResponse>;
          
          if (responses.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.history,
                    size: 80,
                    color: Color(0xFF10B981),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'No History Yet',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF065F46),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Start accepting challenges to build your history!',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey.shade600,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: responses.length,
            itemBuilder: (context, index) {
              final response = responses[index];
              return _HistoryCard(response: response)
                  .animate()
                  .fadeIn(delay: (index * 50).ms, duration: 400.ms)
                  .slideX(begin: 0.2, end: 0);
            },
          );
        },
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final ChallengeResponse response;

  const _HistoryCard({required this.response});

  Color get _actionColor {
    switch (response.action) {
      case 'ACCEPT':
        return const Color(0xFF10B981);
      case 'REJECT':
        return Colors.red;
      case 'SKIP':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  IconData get _actionIcon {
    switch (response.action) {
      case 'ACCEPT':
        return Icons.check_circle;
      case 'REJECT':
        return Icons.cancel;
      case 'SKIP':
        return Icons.arrow_forward;
      default:
        return Icons.help;
    }
  }

  String get _actionLabel {
    switch (response.action) {
      case 'ACCEPT':
        return 'Accepted';
      case 'REJECT':
        return 'Rejected';
      case 'SKIP':
        return 'Skipped';
      default:
        return response.action;
    }
  }

  @override
  Widget build(BuildContext context) {
    final challenge = response.challenge;
    
    if (challenge == null) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: _actionColor.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          // Challenge Image (if available)
          if (challenge.imageUrl != null)
            ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
              child: CachedNetworkImage(
                imageUrl: challenge.imageUrl!,
                height: 150,
                width: double.infinity,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  height: 150,
                  color: const Color(0xFFD1FAE5),
                  child: const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFF10B981),
                    ),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  height: 150,
                  color: const Color(0xFFD1FAE5),
                  child: const Icon(Icons.image, size: 48, color: Color(0xFF10B981)),
                ),
              ),
            ),
          
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Action Badge
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _actionColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: _actionColor, width: 1.5),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(_actionIcon, size: 16, color: _actionColor),
                          const SizedBox(width: 6),
                          Text(
                            _actionLabel,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: _actionColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    if (response.isAccepted)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF059669), Color(0xFF10B981)],
                          ),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.stars, size: 14, color: Colors.white),
                            const SizedBox(width: 4),
                            Text(
                              '+${challenge.points}',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // Title
                Text(
                  challenge.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF065F46),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                
                const SizedBox(height: 8),
                
                // Description
                Text(
                  challenge.description,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                
                const SizedBox(height: 12),
                
                // Date
                Row(
                  children: [
                    Icon(Icons.access_time, size: 14, color: Colors.grey.shade500),
                    const SizedBox(width: 4),
                    Text(
                      _formatDate(response.createdAt),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
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

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    
    if (diff.inDays > 7) {
      return '${date.day}/${date.month}/${date.year}';
    } else if (diff.inDays > 0) {
      return '${diff.inDays}d ago';
    } else if (diff.inHours > 0) {
      return '${diff.inHours}h ago';
    } else if (diff.inMinutes > 0) {
      return '${diff.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}
