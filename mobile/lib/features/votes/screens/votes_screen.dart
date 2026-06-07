import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/auth_provider.dart';
import '../../../models/models.dart';

class VotesScreen extends ConsumerStatefulWidget {
  const VotesScreen({super.key});
  @override
  ConsumerState<VotesScreen> createState() => _VotesScreenState();
}

class _VotesScreenState extends ConsumerState<VotesScreen>
    with SingleTickerProviderStateMixin {
  List<Vote> _votes = [];
  bool _loading = true;
  String? _error;
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    )..forward();
    _fetchVotes();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _fetchVotes() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    
    try {
      final api = ref.read(apiServiceProvider);
      final res = await api.dio.get('/votes', queryParameters: {'limit': 20});
      setState(() {
        // Show active votes that are live OR within their time window
        final allVotes = (res.data['data'] as List).map((v) => Vote.fromJson(v)).toList();
        final now = DateTime.now();
        
        _votes = allVotes.where((v) {
          // Show if it's marked as live
          if (v.isLive) return true;
          
          // Or show if it's active and within the voting period
          if (v.isActive && v.startsAt.isBefore(now) && v.endsAt.isAfter(now)) {
            return true;
          }
          
          return false;
        }).toList();
        
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load votes. Pull to refresh.';
        _loading = false;
      });
    }
  }

  Future<void> _castVote(String voteId, String optionId) async {
    final api = ref.read(apiServiceProvider);
    
    // Show loading indicator on the specific option
    setState(() {
      _votes = _votes.map((v) {
        if (v.id == voteId) {
          return v.copyWith(
            // Mark as processing
          );
        }
        return v;
      }).toList();
    });
    
    try {
      await api.dio.post('/votes/$voteId/cast', data: {'optionId': optionId});
      
      // Update local state to mark as voted with animation
      setState(() {
        final voteIndex = _votes.indexWhere((v) => v.id == voteId);
        if (voteIndex != -1) {
          _votes[voteIndex] = _votes[voteIndex].copyWith(
            hasVoted: true,
            userVotedOptionId: optionId,
          );
        }
      });
      
      // Show success animation and message
      if (mounted) {
        // Haptic feedback (if available)
        try {
          HapticFeedback.mediumImpact();
        } catch (_) {}
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.white.withOpacity(0.3),
                          Colors.white.withOpacity(0.1),
                        ],
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check_circle_rounded,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Text(
                          'Vote Recorded!',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.3,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Your vote has been successfully cast',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            margin: const EdgeInsets.all(16),
            elevation: 8,
            duration: const Duration(seconds: 3),
          ),
        );
        
        // Wait a bit before fetching to show animation
        await Future.delayed(const Duration(milliseconds: 500));
      }
      
      // Fetch updated results
      _fetchVotes();
    } catch (e) {
      // Reset state on error
      setState(() {
        _votes = _votes.map((v) {
          if (v.id == voteId) {
            return v.copyWith(
              hasVoted: false,
              userVotedOptionId: null,
            );
          }
          return v;
        }).toList();
      });
      
      if (mounted) {
        try {
          HapticFeedback.heavyImpact();
        } catch (_) {}
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.white.withOpacity(0.3),
                          Colors.white.withOpacity(0.1),
                        ],
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.error_outline_rounded,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Text(
                          'Vote Failed',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.3,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Already voted or vote ended',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            backgroundColor: Colors.red.shade600,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            margin: const EdgeInsets.all(16),
            elevation: 8,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Live Votes')),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Theme.of(context).primaryColor.withOpacity(0.03),
              Theme.of(context).colorScheme.secondary.withOpacity(0.01),
            ],
          ),
        ),
        child: RefreshIndicator(
          onRefresh: _fetchVotes,
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.red.shade50,
                                    Colors.red.shade100.withOpacity(0.5),
                                  ],
                                ),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.error_outline_rounded,
                                size: 64,
                                color: Colors.red.shade300,
                              ),
                            ),
                            const SizedBox(height: 24),
                            Text(
                              _error!,
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 24),
                            FilledButton.icon(
                              onPressed: _fetchVotes,
                              icon: const Icon(Icons.refresh_rounded),
                              label: const Text('Try Again'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : _votes.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.how_to_vote_rounded,
                                  size: 80,
                                  color: Colors.grey.shade300,
                                ),
                                const SizedBox(height: 20),
                                Text(
                                  'No Live Votes',
                                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                        fontWeight: FontWeight.w700,
                                      ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  'Check back later for new polls',
                                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                        color: Colors.grey.shade600,
                                      ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          itemCount: _votes.length,
                          itemBuilder: (_, i) => _buildVoteCard(_votes[i], i),
                        ),
        ),
      ),
    );
  }

  Widget _buildVoteCard(Vote vote, int index) {
    final active = vote.isActive;
    final total = vote.totalVotes;
    final hasVoted = vote.hasVoted;
    
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 400 + (index * 100)),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white,
              hasVoted 
                  ? Theme.of(context).primaryColor.withOpacity(0.03)
                  : Colors.white,
            ],
          ),
          boxShadow: [
            BoxShadow(
              color: hasVoted 
                  ? Theme.of(context).primaryColor.withOpacity(0.15)
                  : Colors.black.withOpacity(0.06),
              blurRadius: hasVoted ? 16 : 12,
              offset: const Offset(0, 4),
              spreadRadius: hasVoted ? 2 : 0,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(
                color: hasVoted 
                    ? Theme.of(context).primaryColor.withOpacity(0.2)
                    : Colors.grey.shade200,
                width: hasVoted ? 2 : 1.5,
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                // Header with icon, title, and status
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Vote Icon
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: active
                              ? [
                                  Theme.of(context).primaryColor,
                                  Theme.of(context).colorScheme.secondary,
                                ]
                              : [
                                  Colors.grey.shade300,
                                  Colors.grey.shade400,
                                ],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: active
                                ? Theme.of(context).primaryColor.withOpacity(0.3)
                                : Colors.grey.withOpacity(0.2),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Icon(
                        active ? Icons.how_to_vote_rounded : Icons.lock_rounded,
                        color: Colors.white,
                        size: 26,
                      ),
                    ),
                    const SizedBox(width: 16),
                    // Title and Vote Count
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            vote.title,
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 19,
                              letterSpacing: -0.5,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Icon(
                                Icons.people_rounded,
                                size: 16,
                                color: Colors.grey.shade600,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                '$total ${total == 1 ? 'vote' : 'votes'}',
                                style: TextStyle(
                                  color: Colors.grey.shade600,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    // Status Badge
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            gradient: active
                                ? const LinearGradient(
                                    colors: [Color(0xFF10B981), Color(0xFF34D399)],
                                  )
                                : LinearGradient(
                                    colors: [Colors.grey.shade500, Colors.grey.shade400],
                                  ),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: active
                                ? [
                                    BoxShadow(
                                      color: const Color(0xFF10B981).withOpacity(0.4),
                                      blurRadius: 10,
                                      spreadRadius: 1,
                                    ),
                                  ]
                                : null,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                active ? 'LIVE' : 'ENDED',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  letterSpacing: 1.0,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (hasVoted) ...[
                          const SizedBox(height: 8),
                          TweenAnimationBuilder<double>(
                            tween: Tween(begin: 0.0, end: 1.0),
                            duration: const Duration(milliseconds: 600),
                            curve: Curves.elasticOut,
                            builder: (context, value, child) {
                              return Transform.scale(
                                scale: value,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        Theme.of(context).primaryColor,
                                        Theme.of(context).colorScheme.secondary,
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(10),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Theme.of(context).primaryColor.withOpacity(0.3),
                                        blurRadius: 8,
                                        spreadRadius: 1,
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: const [
                                      Icon(
                                        Icons.check_circle_rounded,
                                        size: 14,
                                        color: Colors.white,
                                      ),
                                      SizedBox(width: 6),
                                      Text(
                                        'Voted',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                          color: Colors.white,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Vote Options
                ...vote.options.map((opt) {
                  final pct = total > 0 ? (opt.voteCount / total * 100).round() : 0;
                  final isSelected = hasVoted && vote.userVotedOptionId == opt.id;
                  final isWinning = vote.options.every((o) => opt.voteCount >= o.voteCount) && opt.voteCount > 0;
                  
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: active && !hasVoted
                        // Votable Option Button
                        ? _buildVotableOption(context, vote, opt)
                        // Result Display
                        : _buildResultOption(context, opt, pct, isSelected, isWinning, hasVoted),
                  );
                }),
              ],
            ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVotableOption(BuildContext context, Vote vote, VoteOption opt) {
    return TweenAnimationBuilder<double>(
      key: ValueKey('votable_${opt.id}'),
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOut,
      builder: (context, value, child) {
        return Transform.scale(
          scale: 0.95 + (value * 0.05),
          child: Opacity(
            opacity: value.clamp(0.0, 1.0),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Theme.of(context).primaryColor.withOpacity(0.08),
                    Theme.of(context).colorScheme.secondary.withOpacity(0.05),
                  ],
                ),
                border: Border.all(
                  color: Theme.of(context).primaryColor.withOpacity(0.25),
                  width: 2,
                ),
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => _castVote(vote.id, opt.id),
                  borderRadius: BorderRadius.circular(16),
                  splashColor: Theme.of(context).primaryColor.withOpacity(0.1),
                  highlightColor: Theme.of(context).primaryColor.withOpacity(0.05),
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Row(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Theme.of(context).primaryColor,
                              width: 2.5,
                            ),
                            color: Colors.white,
                          ),
                          child: Center(
                            child: Container(
                              width: 10,
                              height: 10,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Theme.of(context).primaryColor.withOpacity(0.3),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(
                            opt.text,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: Colors.grey.shade800,
                              letterSpacing: -0.2,
                            ),
                          ),
                        ),
                        Icon(
                          Icons.touch_app_rounded,
                          size: 22,
                          color: Theme.of(context).primaryColor.withOpacity(0.6),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildResultOption(BuildContext context, VoteOption opt, int pct, bool isSelected, bool isWinning, bool hasVoted) {
    return TweenAnimationBuilder<double>(
      key: ValueKey('result_${opt.id}_$isSelected'),
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 700),
      curve: Curves.easeOutBack,
      builder: (context, animValue, child) {
        return Transform.scale(
          scale: 0.95 + (animValue * 0.05),
          child: Opacity(
            opacity: animValue.clamp(0.0, 1.0),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: isSelected
                    ? LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Theme.of(context).primaryColor.withOpacity(0.12),
                          Theme.of(context).colorScheme.secondary.withOpacity(0.08),
                        ],
                      )
                    : null,
                color: isSelected ? null : Colors.grey.shade50,
                border: Border.all(
                  color: isSelected
                      ? Theme.of(context).primaryColor.withOpacity(0.4)
                      : Colors.grey.shade200,
                  width: isSelected ? 2.5 : 1.5,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: Theme.of(context).primaryColor.withOpacity(0.2),
                          blurRadius: 16,
                          spreadRadius: 2,
                          offset: const Offset(0, 6),
                        ),
                      ]
                    : null,
              ),
              child: Stack(
                children: [
                  // Background Progress Bar
                  Positioned.fill(
                    child: TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0.0, end: pct / 100),
                      duration: const Duration(milliseconds: 1200),
                      curve: Curves.easeOutCubic,
                      builder: (context, value, child) {
                        return ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Row(
                            children: [
                              Expanded(
                                flex: (value * 100).round(),
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: isSelected
                                          ? [
                                              Theme.of(context).primaryColor.withOpacity(0.15),
                                              Theme.of(context).colorScheme.secondary.withOpacity(0.10),
                                            ]
                                          : [
                                              Colors.grey.shade200,
                                              Colors.grey.shade100,
                                            ],
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                flex: 100 - (value * 100).round(),
                                child: const SizedBox(),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                  // Content
                  Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            // Checkbox
                            TweenAnimationBuilder<double>(
                              tween: Tween(begin: 0.0, end: isSelected ? 1.0 : 0.0),
                              duration: const Duration(milliseconds: 500),
                              curve: Curves.elasticOut,
                              builder: (context, checkValue, child) {
                                return Container(
                                  width: 32,
                                  height: 32,
                                  decoration: BoxDecoration(
                                    gradient: isSelected
                                        ? LinearGradient(
                                            colors: [
                                              Theme.of(context).primaryColor,
                                              Theme.of(context).colorScheme.secondary,
                                            ],
                                          )
                                        : null,
                                    color: isSelected ? null : Colors.transparent,
                                    shape: BoxShape.circle,
                                    border: isSelected
                                        ? null
                                        : Border.all(
                                            color: Colors.grey.shade400,
                                            width: 2.5,
                                          ),
                                    boxShadow: isSelected
                                        ? [
                                            BoxShadow(
                                              color: Theme.of(context).primaryColor.withOpacity(0.5),
                                              blurRadius: 12,
                                              spreadRadius: 2,
                                            ),
                                          ]
                                        : null,
                                  ),
                                  child: Transform.scale(
                                    scale: checkValue,
                                    child: const Icon(
                                      Icons.check_rounded,
                                      color: Colors.white,
                                      size: 22,
                                    ),
                                  ),
                                );
                              },
                            ),
                            const SizedBox(width: 14),
                            // Option Text
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    opt.text,
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                      color: isSelected
                                          ? Theme.of(context).primaryColor
                                          : Colors.grey.shade800,
                                      letterSpacing: -0.2,
                                    ),
                                  ),
                                  if (isSelected) ...[
                                    const SizedBox(height: 4),
                                    TweenAnimationBuilder<double>(
                                      tween: Tween(begin: 0.0, end: 1.0),
                                      duration: const Duration(milliseconds: 600),
                                      curve: Curves.easeOut,
                                      builder: (context, value, child) {
                                        return Transform.translate(
                                          offset: Offset(0, 8 * (1 - value)),
                                          child: Opacity(
                                            opacity: value,
                                            child: Row(
                                              children: [
                                                Icon(
                                                  Icons.star_rounded,
                                                  size: 14,
                                                  color: Theme.of(context).primaryColor,
                                                ),
                                                const SizedBox(width: 6),
                                                Text(
                                                  'Your choice',
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w700,
                                                    color: Theme.of(context).primaryColor,
                                                    letterSpacing: 0.2,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            // Percentage Badge
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                gradient: isSelected
                                    ? LinearGradient(
                                        colors: [
                                          Theme.of(context).primaryColor,
                                          Theme.of(context).colorScheme.secondary,
                                        ],
                                      )
                                    : LinearGradient(
                                        colors: [
                                          Colors.grey.shade300,
                                          Colors.grey.shade200,
                                        ],
                                      ),
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: isSelected
                                    ? [
                                        BoxShadow(
                                          color: Theme.of(context).primaryColor.withOpacity(0.3),
                                          blurRadius: 8,
                                          spreadRadius: 1,
                                        ),
                                      ]
                                    : null,
                              ),
                              child: Text(
                                '$pct%',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w900,
                                  color: isSelected ? Colors.white : Colors.grey.shade700,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        // Vote Count
                        Row(
                          children: [
                            Icon(
                              Icons.people_rounded,
                              size: 14,
                              color: isSelected
                                  ? Theme.of(context).primaryColor
                                  : Colors.grey.shade500,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              '${opt.voteCount} ${opt.voteCount == 1 ? 'vote' : 'votes'}',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: isSelected
                                    ? Theme.of(context).primaryColor
                                    : Colors.grey.shade600,
                              ),
                            ),
                            if (isWinning && hasVoted) ...[
                              const SizedBox(width: 8),
                              Icon(
                                Icons.emoji_events_rounded,
                                size: 16,
                                color: Colors.amber.shade600,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                'Leading',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.amber.shade700,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
