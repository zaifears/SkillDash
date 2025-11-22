# Android Development Kit (SDK) & JDK 25 Setup Guide

## Quick Answer

### What is Android SDK?
**Android SDK** = Software Development Kit that contains:
- Android libraries and tools
- Emulator
- Build tools
- Android API levels (the framework your app runs on)
- Required for building Android apps

### Where to Download

**Option 1: Android Studio (Recommended - Easiest)**
- Download: https://developer.android.com/studio
- Includes: JDK, SDK, Gradle, Emulator, IDE
- Best for: Beginners, full development environment

**Option 2: Command-Line Tools Only (Lightweight)**
- Download: https://developer.android.com/studio/index.html#command-tools
- Includes: Just the SDK tools
- Best for: Experienced developers, CI/CD

---

## Step-by-Step Setup

### Step 1: Install JDK 25

**Option A: Direct Download (Recommended)**
```powershell
# Visit: https://www.oracle.com/java/technologies/downloads/
# Download: JDK 25 for Windows
# Follow installer (keep defaults)
# Verify installation:
java -version
```

**Option B: Using WinGet (Command-line)**
```powershell
# Open PowerShell as Administrator
winget install Oracle.JDK.25
```

**What you're installing:**
- Java compiler
- Java runtime environment
- Tools to compile your app code

### Step 2: Download Android SDK

**Best Option: Android Studio (All-in-One)**

1. Go to: https://developer.android.com/studio
2. Click "Download Android Studio"
3. Accept terms & download (~1 GB)
4. Run installer
5. Follow setup wizard:
   - Choose Standard installation
   - Accept defaults for SDK location
   - Install Android API 31+

**Alternative: Command-Line Tools Only**

1. Go to: https://developer.android.com/studio/index.html#command-tools
2. Download "Command line tools only"
3. Extract to: `C:\Android\cmdline-tools\`
4. Run: `cmdline-tools\bin\sdkmanager --list`

### Step 3: Set Environment Variables

**For Android Studio installers** (Usually automatic):

If not automatic, set manually:

```powershell
# Open PowerShell as Administrator

# Set ANDROID_HOME
[Environment]::SetEnvironmentVariable(
  "ANDROID_HOME",
  "C:\Users\YourUsername\AppData\Local\Android\sdk",
  [System.EnvironmentVariableTarget]::User
)

# Set JAVA_HOME
[Environment]::SetEnvironmentVariable(
  "JAVA_HOME",
  "C:\Program Files\Java\jdk-25",
  [System.EnvironmentVariableTarget]::User
)

