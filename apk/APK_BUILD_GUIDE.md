# SkillDash Android APK Setup Guide

## Overview
SkillDash is now configured to build as an Android APK using Capacitor, a modern framework for building cross-platform native applications with web technologies.

## Architecture
- **Frontend**: Next.js React application
- **Wrapper**: Capacitor (Native Android wrapper)
- **Display**: WebView (embedded browser in the app)
- **Build Output**: Standalone static files in `/out` directory

## Prerequisites

Before building the APK, ensure you have:

1. **Node.js & pnpm** - Already installed
2. **Java Development Kit (JDK) 25** (or 17+)
   ```powershell
   java -version
   ```
   → See: `../SDK_AND_JDK_SETUP.md` for detailed installation

3. **Android SDK**
   - Install Android Studio or Android SDK Command-line tools
   - Set `ANDROID_HOME` environment variable
   - Example: `$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\sdk"`
   → See: `../SDK_AND_JDK_SETUP.md` for step-by-step guide

4. **Gradle** - Comes with Android Studio

## Project Structure

```
SkillDash/
├── apk/
│   ├── android/                 # Android native project
│   ├── capacitor.config.ts      # Capacitor configuration
│   └── ... (documentation files)
├── out/                     # Built web assets (auto-generated in root)
├── .next/                   # Next.js build output
└── package.json             # Scripts for building
```

## Build Commands

### 1. Build Web Assets
```bash
pnpm build
```
This builds the Next.js app and prepares assets for Capacitor.

### 2. Sync with Android
```bash
pnpm cap-sync
# or use the build + copy command:
pnpm cap-build
```
This copies the web assets to the Android project.

### 3. Build APK (Debug)
```bash
pnpm apk
# or manually:
cd apk/android
./gradlew assembleDebug
```
Output: `apk/android/app/build/outputs/apk/debug/app-debug.apk`

### 4. Build APK (Release)
```bash
cd apk/android
./gradlew assembleRelease
# or with signing
./gradlew bundleRelease
```

### 5. Open Android Studio
```bash
pnpm cap-dev
# or manually:
cd apk/android
# Open in Android Studio
```

## Configuration Files

### `capacitor.config.ts`
Main Capacitor configuration:
- `appId`: Package name (com.skilldash.app)
- `appName`: Display name (SkillDash)
- `webDir`: Web assets directory (out)
- `plugins`: Android-specific settings (splash screen, etc.)

### `android/app/src/main/AndroidManifest.xml`
Android manifest with:
- App permissions (INTERNET)
- Activity configuration
- Fullscreen orientation settings

### `public/site.webmanifest`
Web app manifest:
- `display: "standalone"` - Removes X close button
- Icon definitions
- Theme colors
- Start URL

## Removing the X (Close) Button

The X button is removed by the `display: "standalone"` setting in `site.webmanifest`:

```json
{
  "display": "standalone",
  "orientation": "portrait"
}
```

This is already configured. If you see a close button, it's likely from the browser UI, not the manifest.

## Building for Release

### 1. Generate Signing Key
```bash
keytool -genkey -v -keystore release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias release-key
```

### 2. Configure Gradle Signing
Edit `android/app/build.gradle.kts`:

```kotlin
signingConfigs {
    create("release") {
        storeFile = file("../release-key.keystore")
        storePassword = "your_password"
        keyAlias = "release-key"
        keyPassword = "your_password"
    }
}

buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
    }
}
```

### 3. Build Signed APK
```bash
cd android
./gradlew assembleRelease
```

## Uploading to F-Droid

If planning to upload to F-Droid:

1. **Make repository public** on GitHub
2. **Ensure open source license** (MIT, GPL, Apache 2.0, etc.)
3. **Remove proprietary libraries** and tracking
4. **Document build process** in README
5. **Create release tags** on GitHub
6. **Submit to F-Droid** at https://f-droid.org/en/

## Troubleshooting

### Build Fails with "ANDROID_HOME not set"
```powershell
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $env:ANDROID_HOME, [System.EnvironmentVariableTarget]::User)
```

### APK Too Large
- Disable Contentful fetching during build
- Remove unused dependencies
- Enable minification

### WebView Not Loading
- Check `capacitor.config.ts` `webDir` path
- Ensure `out/` directory exists and contains `index.html`
- Run `pnpm cap-build` to sync assets

### App Closes Immediately
- Check `android/app/build/outputs/logs/crash.log`
- Verify permissions in `AndroidManifest.xml`
- Check logcat: `adb logcat | grep capacitor`

## Performance Tips

1. **Image Optimization**: Use WebP format in public/
2. **Code Splitting**: Next.js does this automatically
3. **Caching**: Set cache headers for static assets
4. **Bundle Size**: Monitor with `pnpm bundle-size`

## Next Steps

1. Complete Android SDK setup
2. Configure signing key for release builds
3. Test on Android emulator or device
4. Optimize performance and UI for mobile
5. Submit to Google Play Store or F-Droid

## Useful Links

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Setup](https://developer.android.com/studio)
- [F-Droid Inclusion Guide](https://f-droid.org/en/docs/Submitting_an_app/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
