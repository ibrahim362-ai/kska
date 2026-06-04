import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../providers/auth_provider.dart';
import '../../../models/models.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});
  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  List<Post> _posts = [];
  bool _loading = true;
  String? _error;
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _fetchPosts();
    _fetchUnreadCount();
  }

  Future<void> _fetchPosts() async {
    try {
      final api = ref.read(apiServiceProvider);
      final res = await api.dio.get('/posts', queryParameters: {'limit': 20});
      if (mounted)
        setState(() {
          _posts = (res.data['data'] as List)
              .map((p) => Post.fromJson(p))
              .toList();
          _loading = false;
          _error = null;
        });
    } catch (e) {
      if (mounted)
        setState(() {
          _loading = false;
          _error =
              'Error: ${e.toString().substring(0, e.toString().length > 80 ? 80 : e.toString().length)}';
        });
    }
  }

  Future<void> _fetchUnreadCount() async {
    try {
      final api = ref.read(apiServiceProvider);
      final res = await api.dio.get('/notifications/unread-count');
      if (mounted)
        setState(() => _unreadCount = res.data['data']['count'] ?? 0);
    } catch (_) {}
  }

  Future<void> _likePost(Post post) async {
    final api = ref.read(apiServiceProvider);
    try {
      await api.dio.post('/posts/${post.id}/like');
      _fetchPosts();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: _buildDrawer(context),
      appBar: AppBar(
        title: const Text('Community Hub'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () => context.push('/notifications'),
              ),
              if (_unreadCount > 0)
                Positioned(
                  right: 4,
                  top: 4,
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '$_unreadCount',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchPosts,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
            ? Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.cloud_off,
                      size: 48,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _error!,
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                    const SizedBox(height: 16),
                    FilledButton.tonal(
                      onPressed: _fetchPosts,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
            : _posts.isEmpty
            ? Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.article_outlined,
                      size: 48,
                      color: Colors.grey,
                    ),
                    const SizedBox(height: 12),
                    const Text('No posts yet'),
                    const SizedBox(height: 4),
                    Text(
                      'Pull down to refresh',
                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _posts.length,
                itemBuilder: (_, i) => _buildPostCard(_posts[i]),
              ),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary,
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.white,
                  child: Icon(Icons.person, size: 35, color: Colors.indigo),
                ),
                SizedBox(height: 8),
                Text(
                  'Community Hub',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Welcome back!',
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
              ],
            ),
          ),
          _drawerTile(Icons.home, 'Home', () {
            context.go('/');
            Navigator.pop(context);
          }),
          _drawerTile(Icons.how_to_vote, 'Votes', () {
            context.go('/votes');
            Navigator.pop(context);
          }),
          _drawerTile(Icons.confirmation_number, 'Tickets', () {
            context.go('/tickets');
            Navigator.pop(context);
          }),
          _drawerTile(Icons.qr_code, 'My Tickets', () {
            context.push('/my-tickets');
            Navigator.pop(context);
          }),
          const Divider(),
          _drawerTile(Icons.leaderboard, 'Leaderboard', () {
            context.go('/leaderboard');
            Navigator.pop(context);
          }),
          _drawerTile(Icons.workspace_premium, 'Membership', () {
            context.push('/membership');
            Navigator.pop(context);
          }),
          _drawerTile(Icons.notifications, 'Notifications', () {
            context.push('/notifications');
            Navigator.pop(context);
          }),
          _drawerTile(Icons.person, 'Profile', () {
            context.go('/profile');
            Navigator.pop(context);
          }),
          const Divider(),
          _drawerTile(Icons.logout, 'Logout', () {
            ref.read(authProvider.notifier).logout();
            context.go('/login');
          }),
        ],
      ),
    );
  }

  Widget _drawerTile(IconData icon, String title, VoidCallback onTap) {
    return ListTile(leading: Icon(icon), title: Text(title), onTap: onTap);
  }

  Widget _buildPostCard(Post post) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 1,
      child: InkWell(
        onTap: () => context.push('/posts/${post.id}'),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    child: Text(post.user.fullName[0].toUpperCase()),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          post.user.fullName,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                          ),
                        ),
                        Text(
                          '@${post.user.username}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _typeColor(post.type).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      post.type,
                      style: TextStyle(
                        fontSize: 11,
                        color: _typeColor(post.type),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              if (post.title != null) ...[
                const SizedBox(height: 10),
                Text(
                  post.title!,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
              if (post.content != null) ...[
                const SizedBox(height: 6),
                Text(post.content!, style: const TextStyle(fontSize: 15)),
              ],
              if (post.mediaUrl != null) ...[
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    'http://localhost:5000${post.mediaUrl}',
                    fit: BoxFit.cover,
                  ),
                ),
              ],
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _actionBtn(
                    Icons.favorite_border,
                    '${post.likeCount}',
                    () => _likePost(post),
                  ),
                  _actionBtn(
                    Icons.chat_bubble_outline,
                    '${post.commentCount}',
                    () => context.push('/posts/${post.id}'),
                  ),
                  _actionBtn(Icons.bookmark_border, 'Save', () async {
                    final api = ref.read(apiServiceProvider);
                    try {
                      await api.dio.post('/posts/${post.id}/save');
                    } catch (_) {}
                  }),
                  _actionBtn(Icons.share_outlined, 'Share', () {}),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _typeColor(String type) =>
      {
        'TEXT': Colors.blue,
        'IMAGE': Colors.purple,
        'VIDEO': Colors.red,
        'EVENT': Colors.green,
        'ANNOUNCEMENT': Colors.orange,
      }[type] ??
      Colors.grey;

  Widget _actionBtn(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 20, color: Colors.grey.shade600),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
            ),
          ],
        ),
      ),
    );
  }
}
