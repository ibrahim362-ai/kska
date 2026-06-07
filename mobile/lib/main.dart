import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'config/app_theme.dart';
import 'l10n/app_localizations.dart';
import 'providers/auth_provider.dart';
import 'providers/locale_provider.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/signup_screen.dart';
import 'features/auth/screens/forgot_password_screen.dart';
import 'features/home/screens/home_screen.dart';
import 'features/votes/screens/votes_screen.dart';
import 'features/tickets/screens/tickets_screen.dart';
import 'features/tickets/screens/my_tickets_screen.dart';
import 'features/tickets/screens/ticket_detail_screen.dart';
import 'features/membership/screens/membership_screen.dart';
import 'features/leaderboard/screens/leaderboard_screen.dart';
import 'features/profile/screens/profile_screen.dart';
import 'features/notifications/screens/notifications_screen.dart';
import 'features/posts/screens/post_detail_screen.dart';
import 'features/payments/screens/manual_payment_screen.dart';
import 'features/icons/screens/icons_screen.dart';
import 'features/challenges/screens/challenges_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
    ),
  );
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    
    final router = GoRouter(
      redirect: (context, state) {
        final user = ref.read(authProvider);
        final isLoginRoute =
            state.matchedLocation == '/login' ||
            state.matchedLocation == '/signup';

        if (user == null && !isLoginRoute) return '/login';
        if (user != null && isLoginRoute) return '/';
        return null;
      },
      routes: [
        GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
        GoRoute(path: '/signup', builder: (_, _) => const SignupScreen()),
        GoRoute(
          path: '/forgot-password',
          builder: (_, _) => const ForgotPasswordScreen(),
        ),
        GoRoute(
          path: '/posts/:id',
          builder: (_, state) =>
              PostDetailScreen(postId: state.pathParameters['id']!),
        ),
        GoRoute(
          path: '/tickets/:id',
          builder: (_, state) =>
              TicketDetailScreen(ticketId: state.pathParameters['id']!),
        ),
        GoRoute(
          path: '/my-tickets',
          builder: (_, _) => const MyTicketsScreen(),
        ),
        GoRoute(
          path: '/manual-payment',
          builder: (context, state) {
            final extra = state.extra as Map<String, dynamic>?;
            return ManualPaymentScreen(
              paymentId: extra?['paymentId'] as String?,
              amount: extra?['amount'] as double?,
              metadata: extra?['metadata'] as String?,
            );
          },
        ),
        GoRoute(
          path: '/icons',
          builder: (_, _) => const IconsScreen(),
        ),
        GoRoute(
          path: '/challenges',
          builder: (_, _) => const ChallengesScreen(),
        ),
        ShellRoute(
          builder: (_, _, child) => MainShell(child: child),
          routes: [
            GoRoute(path: '/', builder: (_, _) => const HomeScreen()),
            GoRoute(path: '/votes', builder: (_, _) => const VotesScreen()),
            GoRoute(path: '/tickets', builder: (_, _) => const TicketsScreen()),
            GoRoute(
              path: '/membership',
              builder: (_, _) => const MembershipScreen(),
            ),
            GoRoute(
              path: '/leaderboard',
              builder: (_, _) => const LeaderboardScreen(),
            ),
            GoRoute(path: '/profile', builder: (_, _) => const ProfileScreen()),
            GoRoute(
              path: '/notifications',
              builder: (_, _) => const NotificationsScreen(),
            ),
          ],
        ),
      ],
    );

    return MaterialApp.router(
      routerConfig: router,
      theme: AppTheme.lightTheme,
      themeMode: ThemeMode.light,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en'),
        Locale('am'),
        Locale('om'),
      ],
      locale: locale,
      debugShowCheckedModeBanner: false,
    );
  }
}

class MainShell extends StatelessWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _getIndex(GoRouterState.of(context).matchedLocation),
        onDestinationSelected: (index) => _navigate(context, index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.how_to_vote_outlined),
            selectedIcon: Icon(Icons.how_to_vote_rounded),
            label: 'Votes',
          ),
          NavigationDestination(
            icon: Icon(Icons.confirmation_number_outlined),
            selectedIcon: Icon(Icons.confirmation_number_rounded),
            label: 'Tickets',
          ),
          NavigationDestination(
            icon: Icon(Icons.leaderboard_outlined),
            selectedIcon: Icon(Icons.leaderboard_rounded),
            label: 'Ranks',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  int _getIndex(String location) {
    if (location == '/') return 0;
    if (location == '/votes') return 1;
    if (location == '/tickets') return 2;
    if (location == '/leaderboard') return 3;
    if (location == '/profile') return 4;
    return 0;
  }

  void _navigate(BuildContext context, int index) {
    final routes = ['/', '/votes', '/tickets', '/leaderboard', '/profile'];
    context.go(routes[index]);
  }
}
