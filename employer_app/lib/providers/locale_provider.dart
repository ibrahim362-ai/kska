import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const supportedLocales = [
  Locale('en'),
  Locale('am'),
  Locale('om'),
];

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) => LocaleNotifier());

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(const Locale('en')) {
    _load();
  }

  static const _key = 'employer_app_locale';

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString(_key);
    if (code != null) state = Locale(code);
  }

  Future<void> set(Locale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, locale.languageCode);
  }
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
