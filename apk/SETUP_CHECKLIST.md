# SkillDash APK Setup - Installation Checklist

## ✅ What's Been Done

- [x] Capacitor installed (@capacitor/core, @capacitor/cli, @capacitor/android)
- [x] Capacitor project initialized
- [x] Android native project created
- [x] Next.js configured for standalone output
- [x] Build scripts added to package.json
  - `pnpm cap-build` - Build and sync
  - `pnpm cap-dev` - Open Android Studio
  - `pnpm cap-sync` - Sync assets only
  - `pnpm apk` - Complete APK build
- [x] Web assets copied to Android project
- [x] Android manifest configured for fullscreen
- [x] Public HTML and manifests updated
- [x] Documentation created
  - APK_QUICK_REFERENCE.md
  - APK_BUILD_GUIDE.md
  - WHY_NO_CLOSE_BUTTON.md
  - build-apk.ps1

---

## ⏳ What You Need to Do

### Before Building APK

- [ ] **Install Java Development Kit (JDK) 17+**
  - Download from: https://www.oracle.com/java/technologies/downloads/
  - Or: `winget install Oracle.JDK.17`
  - Verify: `java -version` (should show 17+)

- [ ] **Install Android SDK**
  - Option A: Download Android Studio (includes SDK)
    - https://developer.android.com/studio
  - Option B: Command-line tools only
    - https://developer.android.com/studio#downloads

- [ ] **Set ANDROID_HOME environment variable**
  ```powershell
  # In PowerShell:
  [Environment]::SetEnvironmentVariable(
    "ANDROID_HOME", 
    "C:\Users\YourName\AppData\Local\Android\sdk", 
    [System.EnvironmentVariableTarget]::User
  )
  
  # Verify:
  $env:ANDROID_HOME
  ```

- [ ] **Install Android API Level 31+**
  - Open Android Studio
  - Tools → SDK Manager
  - Install API level 31, 32, or 33

- [ ] **Accept Android Licenses**
  ```bash
  sdkmanager --licenses
  # Accept all prompts
  ```

### Building the APK

- [ ] **Run build command**
  ```bash
  cd A:\SkillDash
  pnpm apk
  ```
  Expected output: `✅ APK built successfully!`

- [ ] **Locate your APK**
  - Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
  - Release: `android/app/build/outputs/apk/release/app-release.apk`

- [ ] **Test on device or emulator**
  ```bash
  # Install on connected device
  adb install android/app/build/outputs/apk/debug/app-debug.apk
  
  # Or use Android Studio to run on emulator
  ```

### For Production Release

- [ ] **Generate signing key** (see APK_BUILD_GUIDE.md)
- [ ] **Configure Gradle signing**
- [ ] **Build release APK**: `./gradlew assembleRelease`
- [ ] **Test release build thoroughly**
- [ ] **Prepare for Play Store or F-Droid**

---

## 🔍 Verification Checklist

After building, verify:

- [ ] APK file exists at expected location
- [ ] APK size is reasonable (~50-150MB for Next.js app)
- [ ] No X button appears when app is installed
- [ ] App runs fullscreen
- [ ] Orientation is locked to portrait
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] API calls work (if internet connected)
- [ ] Service worker activates (check DevTools)
- [ ] Offline content loads (if cached)

---

## 🆘 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| "ANDROID_HOME not found" | Set environment variable (see above) |
| "gradle not found" | Ensure gradlew.bat exists in android/ |
| "API level too low" | Install API 31+ in SDK Manager |
| "No SDK found" | Run Android Studio and complete setup |
| "Build fails with JDK error" | Ensure JDK 17+ (not just JRE) |
| "APK too large" | Check for node_modules in output |

---

## 📊 Build Times (Expected)

| Step | Duration |
|------|----------|
| pnpm build | 30-60s |
| cap sync | 10-20s |
| gradle build | 2-5 mins (first time) |
| gradle build | 30-60s (subsequent) |
| **Total First Build** | **5-10 minutes** |

---

## 🎯 Success Criteria

You'll know everything is working when:

✅ `pnpm apk` completes without errors  
✅ APK file is created  
✅ App installs on device  
✅ App launches fullscreen  
✅ No X button in corner  
✅ Navigation works  
✅ Can access all features  

---

## 💾 File Locations Reference

```
A:\SkillDash
├── capacitor.config.ts          ← Capacitor config
├── APK_QUICK_REFERENCE.md       ← Quick commands
├── APK_BUILD_GUIDE.md           ← Full guide
├── WHY_NO_CLOSE_BUTTON.md       ← Technical details
├── build-apk.ps1                ← Build script
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   └── AndroidManifest.xml
│   │   └── build/outputs/apk/
│   │       ├── debug/app-debug.apk         ← Debug APK
│   │       └── release/app-release.apk     ← Release APK
│   └── gradlew.bat              ← Build tool
└── out/                         ← Web assets (auto-generated)
```

---

## 🚀 Quick Commands Reference

```bash
# One-command APK build
pnpm apk

# Just build and sync (no APK)
pnpm cap-build

# Open in Android Studio
pnpm cap-dev

# Sync after changes
pnpm cap-sync

# Clean build artifacts
pnpm clean

# Check dependencies
pnpm outdated
```

---

## ✨ You're All Set!

Your SkillDash app is ready to build as an APK with:
- ✅ No X button (fullscreen app)
- ✅ WebView display (like Rail Sheba)
- ✅ Full offline support
- ✅ Native Android integration
- ✅ Ready for Play Store/F-Droid

**Next step:** Install Android SDK and JDK, then run `pnpm apk`!

Happy building! 🎉
