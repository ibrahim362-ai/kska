import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../models/models.dart';

class TicketsScreen extends ConsumerStatefulWidget {
  const TicketsScreen({super.key});
  @override
  ConsumerState<TicketsScreen> createState() => _TicketsScreenState();
}

class _TicketsScreenState extends ConsumerState<TicketsScreen> {
  List<TicketModel> _tickets = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _fetch(); }

  Future<void> _fetch() async {
    final api = ref.read(apiProvider);
    final res = await api.dio.get('/tickets', queryParameters: {'limit': 50});
    setState(() {
      _tickets = (res.data['data'] as List).map((t) => TicketModel.fromJson(t)).toList();
      _loading = false;
    });
  }

  Future<void> _delete(String id) async {
    final api = ref.read(apiProvider);
    await api.dio.delete('/tickets/$id');
    _fetch();
  }

  @override
  Widget build(BuildContext context) {
    final colors = {'ACTIVE': Colors.green, 'SOLD_OUT': Colors.red, 'CANCELLED': Colors.grey};
    return Scaffold(
      appBar: AppBar(title: const Text('My Tickets')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/create-ticket'),
        icon: const Icon(Icons.add), label: const Text('New Ticket'),
      ),
      body: RefreshIndicator(
        onRefresh: _fetch,
        child: _loading ? const Center(child: CircularProgressIndicator()) :
        _tickets.isEmpty ? const Center(child: Text('No tickets yet')) :
        ListView.builder(padding: const EdgeInsets.all(16), itemCount: _tickets.length, itemBuilder: (_, i) {
          final t = _tickets[i];
          return Card(margin: const EdgeInsets.only(bottom: 12), child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text(t.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: (colors[t.status] ?? Colors.grey).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                child: Text(t.status, style: TextStyle(fontSize: 11, color: colors[t.status]))),
              PopupMenuButton(itemBuilder: (_) => [
                PopupMenuItem(child: const Text('Delete'), onTap: () => _delete(t.id)),
              ]),
            ]),
            const SizedBox(height: 8),
            Row(children: [
              const Icon(Icons.calendar_today, size: 14, color: Colors.grey), const SizedBox(width: 4),
              Text('${t.eventDate.day}/${t.eventDate.month}/${t.eventDate.year}', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
              const Spacer(),
              Text(t.price > 0 ? 'ETB ${t.price}' : 'FREE', style: const TextStyle(fontWeight: FontWeight.bold)),
            ]),
            const SizedBox(height: 4),
            LinearProgressIndicator(value: t.quantity > 0 ? t.soldCount / t.quantity : 0, minHeight: 6, borderRadius: BorderRadius.circular(3)),
            const SizedBox(height: 4),
            Text('${t.soldCount}/${t.quantity} sold', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
          ])));
        }),
      ),
    );
  }
}
