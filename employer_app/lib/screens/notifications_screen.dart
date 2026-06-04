import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../services/socket_service.dart';

class EmployerNotificationsScreen extends ConsumerStatefulWidget {
  const EmployerNotificationsScreen({super.key});
  @override
  ConsumerState<EmployerNotificationsScreen> createState() => _EmployerNotificationsScreenState();
}

class _EmployerNotificationsScreenState extends ConsumerState<EmployerNotificationsScreen> {
  List<Map<String, dynamic>> _notifications = [];
  bool _loading = true;
  String? _filter;

  @override
  void initState() {
    super.initState();
    _fetch();
    final socket = ref.read(socketServiceProvider);
    socket.onNotificationNew((_) => _fetch());
  }

  @override
  void dispose() {
    ref.read(socketServiceProvider).off('notification:new');
    super.dispose();
  }

  Future<void> _fetch() async {
    try {
      final api = ref.read(apiProvider);
      final res = await api.dio.get('/notifications', queryParameters: {'page': 1, 'limit': 50});
      if (mounted) {
        setState(() {
          _notifications = (res.data['data'] as List).cast<Map<String, dynamic>>();
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _markAsRead(String id) async {
    final api = ref.read(apiProvider);
    try {
      await api.dio.put('/notifications/$id/read');
      _fetch();
    } catch (_) {}
  }

  Future<void> _markAllAsRead() async {
    final api = ref.read(apiProvider);
    try {
      await api.dio.put('/notifications/read-all');
      _fetch();
    } catch (_) {}
  }

  IconData _iconForType(String? type) {
    switch (type) {
      case 'TICKET_PURCHASED':
        return Icons.shopping_bag;
      case 'TICKET_CHECKIN':
        return Icons.qr_code_scanner;
      case 'PAYMENT':
        return Icons.payments;
      default:
        return Icons.notifications;
    }
  }

  Color _colorForType(String? type) {
    switch (type) {
      case 'TICKET_PURCHASED':
        return Colors.green;
      case 'TICKET_CHECKIN':
        return Colors.teal;
      case 'PAYMENT':
        return Colors.indigo;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => n['isRead'] != true).length;
    final filtered = _filter == 'UNREAD'
        ? _notifications.where((n) => n['isRead'] != true).toList()
        : _notifications;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Notifications'),
            if (unreadCount > 0)
              Text('$unreadCount unread', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.normal)),
          ],
        ),
        actions: [
          if (unreadCount > 0)
            TextButton(onPressed: _markAllAsRead, child: const Text('Mark all')),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                ChoiceChip(
                  label: Text('All (${_notifications.length})'),
                  selected: _filter == null,
                  onSelected: (_) => setState(() => _filter = null),
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: Text('Unread ($unreadCount)'),
                  selected: _filter == 'UNREAD',
                  onSelected: (_) => setState(() => _filter = 'UNREAD'),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(_filter == 'UNREAD' ? Icons.done_all : Icons.notifications_off, size: 64, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            Text(_filter == 'UNREAD' ? 'All caught up!' : 'No notifications yet',
                                style: TextStyle(color: Colors.grey.shade600)),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _fetch,
                        child: ListView.builder(
                          itemCount: filtered.length,
                          itemBuilder: (_, i) {
                            final n = filtered[i];
                            final createdAt = DateTime.parse(n['createdAt']);
                            return ListTile(
                              leading: Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: _colorForType(n['type']).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(_iconForType(n['type']), color: _colorForType(n['type']), size: 20),
                              ),
                              title: Text(
                                n['title'] ?? '',
                                style: TextStyle(
                                  fontWeight: n['isRead'] == true ? FontWeight.normal : FontWeight.bold,
                                ),
                              ),
                              subtitle: Text(n['message'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis),
                              trailing: n['isRead'] != true
                                  ? Container(
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(color: Colors.indigo, shape: BoxShape.circle),
                                    )
                                  : null,
                              onTap: () {
                                if (n['isRead'] != true) _markAsRead(n['id']);
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
