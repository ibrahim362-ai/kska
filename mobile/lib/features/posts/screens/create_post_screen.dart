import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:typed_data';
import '../../../providers/auth_provider.dart';

class CreatePostScreen extends ConsumerStatefulWidget {
  const CreatePostScreen({super.key});

  @override
  ConsumerState<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends ConsumerState<CreatePostScreen> {
  final _contentCtrl = TextEditingController();
  final _hashtagCtrl = TextEditingController();
  String _type = 'TEXT';
  Uint8List? _mediaBytes;
  bool _loading = false;

  Future<void> _pickMedia() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      final bytes = await picked.readAsBytes();
      setState(() => _mediaBytes = bytes);
    }
  }

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      final api = ref.read(apiServiceProvider);
      final formData = {
        'type': _type,
        'content': _contentCtrl.text,
        if (_hashtagCtrl.text.isNotEmpty) 'hashtags': _hashtagCtrl.text,
      };
      await api.dio.post('/posts', data: formData);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Post created!')));
        context.pop();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Post'), actions: [
        TextButton(onPressed: _loading ? null : _submit, child: const Text('Post')),
      ]),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'TEXT', label: Text('Text'), icon: Icon(Icons.text_fields)),
              ButtonSegment(value: 'IMAGE', label: Text('Image'), icon: Icon(Icons.image)),
              ButtonSegment(value: 'EVENT', label: Text('Event'), icon: Icon(Icons.event)),
            ],
            selected: {_type},
            onSelectionChanged: (v) => setState(() => _type = v.first),
          ),
          const SizedBox(height: 16),
          TextField(controller: _contentCtrl, maxLines: 5,
            decoration: const InputDecoration(labelText: "What's on your mind?", border: OutlineInputBorder(), alignLabelWithHint: true)),
          const SizedBox(height: 12),
          TextField(controller: _hashtagCtrl,
            decoration: const InputDecoration(labelText: 'Hashtags (comma separated)', border: OutlineInputBorder(), prefixText: '#')),
          const SizedBox(height: 12),
          if (_type == 'IMAGE')
            OutlinedButton.icon(onPressed: _pickMedia, icon: const Icon(Icons.image), label: const Text('Pick Image')),
          if (_mediaBytes != null)
            Padding(padding: const EdgeInsets.only(top: 12), child: Image.memory(_mediaBytes!, height: 200, fit: BoxFit.cover)),
        ]),
      ),
    );
  }
}
