import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/auth_provider.dart';
import '../../../models/models.dart';

class VotesScreen extends ConsumerStatefulWidget {
  const VotesScreen({super.key});
  @override
  ConsumerState<VotesScreen> createState() => _VotesScreenState();
}

class _VotesScreenState extends ConsumerState<VotesScreen> {
  List<Vote> _votes = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchVotes();
  }

  Future<void> _fetchVotes() async {
    final api = ref.read(apiServiceProvider);
    final res = await api.dio.get('/votes', queryParameters: {'limit': 20});
    setState(() {
      _votes = (res.data['data'] as List).map((v) => Vote.fromJson(v)).toList();
      _loading = false;
    });
  }

  Future<void> _castVote(String voteId, String optionId) async {
    final api = ref.read(apiServiceProvider);
    try {
      await api.dio.post('/votes/$voteId/cast', data: {'optionId': optionId});
      _fetchVotes();
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Already voted or vote ended')),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Live Votes')),
      body: RefreshIndicator(
        onRefresh: _fetchVotes,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _votes.length,
                itemBuilder: (_, i) => _buildVoteCard(_votes[i]),
              ),
      ),
    );
  }

  Widget _buildVoteCard(Vote vote) {
    final active = vote.isActive;
    final total = vote.totalVotes;
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
                    vote.title,
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
                    color: active ? Colors.green.shade50 : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    active ? 'LIVE' : 'ENDED',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: active ? Colors.green : Colors.grey,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '$total votes',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
            ),
            const SizedBox(height: 12),
            ...vote.options.map((opt) {
              final pct = total > 0 ? (opt.voteCount / total * 100).round() : 0;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: active
                    ? SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          onPressed: () => _castVote(vote.id, opt.id),
                          child: Text(opt.text),
                        ),
                      )
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  opt.text,
                                  style: const TextStyle(fontSize: 14),
                                ),
                              ),
                              Text(
                                '$pct%',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: pct / 100,
                              minHeight: 8,
                            ),
                          ),
                        ],
                      ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
