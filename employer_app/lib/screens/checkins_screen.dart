import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:fl_chart/fl_chart.dart';
import '../../providers/auth_provider.dart';
import '../../models/models.dart';
import '../../services/socket_service.dart';

class CheckinsScreen extends ConsumerStatefulWidget {
  const CheckinsScreen({super.key});
  @override
  ConsumerState<CheckinsScreen> createState() => _CheckinsScreenState();
}

class _CheckinsScreenState extends ConsumerState<CheckinsScreen> {
  List<TicketPurchase> _checkins = [];
  bool _loading = true;
  bool _liveUpdates = true;
  int _todayCount = 0;

  @override
  void initState() {
    super.initState();
    _fetch();

    // Listen for live check-in events
    final socket = ref.read(socketServiceProvider);
    socket.onTicketCheckedIn((data) {
      if (_liveUpdates) _fetch();
    });
  }

  @override
  void dispose() {
    ref.read(socketServiceProvider).off('ticket:checkedin');
    super.dispose();
  }

  Future<void> _fetch() async {
    final api = ref.read(apiProvider);
    try {
      final res = await api.dio.get('/tickets/check-ins');
      final data = (res.data['data'] as List)
          .map((p) => TicketPurchase.fromJson(p))
          .where((p) => p.checkedIn)
          .toList();
      final today = DateTime.now();
      final todayCount = data.where((c) =>
          c.checkedInAt != null &&
          c.checkedInAt!.year == today.year &&
          c.checkedInAt!.month == today.month &&
          c.checkedInAt!.day == today.day).length;
      if (mounted) {
        setState(() {
          _checkins = data;
          _todayCount = todayCount;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Check-in History'),
        actions: [
          Row(
            children: [
              Icon(
                _liveUpdates ? Icons.wifi : Icons.wifi_off,
                size: 18,
                color: _liveUpdates ? Colors.green : Colors.grey,
              ),
              const SizedBox(width: 4),
              Switch(
                value: _liveUpdates,
                onChanged: (v) => setState(() => _liveUpdates = v),
              ),
              const SizedBox(width: 8),
            ],
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetch,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Today summary card
                  Card(
                    color: Theme.of(context).colorScheme.primary,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Row(
                        children: [
                          const Icon(Icons.today, color: Colors.white, size: 32),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Today',
                                  style: TextStyle(color: Colors.white70, fontSize: 12),
                                ),
                                Text(
                                  '$_todayCount check-ins',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${_checkins.length} total',
                            style: const TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Hourly chart
                  if (_checkins.isNotEmpty) _buildHourlyChart(),

                  const SizedBox(height: 16),
                  Text(
                    'Recent Check-ins',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),

                  if (_checkins.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(32),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(Icons.event_busy, size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 8),
                            const Text('No check-ins yet'),
                          ],
                        ),
                      ),
                    )
                  else
                    ...(_checkins.map((c) => _buildCheckinCard(c))),
                ],
              ),
            ),
    );
  }

  Widget _buildHourlyChart() {
    // Group check-ins by hour for the last 12 hours
    final now = DateTime.now();
    final hourlyData = List<int>.filled(12, 0);

    for (final c in _checkins) {
      if (c.checkedInAt == null) continue;
      final diff = now.difference(c.checkedInAt!).inHours;
      if (diff >= 0 && diff < 12) {
        hourlyData[11 - diff]++;
      }
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Last 12 hours', style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 12),
            SizedBox(
              height: 150,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: (hourlyData.reduce((a, b) => a > b ? a : b) + 2).toDouble(),
                  barGroups: List.generate(12, (i) {
                    final hour = now.subtract(Duration(hours: 11 - i));
                    return BarChartGroupData(
                      x: i,
                      barRods: [
                        BarChartRodData(
                          toY: hourlyData[i].toDouble(),
                          color: Theme.of(context).colorScheme.primary,
                          width: 12,
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                        ),
                      ],
                    );
                  }),
                  titlesData: FlTitlesData(
                    show: true,
                    leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          final i = value.toInt();
                          if (i % 3 != 0) return const SizedBox.shrink();
                          final hour = now.subtract(Duration(hours: 11 - i));
                          return Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text(
                              DateFormat.Hm().format(hour),
                              style: const TextStyle(fontSize: 9),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  gridData: const FlGridData(show: false),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckinCard(TicketPurchase c) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.green.shade100,
          child: const Icon(Icons.check_circle, color: Colors.green),
        ),
        title: Text(
          c.user?['fullName'] ?? 'Attendee',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(c.ticket?.title ?? 'Ticket', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
            if (c.seatNumber != null)
              Text('Seat: ${c.seatNumber}', style: const TextStyle(fontSize: 12)),
            if (c.checkedInAt != null)
              Text(
                '${timeago.format(c.checkedInAt!, locale: 'en')} · ${DateFormat.MMMd().add_jm().format(c.checkedInAt!)}',
                style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
              ),
          ],
        ),
      ),
    );
  }
}
