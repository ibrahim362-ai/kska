import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:convert';
import '../../../providers/auth_provider.dart';
import '../../../models/models.dart';

class MembershipScreen extends ConsumerStatefulWidget {
  const MembershipScreen({super.key});

  @override
  ConsumerState<MembershipScreen> createState() => _MembershipScreenState();
}

class _MembershipScreenState extends ConsumerState<MembershipScreen> {
  List<Membership> _plans = [];
  List<dynamic> _userMemberships = [];
  bool _loading = true;
  String? _currentMembershipId;
  int _currentLevel = 0;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    final api = ref.read(apiServiceProvider);
    
    try {
      // Fetch all plans
      final plansRes = await api.dio.get('/memberships');
      
      // Fetch user's memberships
      final userMemRes = await api.dio.get('/memberships/my-memberships');
      
      setState(() {
        _plans = (plansRes.data['data'] as List)
            .map((p) => Membership.fromJson(p))
            .toList();
        
        _userMemberships = userMemRes.data['data'] as List;
        
        // Find active membership
        final activeMembership = _userMemberships.firstWhere(
          (m) => m['isActive'] == true && 
                 DateTime.parse(m['expiresAt']).isAfter(DateTime.now()),
          orElse: () => null,
        );
        
        if (activeMembership != null) {
          _currentMembershipId = activeMembership['membershipId'];
          _currentLevel = activeMembership['membership']['level'] ?? 0;
        }
        
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading memberships: $e')),
        );
      }
    }
  }

  Future<void> _purchase(Membership plan) async {
    // Check if already have this plan
    if (_currentMembershipId == plan.id) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('You already have this membership'),
            backgroundColor: Colors.orange,
          ),
        );
      }
      return;
    }

    if (plan.price <= 0) {
      // Free plan - direct activation
      final api = ref.read(apiServiceProvider);
      try {
        await api.dio.post('/memberships/purchase', data: {'membershipId': plan.id, 'autoRenew': false});
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Free plan activated!'),
              backgroundColor: Colors.green,
            ),
          );
          _fetch(); // Refresh
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to activate: $e')),
          );
        }
      }
      return;
    }

    // Paid plan - create payment then navigate to manual payment screen
    final api = ref.read(apiServiceProvider);
    try {
      final res = await api.dio.post('/payments', data: {
        'amount': plan.price,
        'currency': 'ETB',
        'method': 'MANUAL',
        'metadata': jsonEncode({
          'type': 'MEMBERSHIP',
          'targetId': plan.id,
          'targetName': plan.name,
        }),
      });
      final payment = res.data['data'];
      if (!mounted) return;
      context.push('/manual-payment', extra: {
        'paymentId': payment['id'],
        'amount': plan.price,
        'metadata': jsonEncode({
          'type': 'MEMBERSHIP',
          'targetId': plan.id,
          'targetName': plan.name,
        }),
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to start payment: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final icons = {
      'FREE': Icons.star_border,
      'SILVER': Icons.star_half,
      'GOLD': Icons.star,
      'VIP': Icons.diamond_outlined,
      'VVIP': Icons.workspace_premium_rounded, // Crown icon for VVIP
    };

    final gradients = {
      'FREE': [Colors.grey.shade300, Colors.grey.shade500],
      'SILVER': [Colors.blueGrey.shade300, Colors.blueGrey.shade500],
      'GOLD': [Colors.amber.shade400, Colors.orange.shade600],
      'VIP': [Colors.purple.shade400, Colors.pink.shade600],
      'VVIP': [const Color(0xFFFFD700), const Color(0xFFFF6B00)], // Gold to orange gradient
    };

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : CustomScrollView(
              slivers: [
                // App Bar with gradient
                SliverAppBar(
                  expandedHeight: 200,
                  pinned: true,
                  flexibleSpace: FlexibleSpaceBar(
                    background: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Colors.indigo.shade600,
                            Colors.purple.shade600,
                          ],
                        ),
                      ),
                      child: SafeArea(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: 40),
                            const Icon(
                              Icons.workspace_premium,
                              size: 60,
                              color: Colors.white,
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Membership Plans',
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Your current level: $_currentLevel',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.white.withValues(alpha: 0.9),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

                // Current Membership Badge (if any)
                if (_currentLevel > 0)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: gradients[_plans.firstWhere(
                              (p) => p.id == _currentMembershipId,
                              orElse: () => _plans.first,
                            ).planType] ?? [Colors.grey, Colors.grey],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.1),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.all(20),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.3),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.verified,
                                color: Colors.white,
                                size: 32,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Active Membership',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _plans.firstWhere(
                                      (p) => p.id == _currentMembershipId,
                                      orElse: () => _plans.first,
                                    ).name,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(
                              Icons.arrow_forward_ios,
                              color: Colors.white,
                              size: 20,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                // Plans Section Header
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    child: Text(
                      'Available Plans',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade800,
                      ),
                    ),
                  ),
                ),

                // Membership Plans
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final plan = _plans[index];
                        final isCurrentPlan = _currentMembershipId == plan.id;
                        final canUpgrade = plan.level > _currentLevel;
                        
                        return _buildMembershipCard(
                          plan,
                          icons[plan.planType]!,
                          gradients[plan.planType]!,
                          isCurrentPlan,
                          canUpgrade,
                        );
                      },
                      childCount: _plans.length,
                    ),
                  ),
                ),

                // Bottom Spacing
                const SliverToBoxAdapter(
                  child: SizedBox(height: 32),
                ),
              ],
            ),
    );
  }

  Widget _buildMembershipCard(
    Membership plan,
    IconData icon,
    List<Color> gradient,
    bool isCurrentPlan,
    bool canUpgrade,
  ) {
    // Build feature list based on plan type
    List<String> features = [];
    
    if (plan.priorityTicket) {
      features.add('Priority ticket booking');
    }
    if (plan.leaderboardBoost > 1.0) {
      features.add('${plan.leaderboardBoost}x leaderboard boost');
    }
    if (plan.vipSeat) {
      features.add('VIP Seat');
    }
    if (plan.challengeAccess) {
      features.add('Access to challenges');
    }
    if (plan.communityAccess) {
      features.add('Access to special community groups');
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isCurrentPlan 
              ? gradient[0]
              : Colors.grey.shade200,
          width: isCurrentPlan ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isCurrentPlan 
                ? gradient[0].withValues(alpha: 0.3)
                : Colors.black.withValues(alpha: 0.05),
            blurRadius: isCurrentPlan ? 12 : 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header with gradient
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: gradient,
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                // Icon and Level
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(icon, size: 32, color: Colors.white),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        'Level ${plan.level}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Plan Name
                Text(
                  plan.name,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                
                // Price
                if (plan.price > 0)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'ETB ',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        '${plan.price.toInt()}',
                        style: const TextStyle(
                          fontSize: 40,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  )
                else
                  const Text(
                    'FREE',
                    style: TextStyle(
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                
                Text(
                  plan.duration > 9999 ? 'Forever' : '${plan.duration} days',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withValues(alpha: 0.9),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Points Reward Badge
                if (plan.pointsReward > 0) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.green.shade200),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.stars, 
                          size: 20, 
                          color: Colors.green.shade700,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '🎁 Get ${plan.pointsReward} Points Bonus',
                          style: TextStyle(
                            fontSize: 15,
                            color: Colors.green.shade700,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Feature List Title
                if (features.isNotEmpty) ...[
                  Text(
                    '${plan.planType} Features:',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade800,
                    ),
                  ),
                  const SizedBox(height: 12),
                  
                  // Feature List
                  ...features.asMap().entries.map((entry) {
                    final index = entry.key;
                    final feature = entry.value;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            margin: const EdgeInsets.only(top: 2),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: gradient[0].withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '${index + 1}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: gradient[0],
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              feature,
                              style: TextStyle(
                                fontSize: 15,
                                color: Colors.grey.shade700,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ] else ...[
                  // For FREE plan with no features
                  Text(
                    'Basic access only',
                    style: TextStyle(
                      fontSize: 15,
                      color: Colors.grey.shade600,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
                
                // Current Plan Badge
                if (isCurrentPlan) ...[
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: gradient[0].withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: gradient[0]),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.check_circle, 
                          color: gradient[0], 
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Current Plan',
                          style: TextStyle(
                            color: gradient[0],
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // Action Button
                if (!isCurrentPlan) ...[
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () => _purchase(plan),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: canUpgrade 
                            ? gradient[0]
                            : Colors.grey.shade400,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            canUpgrade 
                                ? (plan.price > 0 ? 'Upgrade Now' : 'Activate') 
                                : 'Downgrade',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward, size: 20),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
