# App Icon & Splash Screen

Place your PNG files here:
- `app_icon.png` (1024x1024, master icon)
- `app_icon_foreground.png` (1024x1024, foreground only for Android adaptive)
- `splash.png` (1242x2436, light mode)
- `splash_dark.png` (1242x2436, dark mode)
- `splash_android12.png` (1152x1152, Android 12+)

Then run:
```bash
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

## Design Guidelines

Use the existing app theme: primary gradient `#667eea → #764ba2`.
- Solid color background or gradient
- Centered logo with safe area
- No text (illegible at small sizes)
- Simple, recognizable shape
