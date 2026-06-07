import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const supportedLocales = [
  Locale('en'),
  Locale('am'),
  Locale('om'),
];

// Simple provider for locale - no StateProvider needed
final localeProvider = Provider<Locale>((ref) => const Locale('en'));

Future<Locale> loadSavedLocale() async {
  final prefs = await SharedPreferences.getInstance();
  final code = prefs.getString('employer_app_locale');
  return code != null ? Locale(code) : const Locale('en');
}

Future<void> saveLocale(Locale locale) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('employer_app_locale', locale.languageCode);
}

String localeDisplayName(Locale locale) {
  switch (locale.languageCode) {
    case 'am':
      return 'አማርኛ';
    case 'om':
      return 'Afaan Oromoo';
    default:
      return 'English';
  }
}

String localeFlag(Locale locale) {
  switch (locale.languageCode) {
    case 'am':
    case 'om':
      return '🇪🇹';
    default:
      return '🇬🇧';
  }
}
