# APK Folder - SkillDash Mobile App

This folder contains everything related to building SkillDash as an Android APK.

## 📁 Folder Structure

```
apk/
├── android/                      ← Android native project (Capacitor)
│   ├── app/                      ← Android app source
│   ├── gradle/                   ← Build tools
│   └── gradlew.bat              ← Build script
│
├── 📚 Documentation
│   ├── DOCUMENTATION_INDEX.md    ← Start here!
│   ├── README_APK_SETUP.md       ← Overview
│   ├── YOUR_ACTION_PLAN.md       ← Track your progress
│   ├── VISUAL_GUIDE.md           ← Diagrams
│   ├── APK_QUICK_REFERENCE.md    ← Quick commands
│   ├── SETUP_CHECKLIST.md        ← Installation steps
│   ├── APK_BUILD_GUIDE.md        ← Complete guide
│   └── WHY_NO_CLOSE_BUTTON.md    ← Technical details
│
├── build-apk.ps1                 ← PowerShell build script
├── capacitor.config.ts           ← Capacitor configuration
└── README.md                      ← This file
```

## 🚀 Quick Start

From the **root** (`A:\SkillDash`), run:

```bash
pnpm apk
```

This builds your SkillDash app as an Android APK.

## 📖 Documentation

All documentation files are in this folder. **Start with:**

1. **DOCUMENTATION_INDEX.md** - Overview of all guides
2. **YOUR_ACTION_PLAN.md** - Track your progress
3. **SETUP_CHECKLIST.md** - Installation steps

## 🏗️ Build System

### Available Commands (from root)

```bash
pnpm apk            # Full build: web + Android + APK
pnpm cap-build      # Build web + sync to Android
pnpm cap-dev        # Open Android Studio
pnpm cap-sync       # Sync web assets to Android
```

### How It Works

```
Root directory (A:\SkillDash)
    ↓
pnpm build          ← Builds Next.js app
    ↓ (output: out/)
pnpm cap-build      ← Syncs to apk/android
    ↓
apk/android/
    ↓
./gradlew assembleDebug  ← Builds APK
    ↓
APK file created: apk/android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 APK Output Location

After building, your APK will be at:

```
apk/android/app/build/outputs/apk/debug/app-debug.apk
```

Or for release:

```
apk/android/app/build/outputs/apk/release/app-release.apk
```

## ✨ Key Points

- ✅ All APK-related files are organized here
- ✅ Root directory stays clean
- ✅ symlink: `capacitor.config.ts` at root → `apk/capacitor.config.ts`
- ✅ Build commands work from root
- ✅ Android folder at `apk/android/`

## 🔧 Configuration

### `capacitor.config.ts`
Located in both:
- `apk/capacitor.config.ts` (actual file)
- Root `capacitor.config.ts` (symlink, for Capacitor CLI)

**Key settings:**
- `appId`: `com.skilldash.app`
- `appName`: `SkillDash`
- `webDir`: `../out` (points to root's `out/` folder)

### `package.json` Scripts (Updated)
All scripts now point to `apk/android/`:

```json
{
  "cap-build": "pnpm build && cap copy apk/android",
  "cap-dev": "cap open apk/android",
  "cap-sync": "cap sync apk/android",
  "apk": "pnpm cap-build && cd apk/android && ./gradlew assembleDebug"
}
```

## 📊 File Organization Benefits

- ✅ **Clean root** - No clutter, just Next.js config
- ✅ **Organized** - All mobile stuff in one place
- ✅ **Easy navigation** - Docs + code together
- ✅ **Scalable** - Room for iOS, web, other platforms

## ⚠️ Important Notes

1. **Build from root**: Always run `pnpm apk` from `A:\SkillDash`, not from `apk/`
2. **Capacitor CLI works**: Thanks to symlink at root level
3. **Documentation**: Check docs in this folder for setup help

## 🚨 Troubleshooting

### Commands not working?
- Ensure you're in `A:\SkillDash` (root), not in `apk/`
- Verify `capacitor.config.ts` symlink exists at root

### APK not building?
- See `APK_BUILD_GUIDE.md` in this folder

### Setup issues?
- Follow `SETUP_CHECKLIST.md` step-by-step

## 📚 Next Steps

1. Read: `DOCUMENTATION_INDEX.md`
2. Follow: `SETUP_CHECKLIST.md`
3. Run: `pnpm apk`

---

**All set!** Your SkillDash APK setup is organized and ready. 🎉
