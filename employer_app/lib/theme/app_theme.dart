import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Modern Green Color Palette
  static const primaryGreen = Color(0xFF10B981); // Emerald green
  static const darkGreen = Color(0xFF059669);
  static const lightGreen = Color(0xFF34D399);
  static const paleGreen = Color(0xFFD1FAE5);
  static const bgGreen = Color(0xFFF0FDF4);
  
  static const primaryGradient = LinearGradient(
    colors: [Color(0xFF059669), Color(0xFF10B981)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const secondaryGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF34D399)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const successGradient = LinearGradient(
    colors: [Color(0xFF059669), Color(0xFF34D399)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const warningGradient = LinearGradient(
    colors: [Color(0xFFf59e0b), Color(0xFFfbbf24)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const errorGradient = LinearGradient(
    colors: [Color(0xFFef4444), Color(0xFFf87171)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Light Theme - Modern Green Design
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryGreen,
      brightness: Brightness.light,
      primary: primaryGreen,
      secondary: lightGreen,
      surface: Colors.white,
      background: bgGreen,
    ),
    textTheme: GoogleFonts.interTextTheme(),
    scaffoldBackgroundColor: bgGreen,
    cardTheme: CardThemeData(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      color: Colors.white,
      shadowColor: primaryGreen.withOpacity(0.1),
    ),
    appBarTheme: AppBarTheme(
      elevation: 0,
      centerTitle: false,
      backgroundColor: Colors.transparent,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: GoogleFonts.inter(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: const Color(0xFF065F46),
        letterSpacing: -0.5,
      ),
      iconTheme: const IconThemeData(color: primaryGreen, size: 28),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        textStyle: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.5,
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: const BorderSide(color: primaryGreen, width: 2.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: const BorderSide(color: Color(0xFFef4444), width: 1.5),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      labelStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500),
      hintStyle: GoogleFonts.inter(fontSize: 14, color: Color(0xFF9CA3AF)),
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: primaryGreen,
      foregroundColor: Colors.white,
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(20))),
    ),
  );

  // Dark Theme - Removed (Light mode only)
  static ThemeData darkTheme = lightTheme; // Use light theme as fallback
}
