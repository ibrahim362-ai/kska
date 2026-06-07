import 'package:flutter/material.dart';

class AppTheme {
  // Green Only Theme - Islamic Green Palette
  // Primary: Green (Islam, Paradise, Life)
  static const Color primaryGreen = Color(0xFF00A651); // Islamic Green
  static const Color primaryGreenDark = Color(0xFF059669); // Dark Green
  static const Color primaryGreenMedium = Color(0xFF10B981); // Medium Green
  static const Color primaryGreenLight = Color(0xFF34D399); // Light Green
  static const Color primaryGreenVeryLight = Color(0xFF6EE7B7); // Very Light Green
  
  // Neutral: Black, Gray, White
  static const Color textBlack = Color(0xFF1F2937); // Black
  static const Color textDark = Color(0xFF111827); // Darker Black
  static const Color textGray = Color(0xFF6B7280); // Gray
  static const Color textLightGray = Color(0xFF9CA3AF); // Light Gray
  
  static const Color pureWhite = Color(0xFFFFFFFF); // White (Purity)
  static const Color offWhite = Color(0xFFFAFAFA); // Off-white

  // Status Colors (Green Shades Only)
  static const Color success = Color(0xFF10B981); // Success Green
  static const Color successLight = Color(0xFF34D399);
  static const Color warning = Color(0xFF059669); // Dark Green for warning
  static const Color warningLight = Color(0xFF10B981);
  static const Color error = Color(0xFFB91C1C); // Keep red for errors only
  static const Color errorLight = Color(0xFFDC2626);
  static const Color info = Color(0xFF00A651); // Primary Green
  static const Color infoLight = Color(0xFF34D399);

  // Backgrounds
  static const Color backgroundLight = Color(0xFFF0FDF4); // Very light green tint
  static const Color surfaceLight = Color(0xFFFFFFFF); // Pure white
  static const Color cardLight = Color(0xFFFFFFFF);

  // Green Gradients Only
  static List<Color> get primaryGradient => [primaryGreen, primaryGreenLight];
  static List<Color> get darkGreenGradient => [primaryGreenDark, primaryGreen];
  static List<Color> get lightGreenGradient => [primaryGreenLight, primaryGreenVeryLight];
  static List<Color> get mediumGreenGradient => [primaryGreen, primaryGreenMedium];
  static List<Color> get backgroundGradient => [
    primaryGreen.withOpacity(0.05),
    primaryGreenLight.withOpacity(0.02),
  ];

  // Light Theme with Green Only
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.light(
      primary: primaryGreen,
      primaryContainer: primaryGreen.withOpacity(0.1),
      secondary: primaryGreenMedium,
      secondaryContainer: primaryGreenLight.withOpacity(0.15),
      tertiary: primaryGreenDark,
      tertiaryContainer: primaryGreenDark.withOpacity(0.1),
      surface: surfaceLight,
      surfaceContainerHighest: const Color(0xFFF0FDF4),
      error: error,
      errorContainer: error.withOpacity(0.1),
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: textBlack,
      onError: Colors.white,
      outline: const Color(0xFFE5E7EB),
    ),
    scaffoldBackgroundColor: backgroundLight,
    
