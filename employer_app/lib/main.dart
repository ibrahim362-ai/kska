import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'l10n/app_localizations.dart';
import 'providers/auth_provider.dart';
import 'providers/locale_provider.dart';
import 'screens/login_screen.dart';
import 'screens/qr_scanner_screen.dart';
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
        GoRoute(path: '/', builder: (_, _2) => const QrScannerScreen()),
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
