import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/auth_provider.dart';
import '../../../models/models.dart';

class LeaderboardScreen extends ConsumerStatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  ConsumerState<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends ConsumerState<LeaderboardScreen> {
  List<LeaderboardEntry> _entries = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    try {
      final api = ref.read(apiServiceProvider);
      final res = await api.dio.get(
        '/leaderboard',
        queryParameters: {'limit': 50},
      );
      if (mounted)
        setState(() {
          _entries = (res.data['data'] as List)
              .map((e) => LeaderboardEntry.fromJson(e))
              .toList();
          _loading = false;
          _error = null;
        });
    } catch (e) {
      if (mounted)
        setState(() {
          _loading = false;
          _error = 'Error: ${e.toString().substring(0, 80)}';
        });
    }
  }

  @override
  Widget build(BuildContext context) {
    final topColors = [
      Colors.amber.shade700,
      Colors.grey.shade500,
      Colors.brown.shade400,
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Leaderboard')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.cloud_off, size: 48, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  Text(_error!, style: TextStyle(color: Colors.grey.shade600)),
                  const SizedBox(height: 16),
                  FilledButton.tonal(
                    onPressed: _fetch,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _entries.length,
              itemBuilder: (context, index) {
                final entry = _entries[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  color: index < 3
                      ? topColors[index].withValues(alpha: 0.05)
                      : null,
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: index < 3
                          ? topColors[index]
                          : Colors.indigo.shade100,
                      child: Text(
                        '${entry.rank}',
                        style: TextStyle(
                          color: index < 3 ? Colors.white : Colors.indigo,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(
                      entry.user.fullName,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    subtitle: Text('@${entry.user.username}'),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '${entry.score}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                        Text(
                          'pts',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
