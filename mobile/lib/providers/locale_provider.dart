import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Supported locales
const supportedLocales = [
  Locale('en'), // English
  Locale('am'), // Amharic
  Locale('om'), // Afaan Oromoo
];

/// Locale provider with shared_preferences persistence
final localeProvider = NotifierProvider<LocaleNotifier, Locale>(LocaleNotifier.new);

class LocaleNotifier extends Notifier<Locale> {
  static const _key = 'app_locale';

  @override
  Locale build() {
    _load();
    return const Locale('en');
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString(_key);
    if (code != null) {
      state = Locale(code);
    }
  }

  Future<void> set(Locale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, locale.languageCode);
  }

  Future<void> clear() async {
    state = const Locale('en');
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
}

/// Get display name for a locale
String localeDisplayName(Locale locale) {
  switch (locale.languageCode) {
    case 'am':
      return 'አማርኛ';
    case 'om':
      return 'Afaan Oromoo';
    case 'en':
    default:
      return 'English';
  }
}

/// Get flag emoji for a locale
String localeFlag(Locale locale) {
  switch (locale.languageCode) {
    case 'am':
    case 'om':
      return '🇪🇹';
    case 'en':
    default:
      return '🇬🇧';
  }
}
