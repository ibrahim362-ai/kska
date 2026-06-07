import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});
  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> with SingleTickerProviderStateMixin {
  final _username = TextEditingController();
  final _pass = TextEditingController();
  bool _loading = false;
  String? _error;
  late AnimationController _iconController;

  @override
  void initState() {
    super.initState();
    _iconController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _iconController.dispose();
    _username.dispose();
    _pass.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (_username.text.trim().isEmpty || _pass.text.isEmpty) {
      setState(() => _error = 'Please enter username and password');
      return;
    }
    
    setState(() { _loading = true; _error = null; });
    final err = await ref.read(authProvider.notifier).login(_username.text.trim(), _pass.text);
    if (err != null && mounted) setState(() => _error = err);
    if (err == null && mounted) context.go('/');
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFF0FDF4), // pale green
              Color(0xFFDCFCE7), // lighter green
              Color(0xFFBBF7D0), // light green
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Animated Icon with Pulse Effect
                  AnimatedBuilder(
                    animation: _iconController,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: 1.0 + (_iconController.value * 0.1),
                        child: Container(
                          padding: const EdgeInsets.all(32),
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: BorderRadius.circular(35),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primaryGreen.withOpacity(0.4),
                                blurRadius: 40,
                                spreadRadius: 5,
                                offset: const Offset(0, 20),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.qr_code_scanner_rounded,
                            size: 80,
                            color: Colors.white,
                          ),
                        ),
                      );
                    },
                  )
                      .animate()
                      .fadeIn(duration: 600.ms)
                      .scale(delay: 200.ms, duration: 800.ms, curve: Curves.elasticOut),
                  
                  const SizedBox(height: 40),
                  
                  // Title with Shimmer Effect
                  Text(
                    'Employer Portal',
                    style: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.darkGreen,
                      letterSpacing: -1,
                      height: 1.2,
                    ),
                  )
                      .animate(onPlay: (controller) => controller.repeat())
                      .fadeIn(duration: 600.ms)
                      .then()
                      .shimmer(
                        duration: 2000.ms,
                        color: Colors.white.withOpacity(0.5),
                      ),
                  
                  const SizedBox(height: 12),
                  
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: AppTheme.primaryGreen,
                          shape: BoxShape.circle,
                        ),
                      )
                          .animate(onPlay: (controller) => controller.repeat())
                          .scale(duration: 1000.ms, curve: Curves.easeInOut)
                          .then()
                          .scale(begin: const Offset(1.5, 1.5), end: const Offset(1, 1), duration: 1000.ms),
                      const SizedBox(width: 12),
                      Text(
                        'Scan & Verify Tickets',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey.shade700,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ).animate().fadeIn(delay: 800.ms, duration: 600.ms),
                  
                  const SizedBox(height: 60),
                  
                  // Error Message with Animation
                  if (_error != null)
                    Container(
                      padding: const EdgeInsets.all(20),
                      margin: const EdgeInsets.only(bottom: 24),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.red.shade300, width: 2),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.error_rounded, color: Colors.red.shade700, size: 28),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Text(
                              _error!,
                              style: TextStyle(
                                color: Colors.red.shade700,
                                fontSize: 15,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                        .animate()
                        .fadeIn(duration: 300.ms)
                        .shake(duration: 500.ms, hz: 4),
                  
                  // Username Field with Icon
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryGreen.withOpacity(0.1),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: TextField(
                      controller: _username,
                      decoration: InputDecoration(
                        labelText: 'Username',
                        hintText: 'Enter your username',
                        prefixIcon: Container(
                          margin: const EdgeInsets.all(14),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(Icons.person_rounded, color: Colors.white, size: 24),
                        ),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: const BorderSide(color: AppTheme.primaryGreen, width: 2.5),
                        ),
                      ),
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 1000.ms, duration: 600.ms)
                      .slideX(begin: -0.3, end: 0, curve: Curves.easeOutCubic),
                  
                  const SizedBox(height: 24),
                  
                  // Password Field with Icon
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryGreen.withOpacity(0.1),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: TextField(
                      controller: _pass,
                      obscureText: true,
                      decoration: InputDecoration(
                        labelText: 'Password',
                        hintText: 'Enter your password',
                        prefixIcon: Container(
                          margin: const EdgeInsets.all(14),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            gradient: AppTheme.secondaryGradient,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(Icons.lock_rounded, color: Colors.white, size: 24),
                        ),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: const BorderSide(color: AppTheme.primaryGreen, width: 2.5),
                        ),
                      ),
                      onSubmitted: (_) => _login(),
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 1200.ms, duration: 600.ms)
                      .slideX(begin: -0.3, end: 0, curve: Curves.easeOutCubic),
                  
                  const SizedBox(height: 40),
                  
                  // Sign In Button with Gradient
                  SizedBox(
                    width: double.infinity,
                    height: 64,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: _loading ? null : AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: _loading
                            ? []
                            : [
                                BoxShadow(
                                  color: AppTheme.primaryGreen.withOpacity(0.5),
                                  blurRadius: 30,
                                  spreadRadius: 2,
                                  offset: const Offset(0, 15),
                                ),
                              ],
                      ),
                      child: ElevatedButton(
                        onPressed: _loading ? null : _login,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _loading ? Colors.grey.shade300 : Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                        child: _loading
                            ? Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 3,
                                      valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryGreen),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Text(
                                    'Signing in...',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.darkGreen,
                                    ),
                                  ),
                                ],
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Text(
                                    'Sign In',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 24),
                                ],
                              ),
                      ),
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 1400.ms, duration: 600.ms)
                      .slideY(begin: 0.3, end: 0, curve: Curves.easeOutCubic)
                      .then(delay: 200.ms)
                      .shimmer(duration: 2000.ms, color: Colors.white.withOpacity(0.3)),
                  
                  const SizedBox(height: 32),
                  
                  // Footer with pulsing indicator
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: AppTheme.lightGreen,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.lightGreen.withOpacity(0.5),
                              blurRadius: 8,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                      )
                          .animate(onPlay: (controller) => controller.repeat())
                          .fadeIn(duration: 800.ms)
                          .then()
                          .fadeOut(duration: 800.ms),
                      const SizedBox(width: 12),
                      Text(
                        'Secure Connection',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ).animate().fadeIn(delay: 1600.ms, duration: 800.ms),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
