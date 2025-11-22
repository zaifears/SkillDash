# SkillDash APK - Your Action Plan

Use this file to track your progress from now to deployment.

## 📋 Phase 1: Learn (Today) - 15 minutes

- [ ] Read: `DOCUMENTATION_INDEX.md` (2 min)
- [ ] Read: `README_APK_SETUP.md` (5 min)
- [ ] Read: `VISUAL_GUIDE.md` (5 min)
- [ ] Skim: `APK_QUICK_REFERENCE.md` (3 min)

**Status:** ☐ Complete

---

## 🔧 Phase 2: Install Requirements (Day 1) - 1-2 hours

### A. Java Development Kit (JDK) 17+
- [ ] Download from: https://www.oracle.com/java/technologies/downloads/
- [ ] Or: `winget install Oracle.JDK.17`
- [ ] Verify: Run `java -version` in PowerShell
  - Should show: `java version "17" or higher`
- [ ] ✅ Confirmed working

### B. Android SDK
- [ ] Download Android Studio: https://developer.android.com/studio
- [ ] Or: Command-line tools
- [ ] Install SDK APIs (in Android Studio):
  - [ ] API Level 31
  - [ ] API Level 32 (or 33)
- [ ] ✅ Confirmed installed

### C. Environment Variables
- [ ] Run in PowerShell (admin):
  ```powershell
  [Environment]::SetEnvironmentVariable(
    "ANDROID_HOME",
    "C:\Users\YourName\AppData\Local\Android\sdk",
    [System.EnvironmentVariableTarget]::User
  )
  ```
- [ ] Restart PowerShell
- [ ] Verify: Run `$env:ANDROID_HOME`
  - Should show path to Android SDK
- [ ] ✅ Environment variable set

### D. Android Licenses
- [ ] Run: `sdkmanager --licenses`
- [ ] Accept all prompts (type 'y')
- [ ] ✅ Licenses accepted

**Status:** ☐ All requirements installed

---

## 🏗️ Phase 3: Build (Day 2) - 10 minutes

### First Build
- [ ] Open PowerShell
- [ ] Run: `cd A:\SkillDash`
- [ ] Run: `pnpm apk`
- [ ] Wait for completion (5-10 minutes)
  - First build takes longer (Gradle downloads deps)
  - Subsequent builds: 30-60 seconds
- [ ] Look for: `✅ APK built successfully!`
- [ ] ✅ Build completed

### Verify Output
- [ ] Check file exists:
  - `android/app/build/outputs/apk/debug/app-debug.apk`
- [ ] File size: Should be 15-50 MB
- [ ] ✅ APK file verified

**Status:** ☐ First APK built

---

## 📱 Phase 4: Test (Day 2) - 5 minutes

### Option A: Test on Connected Device
- [ ] Connect Android phone via USB
- [ ] Enable USB debugging on phone
- [ ] Run: `adb install android/app/build/outputs/apk/debug/app-debug.apk`
- [ ] Launch app from your phone
- [ ] ✅ App installed and launched

### Option B: Test on Emulator
- [ ] Open Android Studio
- [ ] Launch Android Emulator (AVD)
- [ ] Run: `adb install android/app/build/outputs/apk/debug/app-debug.apk`
- [ ] Launch app in emulator
- [ ] ✅ App installed and launched

### Verification Checklist
- [ ] App launches fullscreen
- [ ] **NO X button appears** ← Critical!
- [ ] Navigation works
- [ ] Pages load correctly
- [ ] Orientation locked to portrait
- [ ] All features accessible
- [ ] ✅ All tests passed

**Status:** ☐ App tested successfully

---

## 🚀 Phase 5: Deployment Prep (Day 3+)

### For Development/Testing Only
- [ ] Keep using `pnpm apk` for updates
- [ ] Test new features on device
- [ ] Share app-debug.apk with testers

