import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';

class CreateTicketScreen extends ConsumerStatefulWidget {
  const CreateTicketScreen({super.key});
  @override
  ConsumerState<CreateTicketScreen> createState() => _CreateTicketScreenState();
}

class _CreateTicketScreenState extends ConsumerState<CreateTicketScreen> {
  final _title = TextEditingController();
  final _desc = TextEditingController();
  final _price = TextEditingController(text: '0');
  final _qty = TextEditingController(text: '100');
  final _location = TextEditingController();
  DateTime _date = DateTime.now().add(const Duration(days: 7));
  bool _loading = false;

  Future<void> _submit() async {
    if (_title.text.isEmpty) return;
    setState(() => _loading = true);
    try {
      final api = ref.read(apiProvider);
      await api.dio.post('/tickets', data: {
        'title': _title.text, 'description': _desc.text,
        'price': double.parse(_price.text), 'quantity': int.parse(_qty.text),
        'eventDate': _date.toIso8601String(), 'location': _location.text,
      });
      if (mounted) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ticket created!'))); context.pop(); }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Ticket')),
      body: SingleChildScrollView(padding: const EdgeInsets.all(16), child: Column(children: [
        TextField(controller: _title, decoration: const InputDecoration(labelText: 'Title *', border: OutlineInputBorder())),
        const SizedBox(height: 12),
        TextField(controller: _desc, maxLines: 3, decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder(), alignLabelWithHint: true)),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: TextField(controller: _price, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Price (ETB)', border: OutlineInputBorder()))),
          const SizedBox(width: 12),
          Expanded(child: TextField(controller: _qty, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Quantity', border: OutlineInputBorder()))),
        ]),
        const SizedBox(height: 12),
        TextField(controller: _location, decoration: const InputDecoration(labelText: 'Location', border: OutlineInputBorder(), prefixIcon: Icon(Icons.location_on))),
        const SizedBox(height: 12),
        ListTile(
          leading: const Icon(Icons.calendar_today),
          title: const Text('Event Date'),
          subtitle: Text('${_date.day}/${_date.month}/${_date.year}'),
          onTap: () async {
            final d = await showDatePicker(context: context, initialDate: _date, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
            if (d != null) setState(() => _date = d);
          },
        ),
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, height: 48, child: FilledButton(
          onPressed: _loading ? null : _submit,
          child: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Create Ticket'),
        )),
      ])),
    );
  }
}
