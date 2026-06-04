import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:flutter_animate/flutter_animate.dart';
import '../../providers/auth_provider.dart';
import '../../services/socket_service.dart';
import '../theme/app_theme.dart';
import '../widgets/stat_card.dart';
import '../widgets/action_button.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});
  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  bool _loading = true;
  int _totalTickets = 0;
  int _totalSold = 0;
  int _totalCheckIns = 0;
  int _totalPosts = 0;
  int _totalVotes = 0;
  double _revenue = 0;
  List<dynamic> _recentCheckIns = [];
  bool _liveUpdates = true;

  @override
  void initState() {
    super.initState();
    _fetch();

    // Real-time check-in notifications
    final socket = ref.read(socketServiceProvider);
    socket.onTicketCheckedIn((data) {
      if (_liveUpdates) {
        _fetch();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text('${data['userName'] ?? 'Someone'} just checked in!'),
                  ),
                ],
              ),
              duration: const Duration(seconds: 2),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
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
      final results = await Future.wait([
        api.dio.get('/tickets', queryParameters: {'limit': 100, 'creatorId': 'me'}),
        api.dio.get('/posts', queryParameters: {'limit': 1}),
        api.dio.get('/votes', queryParameters: {'limit': 1}),
        api.dio.get('/tickets/my-purchases'),
      ]);
      final tickets = (results[0].data['data'] as List);
      setState(() {
        _totalTickets = tickets.length;
        _totalSold = tickets.fold<int>(0, (sum, t) => sum + ((t['soldCount'] as int?) ?? 0));
        _totalCheckIns = ((results[3].data['data'] as List?) ?? [])
            .where((p) => p['checkedIn'] == true).length;
        _totalPosts = results[1].data['meta']?['total'] ?? 0;
        _totalVotes = results[2].data['meta']?['total'] ?? 0;
        _revenue = (tickets.fold<double>(0, (sum, t) => sum + (((t['price'] as num?) ?? 0) * ((t['soldCount'] as int?) ?? 0))));
        _recentCheckIns = ((results[3].data['data'] as List?) ?? [])
            .where((p) => p['checkedIn'] == true)
            .take(5)
            .toList();
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: Icon(_liveUpdates ? Icons.wifi : Icons.wifi_off, size: 20),
            onPressed: () => setState(() => _liveUpdates = !_liveUpdates),
            tooltip: _liveUpdates ? 'Live updates ON' : 'Live updates OFF',
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF1A1D2E), const Color(0xFF242838)]
                : [const Color(0xFFF8F9FE), const Color(0xFFFFFFFF)],
          ),
        ),
        child: RefreshIndicator(
          onRefresh: _fetch,
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    const SizedBox(height: 60),
                    _buildProfileCard(user).animate().fadeIn(duration: 600.ms).slideY(begin: -0.2, end: 0),
                    const SizedBox(height: 24),
                    _buildOverview(isDark).animate().fadeIn(delay: 200.ms, duration: 600.ms),
                    const SizedBox(height: 16),
                    _buildStatsGrid(),
                    const SizedBox(height: 16),
                    if (_totalSold > 0) _buildSoldChart(),
                    const SizedBox(height: 24),
                    _buildQuickActions().animate().fadeIn(delay: 400.ms, duration: 600.ms),
                    const SizedBox(height: 100),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildProfileCard(Map<String, dynamic>? user) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF667eea).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.3),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              (user?['fullName'] as String?)?.substring(0, 1).toUpperCase() ?? 'E',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 32),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?['fullName'] ?? 'Employer',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
                ),
                const SizedBox(height: 4),
                Text(
                  user?['email'] ?? '',
                  style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 14),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.3),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              user?['role'] ?? 'EMPLOYER',
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverview(bool isDark) {
    return Text(
      'Overview',
      style: TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.bold,
        color: isDark ? Colors.white : const Color(0xFF2D3142),
      ),
    );
  }

  Widget _buildStatsGrid() {
    return Column(
      children: [
        Row(
          children: [
            StatCard(
              label: 'Tickets',
              value: _totalTickets,
              icon: Icons.confirmation_number,
              gradient: AppTheme.infoGradient,
            ),
            const SizedBox(width: 16),
            StatCard(
              label: 'Sold',
              value: _totalSold,
              icon: Icons.shopping_bag,
              gradient: AppTheme.successGradient,
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            StatCard(
              label: 'Check-ins',
              value: _totalCheckIns,
              icon: Icons.qr_code_scanner,
              gradient: AppTheme.primaryGradient,
            ),
            const SizedBox(width: 16),
            StatCard(
              label: 'Revenue',
              value: _revenue.toInt(),
              icon: Icons.attach_money,
              gradient: AppTheme.warningGradient,
              prefix: 'ETB ',
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSoldChart() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Engagement', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: PieChart(
                PieChartData(
                  sectionsSpace: 2,
                  centerSpaceRadius: 50,
                  sections: [
                    PieChartSectionData(
                      value: _totalCheckIns.toDouble(),
                      color: Colors.teal,
                      title: '$_totalCheckIns',
                      titleStyle: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                      radius: 60,
                    ),
                    PieChartSectionData(
                      value: (_totalSold - _totalCheckIns).toDouble().clamp(0, double.infinity),
                      color: Colors.indigo,
                      title: _totalSold > _totalCheckIns ? '${_totalSold - _totalCheckIns}' : '0',
                      titleStyle: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                      radius: 60,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 16,
              runSpacing: 4,
              children: [
                _legendItem(Colors.teal, 'Checked in ($_totalCheckIns)'),
                _legendItem(Colors.indigo, 'Pending (${(_totalSold - _totalCheckIns).clamp(0, _totalSold)})'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _legendItem(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Quick Actions', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        ActionButton(
          title: 'Create Ticket',
          subtitle: 'Create a new event ticket',
          icon: Icons.add_circle_outline,
          iconColor: const Color(0xFF667eea),
          onTap: () => context.push('/create-ticket'),
          delay: 0,
        ),
        ActionButton(
          title: 'Bulk Create',
          subtitle: 'Import multiple tickets from CSV',
          icon: Icons.upload_file,
          iconColor: const Color(0xFF11998e),
          onTap: () => _showBulkImportDialog(),
          delay: 50,
        ),
        ActionButton(
          title: 'Scan QR Code',
          subtitle: 'Check-in attendees',
          icon: Icons.qr_code_scanner,
          iconColor: const Color(0xFF11998e),
          onTap: () => context.push('/scan'),
          delay: 100,
        ),
        ActionButton(
          title: 'View Check-ins',
          subtitle: 'All check-in history',
          icon: Icons.list_alt,
          iconColor: const Color(0xFFf2994a),
          onTap: () => context.push('/checkins'),
          delay: 200,
        ),
      ],
    );
  }

  void _showBulkImportDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Bulk Import'),
        content: const Text('CSV import coming in next update. Use Create Ticket for now.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('OK')),
        ],
      ),
    );
  }
}