### For Google Play Store
- [ ] Follow: `APK_BUILD_GUIDE.md` (Release Builds section)
- [ ] Generate signing key
- [ ] Build release APK
- [ ] Create Google Play Developer account ($25)
- [ ] Upload to Play Console
- [ ] Set app details, screenshots, etc.
- [ ] Submit for review (1-3 hours typically)
- [ ] ✅ Listed on Google Play Store

### For F-Droid (Optional)
- [ ] Push source code to GitHub (public)
- [ ] Add open source license
- [ ] Remove any proprietary libraries
- [ ] Follow: `APK_BUILD_GUIDE.md` (F-Droid section)
- [ ] Submit to F-Droid
- [ ] ✅ Listed on F-Droid

**Status:** ☐ Deployment plan created

---

## 📝 Important Dates

- **Android SDK installed:** _______________
- **First successful build:** _______________
- **Tested on device:** _______________
- **Play Store submission:** _______________
- **F-Droid submission:** _______________

---

## 🔄 Ongoing Development

### Making Changes to Your App

After you update your code:

```bash
# Simple update after code changes
pnpm apk

# For just syncing (no full rebuild)
pnpm cap-sync

# For just web app changes
pnpm build
pnpm cap-sync
```

### Keeping Track

- [ ] Use git to version your code
- [ ] Tag releases: `git tag v1.0.0`
- [ ] Update version in `capacitor.config.ts`
- [ ] Update version in `package.json`

---

## 📞 Common Issues & Solutions

### "ANDROID_HOME not set"
- [ ] Follow Phase 2C above
- [ ] Ensure path is correct
- [ ] Restart PowerShell after setting

### "Build failed"
- [ ] Check: `APK_BUILD_GUIDE.md` (Troubleshooting section)
- [ ] Ensure JDK 17+ (not just JRE)
- [ ] Ensure API Level 31+ installed

### "App shows close button"
- [ ] You're likely running in browser, not APK
- [ ] Read: `WHY_NO_CLOSE_BUTTON.md`
- [ ] Ensure you built as APK, not PWA

### "APK too large"
- [ ] Normal for Next.js apps (15-50 MB)
- [ ] Can optimize by removing unused deps
- [ ] See: `APK_BUILD_GUIDE.md` (Performance section)

---

## ✅ Final Checklist

- [ ] All documentation read
- [ ] Android SDK installed & verified
- [ ] JDK 17+ installed & verified
- [ ] ANDROID_HOME set & verified
- [ ] First APK built successfully
- [ ] App tested on device/emulator
- [ ] **NO X button visible** ← Confirm!
- [ ] Ready to deploy

---

## 🎯 Success Criteria

✅ **You're successful when:**
- App builds with `pnpm apk`
- APK file is created
- App installs on Android device
- App launches fullscreen
- No X button appears
- Navigation works
- All features accessible

---

## 📚 Quick Reference

| Task | Command | Time |
|------|---------|------|
| Build APK | `pnpm apk` | 5-10 min |
| Sync only | `pnpm cap-sync` | 30 sec |
| Open Android Studio | `pnpm cap-dev` | instant |
| Clean build | `pnpm clean` | 1 min |
| Check Java | `java -version` | instant |
| Check Android SDK | `sdkmanager --list` | 30 sec |

---

## 📖 Documentation Quick Links

| Need | Read |
|------|------|
| Overview | DOCUMENTATION_INDEX.md |
| Executive summary | README_APK_SETUP.md |
| Visual flow | VISUAL_GUIDE.md |
| Quick commands | APK_QUICK_REFERENCE.md |
| Setup steps | SETUP_CHECKLIST.md |
| Complete guide | APK_BUILD_GUIDE.md |
| Technical details | WHY_NO_CLOSE_BUTTON.md |

---

## 🎉 You've Got This!

Save this file and check off boxes as you progress. You're well on your way to having SkillDash as a professional Android app!

**Questions?** Check the relevant documentation file above.

**Ready?** Start with Phase 1 - Read the docs! 📚
