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
  String? _debugInfo;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = null;
      _debugInfo = null;
    });

    try {
      final api = ref.read(apiServiceProvider);
      final res = await api.dio.get(
        '/leaderboard',
        queryParameters: {'limit': 50},
      );
      
      if (mounted) {
        // Debug: check response structure
        print('Leaderboard API Response: ${res.data}');
        
        final data = res.data['data'] ?? res.data;
        
        if (data is! List) {
          setState(() {
            _loading = false;
            _error = 'Invalid response format';
            _debugInfo = 'Expected List, got: ${data.runtimeType}';
          });
          return;
        }

        setState(() {
          _entries = data
              .map((e) {
                try {
                  return LeaderboardEntry.fromJson(e);
                } catch (parseError) {
                  print('Error parsing entry: $e, Error: $parseError');
                  return null;
                }
              })
              .whereType<LeaderboardEntry>()
              .toList();
          _loading = false;
          _error = null;
        });
      }
    } catch (e) {
      print('Leaderboard fetch error: $e');
      if (mounted) {
        setState(() {
          _loading = false;
          _error = 'Failed to load leaderboard';
          _debugInfo = e.toString();
        });
      }
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
      appBar: AppBar(
        title: const Text('Leaderboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _fetch,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.error_outline_rounded,
                      size: 64,
                      color: Colors.red.shade300,
                    ),
                    const SizedBox(height: 20),
                    Text(
                      _error!,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                      textAlign: TextAlign.center,
                    ),
                    if (_debugInfo != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey.shade300),
                        ),
                        child: Text(
                          _debugInfo!,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade700,
                            fontFamily: 'monospace',
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                    FilledButton.icon(
                      onPressed: _fetch,
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Try Again'),
                    ),
                  ],
                ),
              ),
            )
          : _entries.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.leaderboard_rounded,
                      size: 80,
                      color: Colors.grey.shade300,
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'No Rankings Yet',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Earn points by signing up and checking in to events!',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Colors.grey.shade600,
                          ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    FilledButton.icon(
                      onPressed: _fetch,
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Refresh'),
                    ),
                  ],
                ),
              ),
            )
          : RefreshIndicator(
              onRefresh: _fetch,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _entries.length,
                itemBuilder: (context, index) {
                  final entry = _entries[index];
                  final isTopThree = index < 3;
                  
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    elevation: isTopThree ? 4 : 0,
                    color: isTopThree
                        ? topColors[index].withValues(alpha: 0.08)
                        : null,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: isTopThree
                          ? BorderSide(
                              color: topColors[index].withValues(alpha: 0.3),
                              width: 1.5,
                            )
                          : BorderSide.none,
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      leading: Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: isTopThree
                              ? LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    topColors[index],
                                    topColors[index].withValues(alpha: 0.7),
                                  ],
                                )
                              : null,
                          color: isTopThree
                              ? null
                              : Theme.of(context)
                                  .primaryColor
                                  .withValues(alpha: 0.1),
                        ),
                        child: Center(
                          child: isTopThree
                              ? Icon(
                                  index == 0
                                      ? Icons.emoji_events_rounded
                                      : index == 1
                                          ? Icons.workspace_premium_rounded
                                          : Icons.military_tech_rounded,
                                  color: Colors.white,
                                  size: 28,
                                )
                              : Text(
                                  '${entry.rank}',
                                  style: TextStyle(
                                    color: Theme.of(context).primaryColor,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 18,
                                  ),
                                ),
                        ),
                      ),
                      title: Text(
                        entry.user.fullName,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
                      subtitle: Text(
                        '@${entry.user.username}',
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Theme.of(context).primaryColor.withValues(alpha: 0.15),
                              Theme.of(context).primaryColor.withValues(alpha: 0.08),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Theme.of(context).primaryColor.withValues(alpha: 0.3),
                            width: 1.5,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.stars_rounded,
                              color: Theme.of(context).primaryColor,
                              size: 22,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              '${entry.score}',
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 20,
                                color: Theme.of(context).primaryColor,
                                letterSpacing: -0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }
}
