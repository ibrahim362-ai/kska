import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../providers/auth_provider.dart';

class MyTicketsScreen extends ConsumerStatefulWidget {
  const MyTicketsScreen({super.key});
  @override
  ConsumerState<MyTicketsScreen> createState() => _MyTicketsScreenState();
}

class _MyTicketsScreenState extends ConsumerState<MyTicketsScreen> {
  List<Map<String, dynamic>> _purchases = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    try {
      final api = ref.read(apiServiceProvider);
      final res = await api.dio.get('/tickets/my-purchases');
      setState(() {
        _purchases = (res.data['data'] as List).cast<Map<String, dynamic>>();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Tickets')),
      body: RefreshIndicator(
        onRefresh: _fetch,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _purchases.isEmpty
            ? const Center(child: Text('No tickets yet'))
            : ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _purchases.length,
                itemBuilder: (_, i) => _buildCard(_purchases[i]),
              ),
      ),
    );
  }

  Widget _buildCard(Map<String, dynamic> p) {
    final ticket = p['ticket'];
    final title = ticket?['title'] ?? 'Unknown Ticket';
    final status = p['status'] as String? ?? 'PENDING';
    final seat = p['seatNumber'] as String?;
    final qrCode = p['qrCode'] as String?;
    final stColors = {
      'PAID': Colors.green,
      'PENDING': Colors.orange,
      'USED': Colors.blue,
      'CANCELLED': Colors.red,
      'REFUNDED': Colors.purple,
    };

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: () => _showDetail(context, p),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      title,
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
                      color: (stColors[status] ?? Colors.grey).withValues(
                        alpha: 0.1,
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      status,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: stColors[status],
                      ),
                    ),
                  ),
                ],
              ),
              if (seat != null) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.event_seat, size: 16, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      'Seat: $seat',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ],
                ),
              ],
              if (qrCode != null) ...[
                const SizedBox(height: 12),
                Center(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: QrImageView(
                      data: qrCode,
                      version: QrVersions.auto,
                      size: 150,
                      padding: const EdgeInsets.all(8),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 6),
              Text(
                'Tap for details',
                style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showDetail(BuildContext context, Map<String, dynamic> p) {
    final ticket = p['ticket'];
    final title = ticket?['title'] ?? 'Unknown';
    final desc = ticket?['description'] as String?;
    final location = ticket?['location'] as String?;
    final date = ticket?['eventDate'] as String?;
    final qrCode = p['qrCode'] as String?;
    final status = p['status'] as String? ?? 'PENDING';
    final seat = p['seatNumber'] as String?;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (_, scrollCtrl) => SingleChildScrollView(
          controller: scrollCtrl,
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    color: Colors.green.shade700,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              if (qrCode != null)
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: QrImageView(
                    data: qrCode,
                    version: QrVersions.auto,
                    size: 250,
                  ),
                ),
              const SizedBox(height: 24),
              if (seat != null)
                _detailRow(Icons.event_seat, 'Seat Number', seat),
              if (location != null)
                _detailRow(Icons.location_on, 'Location', location),
              if (date != null)
                _detailRow(Icons.calendar_today, 'Event Date', date),
              if (desc != null) ...[
                const SizedBox(height: 12),
                _detailRow(Icons.description, 'Description', desc),
              ],
              const SizedBox(height: 12),
              Text(
                'Present this QR code at the event entrance',
                style: TextStyle(
                  color: Colors.grey.shade500,
                  fontSize: 13,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: Colors.grey.shade600),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                ),
                Text(value, style: const TextStyle(fontSize: 15)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
