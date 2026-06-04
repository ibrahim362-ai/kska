import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'l10n/app_localizations.dart';
import 'providers/auth_provider.dart';
import 'providers/locale_provider.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/tickets_screen.dart';
import 'screens/create_ticket_screen.dart';
import 'screens/qr_scanner_screen.dart';
import 'screens/posts_screen.dart';
import 'screens/votes_screen.dart';
import 'screens/checkins_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/profile_screen.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const ProviderScope(child: EmployerApp()));
}

class EmployerApp extends ConsumerWidget {
  const EmployerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    final router = GoRouter(
      redirect: (context, state) {
        final user = ref.read(authProvider);
        final isLogin = state.matchedLocation == '/login';
        if (user == null && !isLogin) return '/login';
        if (user != null && isLogin) return '/';
        return null;
      },
      routes: [
        GoRoute(path: '/login', builder: (_, _2) => const LoginScreen()),
        ShellRoute(
          builder: (_, _2, child) => EmployerShell(child: child),
          routes: [
            GoRoute(path: '/', builder: (_, _2) => const DashboardScreen()),
            GoRoute(path: '/tickets', builder: (_, _2) => const TicketsScreen()),
            GoRoute(path: '/create-ticket', builder: (_, _2) => const CreateTicketScreen()),
            GoRoute(path: '/scan', builder: (_, _2) => const QrScannerScreen()),
            GoRoute(path: '/posts', builder: (_, _2) => const PostsScreen()),
            GoRoute(path: '/votes', builder: (_, _2) => const VotesScreen()),
          GoRoute(path: '/checkins', builder: (_, _2) => const CheckinsScreen()),
          GoRoute(path: '/notifications', builder: (_, _2) => const EmployerNotificationsScreen()),
          GoRoute(path: '/profile', builder: (_, _2) => const ProfileScreen()),
          ],
        ),
      ],
    );

    return MaterialApp.router(
      routerConfig: router,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('en'), Locale('am'), Locale('om')],
      locale: locale,
      debugShowCheckedModeBanner: false,
      title: 'Employer Portal',
    );
  }
}

class EmployerShell extends StatelessWidget {
  final Widget child;
  const EmployerShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          child: NavigationBar(
            selectedIndex: _index(GoRouterState.of(context).matchedLocation),
            onDestinationSelected: (i) => _nav(context, i),
            height: 70,
            backgroundColor: Theme.of(context).brightness == Brightness.dark
                ? const Color(0xFF242838)
                : Colors.white,
            indicatorColor: const Color(0xFF667eea).withOpacity(0.2),
            animationDuration: const Duration(milliseconds: 500),
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.dashboard_outlined),
                selectedIcon: Icon(Icons.dashboard, color: Color(0xFF667eea)),
                label: 'Dashboard',
              ),
              NavigationDestination(
                icon: Icon(Icons.confirmation_number_outlined),
                selectedIcon: Icon(Icons.confirmation_number, color: Color(0xFF667eea)),
                label: 'Tickets',
              ),
              NavigationDestination(
                icon: Icon(Icons.qr_code_scanner_outlined),
                selectedIcon: Icon(Icons.qr_code_scanner, color: Color(0xFF667eea)),
                label: 'Scan',
              ),
              NavigationDestination(
                icon: Icon(Icons.article_outlined),
                selectedIcon: Icon(Icons.article, color: Color(0xFF667eea)),
                label: 'Posts',
              ),
              NavigationDestination(
                icon: Icon(Icons.person_outlined),
                selectedIcon: Icon(Icons.person, color: Color(0xFF667eea)),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }

  int _index(String loc) {
    if (loc == '/') return 0;
    if (loc.startsWith('/ticket')) return 1;
    if (loc == '/scan') return 2;
    if (loc.startsWith('/post')) return 3;
    if (loc.startsWith('/profile')) return 4;
    return 0;
  }

  void _nav(BuildContext c, int i) {
    c.go(['/', '/tickets', '/scan', '/posts', '/profile'][i]);
  }
}
