import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../providers/auth_provider.dart';
import '../../../models/models.dart';
import 'package:intl/intl.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider);
    if (user == null) return const Center(child: CircularProgressIndicator());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            tooltip: 'Edit profile',
            onPressed: () => _openEditSheet(user),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(authProvider.notifier).fetchProfile();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 20),
              _buildAvatar(user),
              const SizedBox(height: 16),
              Text(user.fullName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text('@${user.username}', style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
              const SizedBox(height: 8),
              _buildRoleBadge(user.role),
              if (user.isVerified) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.green.shade200),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.verified, size: 14, color: Colors.green.shade700),
                      const SizedBox(width: 4),
                      Text('Verified', style: TextStyle(fontSize: 11, color: Colors.green.shade700, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 24),
              _infoTile(Icons.email_outlined, 'Email', user.email),
              _infoTile(Icons.phone_outlined, 'Phone', user.phone ?? 'Not set'),
              _infoTile(Icons.info_outline, 'Bio', user.bio ?? 'No bio yet'),
              _infoTile(
                Icons.calendar_today_outlined,
                'Joined',
                DateFormat.yMMMd().format(user.createdAt),
              ),
              const SizedBox(height: 24),
              _buildActionButton(
                icon: Icons.workspace_premium,
                label: 'Membership Plans',
                onTap: () => context.push('/membership'),
              ),
              const SizedBox(height: 12),
              _buildActionButton(
                icon: Icons.notifications_outlined,
                label: 'Notifications',
                onTap: () => context.push('/notifications'),
              ),
              const SizedBox(height: 12),
              _buildActionButton(
                icon: Icons.language,
                label: 'Language',
                onTap: () => _showLanguagePicker(context),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton.tonalIcon(
                  onPressed: () async {
                    final confirm = await showDialog<bool>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Logout?'),
                        content: const Text('You will need to sign in again to use the app.'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                          FilledButton(
                            onPressed: () => Navigator.pop(ctx, true),
                            style: FilledButton.styleFrom(backgroundColor: Colors.red),
                            child: const Text('Logout'),
                          ),
                        ],
                      ),
                    );
                    if (confirm == true && context.mounted) {
                      await ref.read(authProvider.notifier).logout();
                      if (context.mounted) context.go('/login');
                    }
                  },
                  icon: const Icon(Icons.logout),
                  label: const Text('Logout'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar(User user) {
    if (user.avatar != null && user.avatar!.isNotEmpty) {
      return CircleAvatar(
        radius: 48,
        backgroundColor: Colors.indigo,
        child: ClipOval(
          child: CachedNetworkImage(
            imageUrl: user.avatar!,
            width: 96,
            height: 96,
            fit: BoxFit.cover,
            errorWidget: (_, __, ___) => Text(
              user.fullName[0].toUpperCase(),
              style: const TextStyle(fontSize: 40, color: Colors.white),
            ),
          ),
        ),
      );
    }
    return CircleAvatar(
      radius: 48,
      backgroundColor: Theme.of(context).colorScheme.primary,
      child: Text(
        user.fullName.isNotEmpty ? user.fullName[0].toUpperCase() : '?',
        style: const TextStyle(fontSize: 40, color: Colors.white),
      ),
    );
  }

  Widget _buildRoleBadge(String role) {
    final colors = {
      'SUPER_ADMIN': (Colors.red.shade50, Colors.red.shade700),
      'ADMIN': (Colors.purple.shade50, Colors.purple.shade700),
      'EMPLOYER': (Colors.blue.shade50, Colors.blue.shade700),
      'USER': (Colors.grey.shade100, Colors.grey.shade700),
    };
    final c = colors[role] ?? colors['USER']!;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(color: c.$1, borderRadius: BorderRadius.circular(12)),
      child: Text(role, style: TextStyle(fontSize: 12, color: c.$2, fontWeight: FontWeight.w600)),
    );
  }

  Widget _infoTile(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(children: [
        Icon(icon, size: 20, color: Colors.grey.shade600),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
            Text(value, style: const TextStyle(fontSize: 15)),
          ]),
        ),
      ]),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: onTap,
        icon: Icon(icon),
        label: Text(label),
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          alignment: Alignment.centerLeft,
        ),
      ),
    );
  }

  void _showLanguagePicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text('Select Language', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            ListTile(
              leading: const Text('🇬🇧', style: TextStyle(fontSize: 24)),
              title: const Text('English'),
              onTap: () {
                Navigator.pop(ctx);
                // TODO: Apply locale
              },
            ),
            ListTile(
              leading: const Text('🇪🇹', style: TextStyle(fontSize: 24)),
              title: const Text('አማርኛ (Amharic)'),
              onTap: () {
                Navigator.pop(ctx);
                // TODO: Apply locale
              },
            ),
            ListTile(
              leading: const Text('🇪🇹', style: TextStyle(fontSize: 24)),
              title: const Text('Afaan Oromoo'),
              onTap: () {
                Navigator.pop(ctx);
                // TODO: Apply locale
              },
            ),
          ],
        ),
      ),
    );
  }

  void _openEditSheet(User user) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _EditProfileSheet(user: user),
    );
  }
}

