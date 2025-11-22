# SkillDash APK - Quick Reference

## 🚀 Quick Start

### Build APK (Recommended)
```bash
pnpm apk
```
This single command:
1. Builds the Next.js app
2. Syncs assets with Android
3. Creates the APK

### Alternative Scripts
```bash
# Just build web and sync (no APK)
pnpm cap-build

# Open in Android Studio
pnpm cap-dev

# Sync only (after making changes)
pnpm cap-sync
```

## 📁 What Was Changed

### New Files
- `capacitor.config.ts` - Capacitor configuration
- `APK_BUILD_GUIDE.md` - Detailed build guide
- `build-apk.ps1` - PowerShell build script
- `android/` - Full Android native project

### Modified Files
- `next.config.mjs` - Added `output: 'standalone'`
- `package.json` - Added Capacitor build scripts
- `public/index.html` - Enhanced with mobile meta tags
- `android/app/src/main/AndroidManifest.xml` - Added fullscreen settings

### New Dependencies (in package.json)
```json
{
  "@capacitor/android": "^7.4.4",
  "@capacitor/cli": "^7.4.4",
  "@capacitor/core": "^7.4.4"
}
```

## 🎯 Key Features

✅ **Fullscreen App** - No X button to close  
✅ **WebView Display** - Uses embedded browser  
✅ **Offline Support** - Service worker included  
✅ **Portrait Mode** - Locked to portrait orientation  
✅ **Fast Loading** - Splash screen with custom branding  

## 📦 Build Output

After running `pnpm apk`, find your APK at:

**Debug:** `android/app/build/outputs/apk/debug/app-debug.apk`  
**Release:** `android/app/build/outputs/apk/release/app-release.apk`

## 🔧 Requirements

Before building, ensure you have:

1. **Java Development Kit (JDK) 17+**
   ```powershell
   java -version  # Should show 17+
   ```

2. **Android SDK** with API Level 31+ installed

3. **ANDROID_HOME** environment variable set
   ```powershell
   # Check if set
   $env:ANDROID_HOME
   
   # If not set, add it:
   [Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\YourName\AppData\Local\Android\sdk", [System.EnvironmentVariableTarget]::User)
   ```

## ❌ No X Button Settings

The X button is removed by:
- `"display": "standalone"` in `site.webmanifest`
- `android:screenOrientation="portrait"` in `AndroidManifest.xml`
- Capacitor's fullscreen configuration

If you see a browser UI, ensure:
1. App is installed as APK (not running in browser)
2. Web manifest is served with correct MIME type
3. Android API level is 31+ (for fullscreen support)

## 🚢 Ready to Deploy?

### For Google Play Store
1. Generate signing key (see `APK_BUILD_GUIDE.md`)
2. Build release APK: `cd android && ./gradlew assembleRelease`
3. Upload to Google Play Console

### For F-Droid
1. Push source code to GitHub
2. Add open source license (MIT/GPL/Apache)
3. Remove any tracking libraries
4. Submit at https://f-droid.org/en/docs/Submitting_an_app/

## 📚 More Information

For detailed instructions, see:
- `APK_BUILD_GUIDE.md` - Complete setup guide
- `capacitor.config.ts` - Configuration options
- `android/app/build.gradle.kts` - Gradle settings

## ✨ Architecture Summary

```
User's Phone
    ↓
Android APK (Native wrapper)
    ↓
Capacitor (Bridge)
    ↓
WebView (Embedded browser)
    ↓
SkillDash Web App (React/Next.js)
```

The app runs your existing Next.js code inside an Android WebView, giving you:
- Native app experience
- Web development flexibility
- Access to device features via Capacitor plugins

## 🎓 Next Steps

1. ✅ Capacitor is set up
2. ⏳ Install Android SDK and JDK
3. ⏳ Run `pnpm apk` to build
4. ⏳ Test on device or emulator
5. ⏳ Optimize for mobile screens
6. ⏳ Submit to app stores
