import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../models/models.dart';
import '../../../providers/auth_provider.dart';

class PostDetailScreen extends ConsumerStatefulWidget {
  final String postId;
  const PostDetailScreen({super.key, required this.postId});

  @override
  ConsumerState<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends ConsumerState<PostDetailScreen> {
  Post? _post;
  List<Comment> _comments = [];
  bool _loading = true;
  bool _liked = false;
  final _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchPostDetail();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _fetchPostDetail() async {
    try {
      final api = ref.read(apiServiceProvider);

      // Fetch post details
      final postRes = await api.dio.get('/posts/${widget.postId}');

      // Fetch comments
      final commentsRes = await api.dio.get('/posts/${widget.postId}/comments');

      setState(() {
        _post = Post.fromJson(postRes.data['data']);
        _comments = (commentsRes.data['data'] as List)
            .map((c) => Comment.fromJson(c))
            .toList();
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading post: $e')));
      }
    }
  }

  Future<void> _toggleLike() async {
    try {
      final api = ref.read(apiServiceProvider);
      if (_liked) {
        await api.dio.delete('/posts/${widget.postId}/like');
      } else {
        await api.dio.post('/posts/${widget.postId}/like');
      }
      setState(() {
        _liked = !_liked;
        if (_post != null) {
          _post = _post!.copyWith(
            likeCount: _post!.likeCount + (_liked ? 1 : -1),
          );
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _addComment() async {
    if (_commentController.text.trim().isEmpty) return;

    try {
      final api = ref.read(apiServiceProvider);
      final res = await api.dio.post(
        '/posts/${widget.postId}/comments',
        data: {'content': _commentController.text.trim()},
      );

      setState(() {
        _comments.insert(0, Comment.fromJson(res.data['data']));
        if (_post != null) {
          _post = _post!.copyWith(commentCount: _post!.commentCount + 1);
        }
      });

      _commentController.clear();
      FocusScope.of(context).unfocus();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error posting comment: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Post Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _post == null
          ? const Center(child: Text('Post not found'))
          : Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Post Header
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 24,
                                child: Text(_post!.user.fullName[0]),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _post!.user.fullName,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 16,
                                      ),
                                    ),
                                    Text(
                                      '@${_post!.user.username}',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: Colors.grey.shade600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              _PostTypeBadge(type: _post!.type),
                            ],
                          ),
                        ),

                        // Post Title
                        if (_post!.title != null)
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              _post!.title!,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),

                        // Post Content
                        if (_post!.content != null)
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              _post!.content!,
                              style: const TextStyle(fontSize: 16),
                            ),
                          ),

                        // Post Media
                        if (_post!.mediaUrl != null)
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                'http://localhost:5000${_post!.mediaUrl}',
                                fit: BoxFit.cover,
                                width: double.infinity,
                              ),
                            ),
                          ),

                        // Post Stats & Actions
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          child: Row(
                            children: [
                              IconButton(
                                icon: Icon(
                                  _liked
                                      ? Icons.favorite
                                      : Icons.favorite_border,
                                  color: _liked ? Colors.red : null,
                                ),
                                onPressed: _toggleLike,
                              ),
                              Text(
                                '${_post!.likeCount}',
                                style: const TextStyle(fontSize: 15),
                              ),
                              const SizedBox(width: 16),
                              const Icon(Icons.chat_bubble_outline, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                '${_post!.commentCount}',
                                style: const TextStyle(fontSize: 15),
                              ),
                              const SizedBox(width: 16),
                              const Icon(
                                Icons.remove_red_eye_outlined,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '${_post!.viewCount}',
                                style: const TextStyle(fontSize: 15),
                              ),
                              const Spacer(),
                              IconButton(
                                icon: const Icon(Icons.share_outlined),
                                onPressed: () {
                                  // TODO: Implement share
                                },
                              ),
                            ],
                          ),
                        ),

                        const Divider(thickness: 8),

                        // Comments Section
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(
                            'Comments (${_comments.length})',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),

                        // Comments List
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _comments.length,
                          separatorBuilder: (_, _) =>
                              const Divider(height: 24),
                          itemBuilder: (context, index) {
                            final comment = _comments[index];
                            return _CommentItem(comment: comment);
                          },
                        ),

                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
                ),

                // Comment Input
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 4,
                        offset: const Offset(0, -2),
                      ),
                    ],
                  ),
                  padding: EdgeInsets.only(
                    left: 16,
                    right: 16,
                    top: 8,
                    bottom: MediaQuery.of(context).viewInsets.bottom + 8,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _commentController,
                          decoration: InputDecoration(
                            hintText: 'Write a comment...',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(24),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        icon: const Icon(Icons.send),
                        onPressed: _addComment,
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}

class _PostTypeBadge extends StatelessWidget {
  final String type;
  const _PostTypeBadge({required this.type});

  @override
  Widget build(BuildContext context) {
    final colors = {
      'TEXT': Colors.blue,
      'IMAGE': Colors.purple,
      'VIDEO': Colors.red,
      'EVENT': Colors.green,
      'ANNOUNCEMENT': Colors.orange,
      'VOTE_POST': Colors.teal,
    };

    final color = colors[type] ?? Colors.grey;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        type,
        style: TextStyle(
          fontSize: 11,
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _CommentItem extends StatelessWidget {
  final Comment comment;
  const _CommentItem({required this.comment});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(radius: 18, child: Text(comment.user.fullName[0])),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    comment.user.fullName,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _timeAgo(comment.createdAt),
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(comment.content),
            ],
          ),
        ),
      ],
    );
  }

  String _timeAgo(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays > 0) return '${diff.inDays}d ago';
    if (diff.inHours > 0) return '${diff.inHours}h ago';
    if (diff.inMinutes > 0) return '${diff.inMinutes}m ago';
    return 'Just now';
  }
}
