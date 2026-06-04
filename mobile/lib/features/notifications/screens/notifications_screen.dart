import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../models/models.dart';
import '../../../services/socket_service.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  List<NotificationModel> _notifications = [];
  bool _loading = true;
  String? _filter; // null = all, 'UNREAD' = unread only

  @override
  void initState() {
    super.initState();
    _fetch();

    // Listen for new notifications in real-time
    final socket = ref.read(socketServiceProvider);
    socket.onNotificationNew((data) {
      if (mounted) {
        _fetch(); // Refresh on new notification
      }
    });
  }

  @override
  void dispose() {
    final socket = ref.read(socketServiceProvider);
    socket.off('notification:new');
    super.dispose();
  }

  Future<void> _fetch() async {
    try {
      final api = ref.read(apiServiceProvider);
      final res = await api.dio.get('/notifications', queryParameters: {
        'page': 1,
        'limit': 50,
      });
      if (mounted) {
        setState(() {
          _notifications = (res.data['data'] as List)
              .map((n) => NotificationModel.fromJson(n))
              .toList();
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _markAsRead(String id) async {
    final api = ref.read(apiServiceProvider);
    try {
      await api.dio.put('/notifications/$id/read');
      _fetch();
    } catch (_) {}
  }

  Future<void> _markAllAsRead() async {
    final api = ref.read(apiServiceProvider);
    try {
      await api.dio.put('/notifications/read-all');
      _fetch();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('All marked as read')),
        );
      }
    } catch (_) {}
  }

  Future<void> _deleteNotification(String id) async {
    // (Assuming API endpoint exists or skip)
    setState(() => _notifications.removeWhere((n) => n.id == id));
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'PAYMENT':
      case 'TICKET_PURCHASED':
        return Icons.confirmation_number;
      case 'MEMBERSHIP_ACTIVATED':
        return Icons.workspace_premium;
      case 'POST_LIKE':
      case 'POST_COMMENT':
        return Icons.chat_bubble;
      case 'VOTE':
        return Icons.how_to_vote;
      case 'TICKET_CHECKIN':
        return Icons.qr_code;
      case 'NEW_FOLLOWER':
        return Icons.person_add;
      default:
        return Icons.notifications;
    }
  }

  Color _colorForType(String type) {
    switch (type) {
      case 'PAYMENT':
      case 'MEMBERSHIP_ACTIVATED':
        return Colors.green;
      case 'TICKET_PURCHASED':
      case 'TICKET_CHECKIN':
        return Colors.indigo;
      case 'POST_LIKE':
      case 'POST_COMMENT':
        return Colors.pink;
      case 'VOTE':
        return Colors.orange;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;
    final filtered = _filter == 'UNREAD'
        ? _notifications.where((n) => !n.isRead).toList()
        : _notifications;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Notifications'),
            if (unreadCount > 0)
              Text(
                '$unreadCount unread',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.normal),
              ),
          ],
        ),
        actions: [
          if (unreadCount > 0)
            TextButton.icon(
              onPressed: _markAllAsRead,
              icon: const Icon(Icons.done_all, size: 18),
              label: const Text('Mark all'),
            ),
        ],
      ),
      body: Column(
        children: [
          // Filter
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

          // List
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              _filter == 'UNREAD' ? Icons.done_all : Icons.notifications_off,
                              size: 64,
                              color: Colors.grey.shade400,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              _filter == 'UNREAD' ? 'All caught up!' : 'No notifications yet',
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 15,
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _fetch,
                        child: ListView.builder(
                          itemCount: filtered.length,
                          itemBuilder: (_, i) => _buildNotificationCard(filtered[i]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(NotificationModel n) {
    return Dismissible(
      key: Key(n.id),
      direction: DismissDirection.endToStart,
      background: Container(
        color: Colors.red,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (_) => _deleteNotification(n.id),
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: _colorForType(n.type).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(_iconForType(n.type), color: _colorForType(n.type), size: 20),
        ),
        title: Text(
          n.title,
          style: TextStyle(
            fontWeight: n.isRead ? FontWeight.normal : FontWeight.bold,
            color: n.isRead ? Colors.grey.shade700 : Colors.black87,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 2),
            Text(n.message, maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 2),
            Text(
              timeago.format(n.createdAt, locale: 'en') + ' · ' +
                  DateFormat.MMMd().add_jm().format(n.createdAt),
              style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
            ),
          ],
        ),
        trailing: n.isRead
            ? null
            : Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Colors.indigo,
                  shape: BoxShape.circle,
                ),
              ),
        onTap: () {
          if (!n.isRead) _markAsRead(n.id);
        },
      ),
    );
  }
}
