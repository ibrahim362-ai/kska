import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../providers/auth_provider.dart';
import '../../../models/models.dart';

class TicketsScreen extends ConsumerStatefulWidget {
  const TicketsScreen({super.key});
  @override
  ConsumerState<TicketsScreen> createState() => _TicketsScreenState();
}

class _TicketsScreenState extends ConsumerState<TicketsScreen> {
  List<TicketModel> _tickets = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    final api = ref.read(apiServiceProvider);
    final res = await api.dio.get('/tickets', queryParameters: {'limit': 20});
    setState(() {
      _tickets = (res.data['data'] as List)
          .map((t) => TicketModel.fromJson(t))
          .toList();
      _loading = false;
    });
  }

  Future<void> _buy(TicketModel t) async {
    final api = ref.read(apiServiceProvider);
    try {
      if (t.price > 0) {
        final res = await api.dio.post(
          '/payments/chapa/initialize',
          data: {'amount': t.price, 'currency': 'ETB'},
        );
        if (mounted)
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Payment: ${res.data['data']['checkoutUrl'] ?? 'Complete payment'}',
              ),
            ),
          );
      }
      await api.dio.post('/tickets/purchase', data: {'ticketId': t.id});
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              t.price > 0 ? 'Reserved! Complete payment.' : 'Ticket acquired!',
            ),
          ),
        );
      _fetch();
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tickets'),
        actions: [
          TextButton.icon(
            onPressed: () => context.push('/my-tickets'),
            icon: const Icon(Icons.qr_code, size: 18),
            label: const Text('My Tickets'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetch,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _tickets.isEmpty
            ? const Center(child: Text('No tickets available'))
            : ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _tickets.length,
                itemBuilder: (_, i) => _buildCard(_tickets[i]),
              ),
      ),
    );
  }

  Widget _buildCard(TicketModel t) {
    final colors = {
      'ACTIVE': Colors.green,
      'SOLD_OUT': Colors.red,
      'CANCELLED': Colors.grey,
    };
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    t.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: (colors[t.status] ?? Colors.grey).withValues(
                      alpha: 0.1,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    t.status,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: colors[t.status],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                const SizedBox(width: 4),
                Text(
                  '${t.eventDate.day}/${t.eventDate.month}/${t.eventDate.year}',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                ),
                const Spacer(),
                if (t.location != null) ...[
                  const Icon(Icons.location_on, size: 14, color: Colors.grey),
                  const SizedBox(width: 2),
                  Text(
                    t.location!,
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Text(
                  t.price > 0 ? 'ETB ${t.price}' : 'FREE',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
                const Spacer(),
                Text(
                  '${t.soldCount}/${t.quantity} sold',
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: t.quantity > 0 ? t.soldCount / t.quantity : 0,
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 12),
            if (t.status == 'ACTIVE')
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: () => _buy(t),
                  icon: const Icon(Icons.shopping_cart),
                  label: Text(
                    t.price > 0 ? 'Buy with Chapa' : 'Get Free Ticket',
                  ),
                  style: FilledButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
