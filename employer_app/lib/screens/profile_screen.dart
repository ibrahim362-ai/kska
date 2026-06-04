import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isEditing = false;
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _fullNameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider);
    _fullNameController = TextEditingController(text: user?['fullName'] ?? '');
    _emailController = TextEditingController(text: user?['email'] ?? '');
    _phoneController = TextEditingController(text: user?['phone'] ?? '');
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (_formKey.currentState!.validate()) {
      try {
        final api = ref.read(apiProvider);
        await api.dio.put(
          '/users/profile',
          data: {
            'fullName': _fullNameController.text.trim(),
            'phone': _phoneController.text.trim(),
          },
        );
        setState(() => _isEditing = false);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Profile updated successfully!'),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to update profile: $e'),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.edit, color: Colors.white, size: 20),
              ),
              onPressed: () => setState(() => _isEditing = true),
            ).animate().fadeIn(delay: 200.ms).scale(),
          if (_isEditing)
            IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  gradient: AppTheme.successGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 20),
              ),
              onPressed: _saveProfile,
            ).animate().fadeIn(delay: 200.ms).scale(),
          if (_isEditing)
            IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.close, color: Colors.red, size: 20),
              ),
              onPressed: () {
                final user = ref.read(authProvider);
                _fullNameController.text = user?['fullName'] ?? '';
                _emailController.text = user?['email'] ?? '';
                _phoneController.text = user?['phone'] ?? '';
                setState(() => _isEditing = false);
              },
            ).animate().fadeIn(delay: 300.ms).scale(),
          const SizedBox(width: 8),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF1A1D2E), const Color(0xFF242838)]
                : [const Color(0xFFF8F9FE), const Color(0xFFFFFFFF)],
          ),
        ),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const SizedBox(height: 80),

            // Profile Avatar
            Center(
              child: Stack(
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF667eea).withOpacity(0.4),
                          blurRadius: 30,
                          offset: const Offset(0, 15),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        user?['fullName']?[0]?.toUpperCase() ?? 'E',
                        style: const TextStyle(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  if (_isEditing)
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          gradient: AppTheme.secondaryGradient,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                        ),
                        child: const Icon(
                          Icons.camera_alt,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                    ),
                ],
              ).animate().fadeIn(duration: 600.ms).scale(delay: 200.ms),
            ),

            const SizedBox(height: 24),

            // User Name
            Center(
              child: Text(
                user?['fullName'] ?? 'Employer',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : const Color(0xFF2D3142),
                ),
              ).animate().fadeIn(delay: 400.ms, duration: 600.ms),
            ),

            const SizedBox(height: 8),

            // User Role
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  user?['role']?.toUpperCase() ?? 'EMPLOYER',
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1.2,
                  ),
                ),
              ).animate().fadeIn(delay: 500.ms, duration: 600.ms),
            ),

            const SizedBox(height: 40),

            // Profile Form
            Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile Information Section
                  Text(
                    'Profile Information',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : const Color(0xFF2D3142),
                    ),
                  ).animate().fadeIn(delay: 600.ms),

                  const SizedBox(height: 20),

                  // Full Name
                  _buildInfoCard(
                    icon: Icons.person,
                    label: 'Full Name',
                    controller: _fullNameController,
                    enabled: _isEditing,
                    gradient: AppTheme.primaryGradient,
                    validator: (val) =>
                        val?.isEmpty ?? true ? 'Required' : null,
                    delay: 700,
                  ),

                  const SizedBox(height: 16),

                  // Email
                  _buildInfoCard(
                    icon: Icons.email,
                    label: 'Email',
                    controller: _emailController,
                    enabled: _isEditing,
                    gradient: AppTheme.infoGradient,
                    keyboardType: TextInputType.emailAddress,
                    validator: (val) {
                      if (val?.isEmpty ?? true) return 'Required';
                      if (!val!.contains('@')) return 'Invalid email';
                      return null;
                    },
                    delay: 800,
                  ),

                  const SizedBox(height: 16),

                  // Phone
                  _buildInfoCard(
                    icon: Icons.phone,
                    label: 'Phone Number',
                    controller: _phoneController,
                    enabled: _isEditing,
                    gradient: AppTheme.successGradient,
                    keyboardType: TextInputType.phone,
                    delay: 900,
                  ),

                  const SizedBox(height: 40),

                  // Account Actions Section
                  Text(
                    'Account Actions',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : const Color(0xFF2D3142),
                    ),
                  ).animate().fadeIn(delay: 1000.ms),

                  const SizedBox(height: 20),

                  // Change Password
                  _buildActionButton(
                    icon: Icons.lock_outline,
                    title: 'Change Password',
                    subtitle: 'Update your password',
                    gradient: AppTheme.warningGradient,
                    onTap: () {
                      // TODO: Navigate to change password screen
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text(
                            'Change password feature coming soon',
                          ),
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      );
                    },
                    delay: 1100,
                  ),

                  const SizedBox(height: 16),

                  // Logout
                  _buildActionButton(
                    icon: Icons.logout,
                    title: 'Logout',
                    subtitle: 'Sign out from your account',
                    gradient: AppTheme.secondaryGradient,
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                          title: const Text('Logout'),
                          content: const Text(
                            'Are you sure you want to logout?',
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx),
                              child: const Text('Cancel'),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.pop(ctx);
                                ref.read(authProvider.notifier).logout();
                                context.go('/login');
                              },
                              child: const Text(
                                'Logout',
                                style: TextStyle(color: Colors.red),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                    delay: 1200,
                  ),

                  const SizedBox(height: 100),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String label,
    required TextEditingController controller,
    required bool enabled,
    required Gradient gradient,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
    required int delay,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF242838) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(isDark ? 0.3 : 0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    gradient: gradient,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark
                              ? Colors.grey.shade400
                              : Colors.grey.shade600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      if (enabled)
                        TextFormField(
                          controller: controller,
                          keyboardType: keyboardType,
                          validator: validator,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? Colors.white
                                : const Color(0xFF2D3142),
                          ),
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: EdgeInsets.zero,
                          ),
                        )
                      else
                        Text(
                          controller.text,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? Colors.white
                                : const Color(0xFF2D3142),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        )
        .animate()
        .fadeIn(
          duration: 500.ms,
          delay: Duration(milliseconds: delay),
        )
        .slideX(begin: 0.2, end: 0);
  }

  Widget _buildActionButton({
    required IconData icon,
    required String title,
    required String subtitle,
    required Gradient gradient,
    required VoidCallback onTap,
    required int delay,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
          decoration: BoxDecoration(
            gradient: gradient,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: gradient.colors.first.withOpacity(0.3),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(icon, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            subtitle,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white.withOpacity(0.9),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      Icons.arrow_forward_ios,
                      size: 16,
                      color: Colors.white,
                    ),
                  ],
                ),
              ),
            ),
          ),
        )
        .animate()
        .fadeIn(
          duration: 500.ms,
          delay: Duration(milliseconds: delay),
        )
        .slideX(begin: 0.2, end: 0);
  }
}