    // AppBar Theme - Green with Gold accents
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: true,
      shadowColor: Colors.black12,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: TextStyle(
        color: textBlack,
        fontSize: 20,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
      ),
      iconTheme: IconThemeData(
        color: primaryGreen,
        size: 24,
      ),
    ),

    // Card Theme
    cardTheme: CardThemeData(
      elevation: 0,
      color: cardLight,
      shadowColor: primaryGreen.withOpacity(0.08),
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: const Color(0xFFE5E7EB).withOpacity(0.6),
          width: 1,
        ),
      ),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    ),

    // Input Decoration Theme
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFFF0FDF4), // Light green tint
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB), width: 1.5),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB), width: 1.5),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: primaryGreen, width: 2.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: error, width: 1.5),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: error, width: 2.5),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      hintStyle: TextStyle(
        color: textGray.withOpacity(0.5),
        fontWeight: FontWeight.w400,
      ),
      labelStyle: const TextStyle(
        color: textGray,
        fontWeight: FontWeight.w500,
      ),
      floatingLabelStyle: const TextStyle(
        color: primaryGreen,
        fontWeight: FontWeight.w600,
      ),
    ),

    // Elevated Button Theme
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        shadowColor: primaryGreen.withOpacity(0.3),
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        textStyle: const TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    ),

    // Filled Button Theme
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        elevation: 2,
        shadowColor: primaryGreen.withOpacity(0.3),
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        textStyle: const TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    ),

    // Outlined Button Theme
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        side: const BorderSide(color: primaryGreen, width: 2),
        foregroundColor: primaryGreen,
        textStyle: const TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    ),

    // Text Button Theme
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        foregroundColor: primaryGreen,
        textStyle: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.3,
        ),
      ),
    ),

    // Bottom Navigation Bar Theme
    navigationBarTheme: NavigationBarThemeData(
      height: 72,
      elevation: 0,
      backgroundColor: Colors.white,
      shadowColor: Colors.black.withOpacity(0.05),
      surfaceTintColor: Colors.transparent,
      indicatorColor: primaryGreen.withOpacity(0.12),
      indicatorShape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.3,
            color: primaryGreen,
          );
        }
        return const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          letterSpacing: 0.3,
          color: textGray,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const IconThemeData(color: primaryGreen, size: 28);
        }
        return IconThemeData(color: textGray.withOpacity(0.5), size: 26);
      }),
    ),

    // Floating Action Button Theme
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      elevation: 6,
      highlightElevation: 12,
      backgroundColor: primaryGreen,
      foregroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
      ),
      iconSize: 28,
    ),

    // Chip Theme
    chipTheme: ChipThemeData(
      backgroundColor: const Color(0xFFF0FDF4), // Light green
      deleteIconColor: textGray,
      labelStyle: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.2,
        color: primaryGreen,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      side: BorderSide(
        color: primaryGreen.withOpacity(0.3),
        width: 1,
      ),
    ),

    // Divider Theme
    dividerTheme: const DividerThemeData(
      color: Color(0xFFE5E7EB),
      thickness: 1,
      space: 1,
    ),

    // Snackbar Theme
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: textBlack,
      contentTextStyle: const TextStyle(
        color: Colors.white,
        fontSize: 15,
        fontWeight: FontWeight.w500,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      elevation: 6,
    ),

    // Dialog Theme
    dialogTheme: DialogThemeData(
      backgroundColor: Colors.white,
      elevation: 8,
      shadowColor: Colors.black.withOpacity(0.1),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
      ),
      titleTextStyle: const TextStyle(
        color: textBlack,
        fontSize: 22,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
      ),
      contentTextStyle: const TextStyle(
        color: textGray,
        fontSize: 16,
        fontWeight: FontWeight.w400,
        height: 1.5,
      ),
    ),

    // Progress Indicator Theme
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: primaryGreen,
      linearTrackColor: Color(0xFFE5E7EB),
      circularTrackColor: Color(0xFFE5E7EB),
    ),

    // Text Theme
    textTheme: const TextTheme(
      displayLarge: TextStyle(fontSize: 57, fontWeight: FontWeight.w800, letterSpacing: -1.5, color: textBlack, height: 1.1),
      displayMedium: TextStyle(fontSize: 45, fontWeight: FontWeight.w700, letterSpacing: -1.0, color: textBlack, height: 1.15),
      displaySmall: TextStyle(fontSize: 36, fontWeight: FontWeight.w700, letterSpacing: -0.5, color: textBlack, height: 1.2),
      headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, letterSpacing: -0.5, color: textBlack, height: 1.2),
      headlineMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, letterSpacing: -0.3, color: textBlack, height: 1.25),
      headlineSmall: TextStyle(fontSize: 24, fontWeight: FontWeight.w600, letterSpacing: 0, color: textBlack, height: 1.3),
      titleLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.w600, letterSpacing: 0, color: textBlack, height: 1.3),
      titleMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, letterSpacing: 0.15, color: textBlack, height: 1.4),
      titleSmall: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, letterSpacing: 0.1, color: textBlack, height: 1.4),
      bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w400, letterSpacing: 0.15, color: textBlack, height: 1.5),
      bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, letterSpacing: 0.25, color: textGray, height: 1.5),
      bodySmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w400, letterSpacing: 0.4, color: textGray, height: 1.5),
      labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: 0.5, color: textBlack, height: 1.4),
      labelMedium: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.5, color: textGray, height: 1.4),
      labelSmall: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, letterSpacing: 0.5, color: textLightGray, height: 1.4),
    ),
  );
}