class _EditProfileSheet extends ConsumerStatefulWidget {
  final User user;
  const _EditProfileSheet({required this.user});

  @override
  ConsumerState<_EditProfileSheet> createState() => _EditProfileSheetState();
}

class _EditProfileSheetState extends ConsumerState<_EditProfileSheet> {
  late final TextEditingController _fullName;
  late final TextEditingController _bio;
  late final TextEditingController _phone;
  String? _avatarUrl;
  bool _saving = false;
  final _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _fullName = TextEditingController(text: widget.user.fullName);
    _bio = TextEditingController(text: widget.user.bio ?? '');
    _phone = TextEditingController(text: widget.user.phone ?? '');
    _avatarUrl = widget.user.avatar;
  }

  @override
  void dispose() {
    _fullName.dispose();
    _bio.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    try {
      final file = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80, maxWidth: 800);
      if (file == null) return;

      setState(() => _saving = true);

      // Upload to backend
      final api = ref.read(apiServiceProvider);
      final formData = await FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path, filename: 'avatar.jpg'),
      });
      final res = await api.dio.post('/upload', data: formData);
      setState(() {
        _avatarUrl = res.data['data']['url'] as String;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to upload: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _saving = false);
    }
  }

  Future<void> _save() async {
    if (_fullName.text.trim().length < 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Name must be at least 2 characters'), backgroundColor: Colors.red),
      );
      return;
    }
    if (_phone.text.isNotEmpty && !RegExp(r'^\+?[0-9]{9,15}$').hasMatch(_phone.text)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid phone number'), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _saving = true);

    try {
      final api = ref.read(apiServiceProvider);
      await api.dio.put('/users/profile', {
        'fullName': _fullName.text.trim(),
        'bio': _bio.text.trim(),
        'phone': _phone.text.trim().isEmpty ? null : _phone.text.trim(),
        if (_avatarUrl != null) 'avatar': _avatarUrl,
      });
      await ref.read(authProvider.notifier).fetchProfile();
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Update failed: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Edit Profile', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              Center(
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 48,
                      backgroundColor: Colors.indigo,
                      backgroundImage: _avatarUrl != null ? CachedNetworkImageProvider(_avatarUrl!) : null,
                      child: _avatarUrl == null
                          ? Text(
                              _fullName.text.isNotEmpty ? _fullName.text[0].toUpperCase() : '?',
                              style: const TextStyle(fontSize: 36, color: Colors.white),
                            )
                          : null,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: _pickAvatar,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            color: Colors.indigo,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.camera_alt, size: 16, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _fullName,
                decoration: const InputDecoration(
                  labelText: 'Full Name *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _phone,
                keyboardType: TextInputType.phone,
                inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9+]'))],
                decoration: const InputDecoration(
                  labelText: 'Phone',
                  hintText: '+251911223344',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.phone),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _bio,
                maxLines: 3,
                maxLength: 200,
                decoration: const InputDecoration(
                  labelText: 'Bio',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.info_outline),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton(
                  onPressed: _saving ? null : _save,
                  style: FilledButton.styleFrom(backgroundColor: Colors.indigo),
                  child: _saving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Save Changes'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
