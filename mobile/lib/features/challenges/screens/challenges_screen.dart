import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../providers/challenge_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../models/challenge.dart';
import '../widgets/challenge_card.dart';
import '../widgets/empty_challenges_view.dart';
import 'challenge_history_screen.dart';

class ChallengesScreen extends ConsumerStatefulWidget {
  const ChallengesScreen({super.key});

  @override
  ConsumerState<ChallengesScreen> createState() => _ChallengesScreenState();
}

class _ChallengesScreenState extends ConsumerState<ChallengesScreen> {
  int _currentIndex = 0;
  bool _isResponding = false;
  bool _isCheckingMembership = true;
  bool _canAcceptChallenges = false;
  String _membershipLevel = 'FREE';

  @override
  void initState() {
    super.initState();
    _checkMembership();
  }

  Future<void> _checkMembership() async {
    try {
      final api = ref.read(apiServiceProvider);
      final response = await api.dio.get('/memberships/my-memberships');
      
      final memberships = response.data['data'] as List;
      
      // Find active membership
      final activeMembership = memberships.firstWhere(
        (m) => m['isActive'] == true && 
               DateTime.parse(m['expiresAt']).isAfter(DateTime.now()),
        orElse: () => null,
      );
      
      if (mounted) {
        setState(() {
          if (activeMembership != null) {
            _canAcceptChallenges = activeMembership['membership']['challengeAccess'] ?? false;
            _membershipLevel = activeMembership['membership']['planType'] ?? 'FREE';
          } else {
            _canAcceptChallenges = false;
            _membershipLevel = 'FREE';
          }
          _isCheckingMembership = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _canAcceptChallenges = false;
          _membershipLevel = 'FREE';
          _isCheckingMembership = false;
        });
      }
    }
  }

  void _showUpgradeDialog() {
    showDialog(
      context: context,
      builder: (dialogContext) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFEF4444), Color(0xFFF59E0B)],
                  ),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.lock_rounded,
                  size: 64,
                  color: Colors.white,
                ),
              )
                  .animate()
                  .scale(duration: 600.ms, curve: Curves.elasticOut),
              
              const SizedBox(height: 24),
              
              const Text(
                'Upgrade Required',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF991B1B),
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 12),
              
              const Text(
                'To accept challenges, you need to upgrade your membership to SILVER or higher.',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF6B7280),
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 8),
              
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFDE047)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.info_outline,
                          size: 20,
                          color: Color(0xFF92400E),
                        ),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            'Your current plan: $_membershipLevel',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF92400E),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'You can still view challenges, but cannot accept them.',
                      style: TextStyle(
                        fontSize: 12,
                        color: Color(0xFF92400E),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 24),
              
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(dialogContext).pop(),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: Color(0xFF9CA3AF)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text(
                        'Maybe Later',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF6B7280),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () async {
                        // Close dialog first
                        Navigator.of(dialogContext).pop();
                        // Wait a bit for dialog animation to complete
                        await Future.delayed(const Duration(milliseconds: 300));
                        // Then navigate using go instead of push
                        if (mounted) {
                          context.go('/membership');
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF59E0B),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text(
                        'View Plans',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleAccept(Challenge challenge) async {
    if (_isResponding) return;
    
    // Check if user can accept challenges
    if (!_canAcceptChallenges) {
      _showUpgradeDialog();
      return;
    }
    
    setState(() => _isResponding = true);
    
    try {
      await ref.read(challengeResponseProvider.notifier).respondToChallenge(
        challengeId: challenge.id,
        action: 'ACCEPT',
      );
      
      if (mounted) {
        _showSuccessDialog(challenge);
        _moveToNext();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to accept challenge: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isResponding = false);
      }
    }
  }

  Future<void> _handleReject(Challenge challenge) async {
    if (_isResponding) return;
    
    setState(() => _isResponding = true);
    
    try {
      await ref.read(challengeResponseProvider.notifier).respondToChallenge(
        challengeId: challenge.id,
        action: 'REJECT',
      );
      
      if (mounted) {
        _moveToNext();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to reject challenge: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isResponding = false);
      }
    }
  }

  Future<void> _handleSkip(Challenge challenge) async {
    if (_isResponding) return;
    
    setState(() => _isResponding = true);
    
    try {
      await ref.read(challengeResponseProvider.notifier).respondToChallenge(
        challengeId: challenge.id,
        action: 'SKIP',
      );
      
      if (mounted) {
        _moveToNext();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to skip challenge: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isResponding = false);
      }
    }
  }

  void _moveToNext() {
    // Invalidate to refresh the list
    ref.invalidate(activeChallengesProvider);
    
    // Reset current index to show next challenge
    setState(() {
      _currentIndex = 0; // Reset to first after refresh
    });
  }

  void _showSuccessDialog(Challenge challenge) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (successDialogContext) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF059669), Color(0xFF10B981)],
                  ),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle,
                  size: 64,
                  color: Colors.white,
                ),
              )
                  .animate()
                  .scale(duration: 600.ms, curve: Curves.elasticOut),
              
              const SizedBox(height: 24),
              
              const Text(
                'Challenge Accepted!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF065F46),
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 12),
              
              const Text(
                'Your response has been recorded.\nPoints will be awarded by admin after review.',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF6B7280),
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 24),
              
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(successDialogContext).pop();
                    // Auto-refresh to show next challenge
                    Future.delayed(const Duration(milliseconds: 300), () {
                      if (mounted) {
                        ref.invalidate(activeChallengesProvider);
                      }
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Continue',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final challengesAsync = ref.watch(activeChallengesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF0FDF4),
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Challenges'),
            const SizedBox(width: 12),
            // Membership status badge
            if (!_isCheckingMembership)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _canAcceptChallenges 
                      ? const Color(0xFF10B981).withOpacity(0.2)
                      : const Color(0xFFF59E0B).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: _canAcceptChallenges 
                        ? const Color(0xFF10B981)
                        : const Color(0xFFF59E0B),
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _canAcceptChallenges ? Icons.check_circle : Icons.lock,
                      size: 14,
                      color: _canAcceptChallenges 
                          ? const Color(0xFF065F46)
                          : const Color(0xFF92400E),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _membershipLevel,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: _canAcceptChallenges 
                            ? const Color(0xFF065F46)
                            : const Color(0xFF92400E),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ChallengeHistoryScreen(),
                ),
              );
            },
            tooltip: 'Challenge History',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(activeChallengesProvider);
              _checkMembership(); // Re-check membership status too
            },
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: challengesAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(
            color: Color(0xFF10B981),
          ),
        ),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.red,
              ),
              const SizedBox(height: 16),
              Text(
                'Failed to load challenges',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                error.toString(),
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => ref.invalidate(activeChallengesProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (challenges) {
          if (challenges.isEmpty || _currentIndex >= challenges.length) {
            return const EmptyChallengesView();
          }

          final challenge = challenges[_currentIndex];

          return Column(
            children: [
              // Progress indicator
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Row(
                  children: [
                    Text(
                      '${_currentIndex + 1} / ${challenges.length}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF065F46),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: LinearProgressIndicator(
                        value: (_currentIndex + 1) / challenges.length,
                        backgroundColor: const Color(0xFFD1FAE5),
                        valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
                        minHeight: 8,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ],
                ),
              ),
              
              // Challenge Card
              Expanded(
                child: ChallengeCard(
                  challenge: challenge,
                  isResponding: _isResponding,
                  onAccept: () => _handleAccept(challenge),
                  onReject: () => _handleReject(challenge),
                  onSkip: () => _handleSkip(challenge),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
