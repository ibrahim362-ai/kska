# Mobile App Build & Release Guide

This guide covers building the Flutter mobile apps for production and publishing them to Google Play Store and Apple App Store.

## 📋 Prerequisites

- Flutter SDK 3.x installed (https://flutter.dev)
- Java JDK 17 (for Android)
- Android Studio + Android SDK (for Android builds)
- Xcode 15+ (for iOS, macOS only)
- CocoaPods (for iOS dependencies)
- A developer account:
  - Google Play: $25 one-time
  - Apple App Store: $99/year

## 🔧 Initial Setup

### 1. Get the dependencies

```bash
cd mobile  # or employer_app
flutter pub get
```

### 2. Firebase setup (for push notifications)

#### Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create a new project: `community-hub-mobile`
3. Add Android app (package: `com.communityhub.mobile`)
4. Add iOS app (bundle: `com.communityhub.mobile`)
5. Download configs:
   - `google-services.json` → place in `android/app/`
   - `GoogleService-Info.plist` → place in `ios/Runner/`
6. Get service account JSON for backend (see backend `.env`)

#### Configure Android
The `android/app/build.gradle.kts` should include the Google services plugin.
If not, add:
```kotlin
plugins {
    id("com.google.gms.google-services")
}
```

#### Configure iOS
Add to `ios/Runner/Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

### 3. Update API URL

For production, point to your live backend:
- `lib/services/api_service.dart` → `baseUrl = 'https://api.communityhub.com/api'`
- `lib/services/socket_service.dart` → `apiUrl = 'https://api.communityhub.com'`

Or use `--dart-define` for different environments:
```bash
flutter run --dart-define=API_URL=https://api.communityhub.com
```

## 🏗️ Building for Android

### 1. Generate signing key (first time only)

```bash
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

This creates a keystore file. **KEEP IT SAFE!** You need it for every future update.

### 2. Configure signing

Create `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=upload
storeFile=/Users/yourname/upload-keystore.jks
```

Edit `android/app/build.gradle.kts`:
```kotlin
val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"] as String?
            keyPassword = keystoreProperties["keyPassword"] as String?
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String?
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
            isShrinkResources = true
        }
    }
}
```

### 3. Build APK (for testing)

```bash
flutter build apk --release \
  --dart-define=API_URL=https://api.communityhub.com
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### 4. Build App Bundle (for Play Store)

```bash
flutter build appbundle --release \
  --dart-define=API_URL=https://api.communityhub.com
```

Output: `build/app/outputs/bundle/release/app-release.aab`

### 5. Test the build

Install on a real device:
```bash
adb install build/app/outputs/flutter-apk/app-release.apk
```

## 🏗️ Building for iOS

### 1. Update Pods

```bash
cd ios
pod install --repo-update
cd ..
```

### 2. Open in Xcode

```bash
open ios/Runner.xcworkspace
```

In Xcode:
- Select the `Runner` project
- Select `Runner` target → `Signing & Capabilities`
- Set Team to your Apple developer account
- Set Bundle Identifier: `com.communityhub.mobile`
- Ensure capabilities include: Push Notifications, Background Modes (Remote notifications)

### 3. Update version

In `ios/Runner/Info.plist`:
```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

Or in `pubspec.yaml`:
```yaml
version: 1.0.0+1
```

### 4. Build for testing

```bash
flutter build ios --release --no-codesign \
  --dart-define=API_URL=https://api.communityhub.com
```

### 5. Build for App Store

```bash
flutter build ipa --release \
  --dart-define=API_URL=https://api.communityhub.com
```

Output: `build/ios/ipa/community_hub_mobile.ipa`

Or use Xcode → Product → Archive

## 📤 Publishing to Google Play Store

### 1. Create app in Play Console

1. Go to https://play.google.com/console
2. Click **Create app**
3. Fill in: App name, default language, app/game category
4. Accept declarations

### 2. Fill in store listing

- **App name**: Community Hub
- **Short description** (80 chars): Connect, vote, and attend events in your community
- **Full description** (4000 chars): [your description]
- **App icon**: 512x512 PNG
- **Feature graphic**: 1024x500 PNG
- **Screenshots**: At least 2 per device type (phone, 7-inch tablet, 10-inch tablet)

### 3. Upload your AAB

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload `app-release.aab`
4. Add release notes
5. Review and roll out

### 4. Internal testing track first

Before going to production, use internal testing:
- **Internal testing**: Up to 100 testers, fast review
- **Closed testing**: Larger groups, opt-in
- **Open testing**: Anyone can join

### 5. Submit for review

- Fill in: Content rating, target audience, data safety form
- Set pricing (free)
- Submit for review (typically 1-3 days)

## 📤 Publishing to Apple App Store

### 1. Create app in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in: Name, primary language, bundle ID, SKU

### 2. Fill in app information

- **App name**: Community Hub
- **Subtitle** (30 chars): Community engagement
- **Description**, **Keywords**, **Support URL**, **Marketing URL**
- **Screenshots**: 6.5", 5.5" displays required; iPad optional
- **App icon**: 1024x1024 PNG (no transparency)

### 3. Upload build via Xcode or Transporter

```bash
xcrun altool --upload-app \
  --type ios \
  --file build/ios/ipa/community_hub_mobile.ipa \
  --username your@email.com \
  --password your-app-specific-password
```

Or:
1. Open Xcode → Window → Organizer
2. Select your archive
3. Click **Distribute App** → **App Store Connect** → **Upload**

### 4. Submit for review

1. In App Store Connect, select the build
2. Fill in: Version info, content rights, advertising ID
3. Answer export compliance questions
4. Submit for review (typically 1-2 days)

## 🔄 Updating the App

### Android
1. Increment `version` in `pubspec.yaml` (e.g., `1.0.1+2`)
2. `flutter build appbundle --release`
3. Upload new AAB to Play Console

### iOS
1. Increment version
2. `flutter build ipa --release`
3. Upload new IPA via Xcode or Transporter

### Backend version check
Force-update via the `X-Min-Version` header in API responses. Use a package like `package_info_plus` to check version on app start.

## 🐛 Troubleshooting

### "App not installed" on Android
- Check signing config matches
- Uninstall previous version first
- Check `minSdkVersion` in build.gradle

### "Missing Info.plist key" on iOS
- Add required keys: `NSPhotoLibraryUsageDescription`, `NSCameraUsageDescription`
- These are required if you use image_picker

### Push notifications not working
- Android: Check `google-services.json` is in `android/app/`
- iOS: Check Push Notifications capability is enabled
- Test on real device, not emulator

### Build fails with "License for package Android SDK"
```bash
flutter doctor --android-licenses
# Accept all
```

## 📊 Crash Reporting

In production, integrate Firebase Crashlytics:

```dart
import 'package:firebase_crashlytics/firebase_crashlytics.dart';

await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
```

Or Sentry (already integrated in backend).

## 📋 Pre-release Checklist

- [ ] Version bumped in `pubspec.yaml`
- [ ] API URL points to production
- [ ] All API keys/secrets in place
- [ ] Firebase configured
- [ ] Tested on real Android device
- [ ] Tested on real iOS device
- [ ] Tested with slow network
- [ ] Tested offline
- [ ] Privacy policy linked
- [ ] Terms of service linked
- [ ] Sentry/Crashlytics working
- [ ] Push notifications working
- [ ] Deep links working
- [ ] All translations complete
- [ ] App icon and splash screen final
- [ ] Screenshots captured
- [ ] Store listing written
