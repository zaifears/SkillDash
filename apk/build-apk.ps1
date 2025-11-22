#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick build script for SkillDash APK
.DESCRIPTION
    This script automates the process of building and running SkillDash APK
.EXAMPLE
    ./build-apk.ps1 debug
    ./build-apk.ps1 release
#>

param(
    [ValidateSet("debug", "release", "open", "sync", "clean")]
    [string]$Command = "debug"
)

function Write-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║     SkillDash APK Build Tool           ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Build-WebAssets {
    Write-Host "📦 Building web assets..." -ForegroundColor Yellow
    pnpm build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Web build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Web assets built successfully" -ForegroundColor Green
}

function Sync-Android {
    Write-Host "🔄 Syncing with Android project..." -ForegroundColor Yellow
    pnpm cap-sync
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Sync failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Sync completed" -ForegroundColor Green
}

function Build-APK {
    param([string]$BuildType = "debug")
    
    Write-Host "🏗️  Building $BuildType APK..." -ForegroundColor Yellow
    
    cd android
    
    if ($BuildType -eq "debug") {
        ./gradlew assembleDebug
        $apkPath = "app/build/outputs/apk/debug/app-debug.apk"
    } else {
        ./gradlew assembleRelease
        $apkPath = "app/build/outputs/apk/release/app-release.apk"
    }
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $apkPath)) {
        Write-Host "✅ APK built successfully!" -ForegroundColor Green
        Write-Host "📁 Location: $(Get-Location)\$apkPath" -ForegroundColor Cyan
        cd ..
        return $apkPath
    } else {
        Write-Host "❌ APK build failed!" -ForegroundColor Red
        cd ..
        exit 1
    }
}

function Open-AndroidStudio {
    Write-Host "🚀 Opening Android Studio..." -ForegroundColor Yellow
    pnpm cap-dev
}

function Clean-Build {
    Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow
    pnpm clean
    cd android
    ./gradlew clean
    cd ..
    Write-Host "✅ Clean completed" -ForegroundColor Green
}

# Main execution
Write-Header

switch ($Command) {
    "debug" {
        Build-WebAssets
        Sync-Android
        Build-APK "debug"
    }
    "release" {
        Build-WebAssets
        Sync-Android
        Build-APK "release"
    }
    "open" {
        Open-AndroidStudio
    }
    "sync" {
        Build-WebAssets
        Sync-Android
    }
    "clean" {
        Clean-Build
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Done! ✨" -ForegroundColor Cyan
