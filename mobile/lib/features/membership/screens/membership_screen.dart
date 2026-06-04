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
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    final api = ref.read(apiServiceProvider);
    final res = await api.dio.get('/memberships');
    setState(() {
      _plans = (res.data['data'] as List).map((p) => Membership.fromJson(p)).toList();
      _loading = false;
    });
  }

  Future<void> _purchase(Membership plan) async {
    if (plan.price <= 0) {
      // Free plan - direct activation
      final api = ref.read(apiServiceProvider);
      try {
        await api.dio.post('/memberships/purchase', data: {'membershipId': plan.id});
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Free plan activated!')));
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to activate')));
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
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to start payment')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final icons = {'FREE': Icons.star_border, 'SILVER': Icons.star_half, 'GOLD': Icons.star, 'VIP': Icons.diamond_outlined};
    final colors = {'FREE': Colors.grey, 'SILVER': Colors.blueGrey, 'GOLD': Colors.amber.shade700, 'VIP': Colors.purple};

    return Scaffold(
      appBar: AppBar(title: const Text('Membership Plans')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _plans.length,
              itemBuilder: (context, index) {
                final plan = _plans[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(children: [
                      Icon(icons[plan.planType] ?? Icons.star, size: 40, color: colors[plan.planType] ?? Colors.indigo),
                      const SizedBox(height: 8),
                      Text(plan.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(plan.price > 0 ? 'ETB ${plan.price}' : 'FREE', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)),
                      Text('${plan.duration} days', style: TextStyle(color: Colors.grey.shade600)),
                      const SizedBox(height: 12),
                      _benefit('+${plan.extraVotes} extra votes'),
                      _benefit(plan.priorityTicket ? 'Priority ticket access' : 'Standard tickets'),
                      _benefit('${plan.leaderboardBoost}x leaderboard boost'),
                      const SizedBox(height: 16),
                      SizedBox(width: double.infinity, child: FilledButton(
                        onPressed: plan.price > 0 ? () => _purchase(plan) : null,
                        style: FilledButton.styleFrom(backgroundColor: Colors.indigo),
                        child: Text(plan.price > 0 ? 'Subscribe (Manual Pay)' : 'Current Plan'),
                      )),
                    ]),
                  ),
                );
              },
            ),
    );
  }

  Widget _benefit(String text) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(children: [
      const Icon(Icons.check_circle, size: 16, color: Colors.green),
      const SizedBox(width: 8),
      Text(text, style: const TextStyle(fontSize: 14)),
    ]),
  );
}
