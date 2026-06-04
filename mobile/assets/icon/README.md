# App Icon & Splash Screen

This directory should contain your app icons and splash screen images.

## Required Files

### App Icons
- `app_icon.png` (1024x1024, transparent background for iOS, opaque for Android)
- `app_icon_foreground.png` (1024x1024, foreground only for Android adaptive icon)
- Optional: dark mode variants

### Splash Screens
- `splash.png` (1242x2436, light mode)
- `splash_dark.png` (1242x2436, dark mode)
- `splash_android12.png` (1152x1152, Android 12+ style)

## Generate

After placing your PNG files here, run:

```bash
# Generate app icons (Android + iOS)
dart run flutter_launcher_icons

# Generate splash screens
dart run flutter_native_splash:create
```

Both commands use the configuration in `pubspec.yaml`.

## Design Guidelines

### App Icon
- 1024x1024 PNG
- Centered logo with safe area
- Solid or gradient background (#667eea is our primary)
- No text on the icon (it will be illegible at small sizes)
- Use simple, recognizable shapes

### Splash
- 1242x2436 (iPhone X ratio)
- Solid background color
- Centered logo
- Keep simple — it shows for only 1-2 seconds

## Free Icon Tools

- **Figma** — design the master file
- **Sketch** — professional mockups
- **Canva** — quick designs
- **Inkscape** — open-source vector editor

## Free Icon Sets

- [Flaticon](https://www.flaticon.com)
- [Icons8](https://icons8.com)
- [Material Icons](https://fonts.google.com/icons)
- [Heroicons](https://heroicons.com)
