import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../models/models.dart';

class VotesScreen extends ConsumerStatefulWidget {
  const VotesScreen({super.key});
  @override
  ConsumerState<VotesScreen> createState() => _VotesScreenState();
}

class _VotesScreenState extends ConsumerState<VotesScreen> {
  List<Vote> _votes = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _fetch(); }

  Future<void> _fetch() async {
    final api = ref.read(apiProvider);
    final res = await api.dio.get('/votes', queryParameters: {'limit': 50});
    setState(() {
      _votes = (res.data['data'] as List).map((v) => Vote.fromJson(v)).toList();
      _loading = false;
    });
  }

  Future<void> _create() async {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final options = List.generate(4, (i) => TextEditingController());

    final result = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Create Vote'),
      content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
        TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Title', border: OutlineInputBorder())),
        const SizedBox(height: 12),
        TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder())),
        const SizedBox(height: 12),
        ...options.map((c) => Padding(padding: const EdgeInsets.only(bottom: 8), child: TextField(controller: c, decoration: InputDecoration(labelText: 'Option ${options.indexOf(c) + 1}', border: const OutlineInputBorder())))),
      ])),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Create')),
      ],
    ));

    if (result == true) {
      final api = ref.read(apiProvider);
      await api.dio.post('/votes', data: {
        'title': titleCtrl.text, 'description': descCtrl.text,
        'voteType': 'FREE_VOTE',
        'startsAt': DateTime.now().toIso8601String(),
        'endsAt': DateTime.now().add(const Duration(days: 7)).toIso8601String(),
        'options': options.where((c) => c.text.isNotEmpty).map((c) => {'text': c.text}).toList(),
      });
      _fetch();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Votes')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _create, icon: const Icon(Icons.add), label: const Text('Create Vote'),
      ),
      body: RefreshIndicator(
        onRefresh: _fetch,
        child: _loading ? const Center(child: CircularProgressIndicator()) :
        ListView.builder(padding: const EdgeInsets.all(16), itemCount: _votes.length, itemBuilder: (_, i) {
          final v = _votes[i];
          return Card(margin: const EdgeInsets.only(bottom: 8), child: ListTile(
            leading: Icon(v.isActive ? Icons.how_to_vote : Icons.how_to_vote_outlined, color: v.isActive ? Colors.green : Colors.grey),
            title: Text(v.title, style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text('${v.totalVotes} votes  Ends: ${v.endsAt.day}/${v.endsAt.month}'),
            trailing: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: v.isActive ? Colors.green.shade50 : Colors.grey.shade100, borderRadius: BorderRadius.circular(12)),
              child: Text(v.isActive ? 'Active' : 'Ended', style: TextStyle(fontSize: 11, color: v.isActive ? Colors.green : Colors.grey))),
          ));
        }),
      ),
    );
  }
}
