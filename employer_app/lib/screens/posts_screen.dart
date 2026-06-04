import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../providers/auth_provider.dart';
import '../../models/models.dart';

class PostsScreen extends ConsumerStatefulWidget {
  const PostsScreen({super.key});
  @override
  ConsumerState<PostsScreen> createState() => _PostsScreenState();
}

class _PostsScreenState extends ConsumerState<PostsScreen> {
  List<Post> _posts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    final api = ref.read(apiProvider);
    final res = await api.dio.get('/posts', queryParameters: {'limit': 50});
    setState(() {
      _posts = (res.data['data'] as List).map((p) => Post.fromJson(p)).toList();
      _loading = false;
    });
  }

  Future<void> _create() async {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final hashtagCtrl = TextEditingController();
    String type = 'TEXT';
    XFile? pickedImage;

    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDlgState) => AlertDialog(
          title: const Text('Create Post'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(
                      value: 'TEXT',
                      label: Text('Text'),
                      icon: Icon(Icons.text_fields),
                    ),
                    ButtonSegment(
                      value: 'IMAGE',
                      label: Text('Image'),
                      icon: Icon(Icons.image),
                    ),
                    ButtonSegment(
                      value: 'ANNOUNCEMENT',
                      label: Text('Announce'),
                      icon: Icon(Icons.campaign),
                    ),
                  ],
                  selected: {type},
                  onSelectionChanged: (v) => setDlgState(() => type = v.first),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: titleCtrl,
                  decoration: InputDecoration(
                    labelText: type == 'IMAGE' ? 'Caption' : 'Title',
                    border: const OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: hashtagCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Hashtags',
                    border: OutlineInputBorder(),
                  ),
                ),
                if (type == 'IMAGE') ...[
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () async {
                      final img = await ImagePicker().pickImage(
                        source: ImageSource.gallery,
                      );
                      if (img != null) setDlgState(() => pickedImage = img);
                    },
                    icon: const Icon(Icons.image),
                    label: Text(
                      pickedImage != null ? 'Image selected' : 'Pick Image',
                    ),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Publish'),
            ),
          ],
        ),
      ),
    );

    if (result == true) {
      final api = ref.read(apiProvider);
      if (pickedImage != null) {
        final fd = FormData.fromMap({
          'type': type,
          'title': titleCtrl.text,
          'content': descCtrl.text,
          if (hashtagCtrl.text.isNotEmpty) 'hashtags': hashtagCtrl.text,
          'media': MultipartFile.fromFileSync(
            pickedImage!.path,
            filename: pickedImage!.name,
          ),
        });
        await api.dio.post('/posts', data: fd);
      } else {
        await api.dio.post(
          '/posts',
          data: {
            'type': type,
            'title': titleCtrl.text,
            'content': descCtrl.text,
            if (hashtagCtrl.text.isNotEmpty) 'hashtags': hashtagCtrl.text,
          },
        );
      }
      _fetch();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Posts')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _create,
        icon: const Icon(Icons.add),
        label: const Text('New Post'),
      ),
      body: RefreshIndicator(
        onRefresh: _fetch,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _posts.length,
                itemBuilder: (_, i) {
                  final p = _posts[i];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: _typeColor(
                          p.type,
                        ).withValues(alpha: 0.1),
                        child: Icon(
                          _typeIcon(p.type),
                          size: 18,
                          color: _typeColor(p.type),
                        ),
                      ),
                      title: Text(
                        p.title ?? p.content ?? '(No content)',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      subtitle: Row(
                        children: [
                          Icon(
                            Icons.favorite,
                            size: 12,
                            color: Colors.red.shade400,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '${p.likeCount}',
                            style: const TextStyle(fontSize: 11),
                          ),
                          const SizedBox(width: 8),
                          Icon(
                            Icons.comment,
                            size: 12,
                            color: Colors.blue.shade400,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '${p.commentCount}',
                            style: const TextStyle(fontSize: 11),
                          ),
                          const SizedBox(width: 8),
                          Icon(
                            Icons.visibility,
                            size: 12,
                            color: Colors.grey.shade500,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '${p.viewCount}',
                            style: const TextStyle(fontSize: 11),
                          ),
                        ],
                      ),
                      trailing: Text(
                        p.type,
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }

  Color _typeColor(String t) =>
      {
        'TEXT': Colors.blue,
        'IMAGE': Colors.purple,
        'ANNOUNCEMENT': Colors.orange,
      }[t] ??
      Colors.grey;
  IconData _typeIcon(String t) =>
      {
        'TEXT': Icons.text_fields,
        'IMAGE': Icons.image,
        'ANNOUNCEMENT': Icons.campaign,
      }[t] ??
      Icons.article;
}