# Add to PATH (Java)
$currentPath = [Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
$newPath = "$currentPath;C:\Program Files\Java\jdk-25\bin"
[Environment]::SetEnvironmentVariable(
  "Path",
  $newPath,
  [System.EnvironmentVariableTarget]::User
)

# Restart PowerShell and verify
java -version
```

### Step 4: Install Android API Levels

**Using Android Studio (GUI):**
1. Open Android Studio
2. Tools → SDK Manager
3. Check: API Level 31, 32, 33 (or higher)
4. Click "Apply" → Download & install

**Using Command-Line:**
```powershell
# After setting ANDROID_HOME

sdkmanager "platforms;android-31"
sdkmanager "platforms;android-32"
sdkmanager "build-tools;33.0.0"
```

---

## What Gets Installed

### JDK 25 Contains:
```
C:\Program Files\Java\jdk-25\
├── bin/          ← java, javac commands
├── lib/          ← Java libraries
└── ...
```

### Android SDK Contains:
```
C:\Users\YourName\AppData\Local\Android\sdk\
├── platforms/    ← Android API levels (31, 32, 33, etc.)
├── build-tools/  ← Compiler tools
├── emulator/     ← Android emulator
├── tools/        ← SDK tools
└── cmdline-tools/
```

### What's API Level?
Think of it as Android versions:
- API 31 = Android 12
- API 32 = Android 12.1
- API 33 = Android 13
- API 34 = Android 14

**You need at least API 31** for modern apps.

---

## Verification Checklist

After installation, verify everything works:

```powershell
# Check Java
java -version
# Should show: java version "25" or higher

# Check ANDROID_HOME set
$env:ANDROID_HOME
# Should show: C:\Users\YourName\AppData\Local\Android\sdk

# Check Android SDK installed
ls $env:ANDROID_HOME
# Should show: platforms, build-tools, emulator, etc.

# Check API levels
ls "$env:ANDROID_HOME\platforms"
# Should show: android-31, android-32, android-33, etc.
```

---

## Quick Comparison: JDK vs Android SDK

| JDK | Android SDK |
|-----|------------|
| **Java compiler** | Android tools & libraries |
| Compiles `.java` → `.class` | Builds Android-specific code |
| Required for Java development | Required for Android development |
| Single download (~500 MB) | Multiple components (~5-10 GB) |
| Sets `JAVA_HOME` | Sets `ANDROID_HOME` |
| Comes with JRE | Includes emulator |

---

## File Sizes (Approximate)

| Component | Size |
|-----------|------|
| JDK 25 | 500 MB |
| Android Studio | 1-2 GB |
| Android SDK (after setup) | 5-10 GB |
| **Total** | **6-12 GB** |

---

## Typical Directory Structure

After everything is installed:

```
C:\
├── Program Files\
│   └── Java\
│       └── jdk-25\              ← JDK location
├── Users\
    └── YourName\
        └── AppData\Local\
            └── Android\sdk\    ← Android SDK location
                ├── platforms\
                ├── build-tools\
                └── emulator\
```

---

## For SkillDash Specifically

Once installed, SkillDash build will work:

```powershell
cd A:\SkillDash

# Build the APK
pnpm apk

# ✅ It will find JDK and Android SDK automatically
```

---

## Troubleshooting

### "Java not found"
- Restart PowerShell after installing JDK
- Verify: `java -version`
- Check PATH includes JDK bin folder

### "ANDROID_HOME not found"
- Set environment variable (see Step 3 above)
- Restart PowerShell
- Verify: `$env:ANDROID_HOME`

### "Android SDK not found"
- Open Android Studio
- Go to Tools → SDK Manager
- Install API levels 31+
- Note the SDK path

### "Gradle not found"
- Usually included with Android Studio
- If using command-line tools, download Gradle separately
- Or: Android Studio includes it automatically

---

## Next Steps

1. **Install JDK 25**
   - Download from oracle.com
   - Run installer
   - Verify: `java -version`

2. **Install Android Studio**
   - Download from developer.android.com
   - Run installer
   - Complete SDK setup wizard

3. **Set Environment Variables**
   - `ANDROID_HOME` → SDK path
   - `JAVA_HOME` → JDK path
   - Verify both in PowerShell

4. **Build SkillDash APK**
   - From root: `cd A:\SkillDash`
   - Run: `pnpm apk`
   - Wait 5-10 minutes (first build)

---

## Resources

- **JDK 25 Download:** https://www.oracle.com/java/technologies/downloads/
- **Android Studio:** https://developer.android.com/studio
- **Android SDK Setup:** https://developer.android.com/studio/install
- **Environment Variables:** https://www.java.com/en/download/help/path.html
- **Gradle Documentation:** https://gradle.org

---

## FAQ

**Q: Do I need JDK 25 or can I use JDK 17?**
A: Either works. JDK 25 is newer. Minimum is JDK 11 for Android development.

**Q: Can I use OpenJDK instead of Oracle JDK?**
A: Yes! Download from https://adoptium.net/ (Eclipse Adoptium)

**Q: Do I need Android Studio or just SDK tools?**
A: For beginners: Android Studio (easier). For experienced: Command-line tools.

**Q: How much disk space do I need?**
A: ~10-15 GB total (JDK + Android SDK + Build cache)

**Q: Can I use an existing Java installation?**
A: Yes, if it's JDK 11+ (not just JRE). Verify with `java -version`

---

**You're ready!** Install these and you'll be able to build SkillDash as an APK. 🚀
