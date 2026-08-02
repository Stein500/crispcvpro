#!/bin/bash

# Script to build APK for CrispCV Pro
# This script guides you through the build process

echo "=========================================="
echo "CrispCV Pro - APK Build Script"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "build.gradle" ]; then
    echo "Error: Please run this script from the android-native directory"
    echo "Usage: cd android-native && ./build-apk.sh"
    exit 1
fi

echo "Current directory: $(pwd)"
echo ""

# Step 1: Check Java
echo "[1/5] Checking Java installation..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2)
    echo "✓ Java found: $JAVA_VERSION"
else
    echo "✗ Java not found!"
    echo ""
    echo "To install Java in Termux:"
    echo "  pkg install openjdk-17"
    echo ""
    echo "To install Java on Ubuntu/Debian:"
    echo "  sudo apt install openjdk-17-jdk"
    echo ""
    read -p "Press Enter after installing Java..." 
fi

# Step 2: Check Android SDK
echo ""
echo "[2/5] Checking Android SDK..."
if [ -d "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
    echo "✓ Android SDK found at: $ANDROID_HOME"
else
    echo "✗ Android SDK not found!"
    echo ""
    echo "To install Android SDK in Termux:"
    echo "  pkg install wget unzip"
    echo "  wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip"
    echo "  unzip commandlinetools-linux-*.zip -d ~/android-sdk"
    echo "  export ANDROID_HOME=~/android-sdk"
    echo "  export PATH=\$PATH:~/android-sdk/cmdline-tools/latest/bin"
    echo "  sdkmanager --install \"platform-tools\" \"platforms;android-34\" \"build-tools;34.0.0\""
    echo ""
    read -p "Press Enter after installing Android SDK..." 
fi

# Step 3: Sync website files
echo ""
echo "[3/5] Syncing website files to assets..."
if [ -f "sync-assets.sh" ]; then
    ./sync-assets.sh
else
    echo "Sync script not found, copying manually..."
    mkdir -p app/src/main/assets/public
    cp -r ../assets/ ../cre* ../a-propos/ ../convertisseur/ ../guides/ ../index.html ../manifest.webmanifest ../notifications/ ../robots.txt ../sitemap.xml ../vercel.json app/src/main/assets/public/
fi

# Step 4: Build with Gradle
echo ""
echo "[4/5] Building APK with Gradle..."
echo ""

# Check if gradle is available
if command -v gradle &> /dev/null; then
    echo "Using system gradle..."
    gradle assembleDebug
elif [ -f "gradlew" ]; then
    echo "Using project gradlew..."
    chmod +x gradlew
    ./gradlew assembleDebug
else
    echo "✗ Gradle not found!"
    echo ""
    echo "To install Gradle in Termux:"
    echo "  pkg install gradle"
    echo ""
    echo "Or use the included gradlew (should be in this directory)"
    exit 1
fi

# Step 5: Find the APK
echo ""
echo "[5/5] Locating APK..."
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
    echo "✓ APK built successfully!"
    echo ""
    echo "APK location: $APK_PATH"
    echo ""
    echo "To install on your Android device:"
    echo "  adb install $APK_PATH"
    echo ""
    echo "Or transfer the file to your phone and install manually."
else
    echo "✗ APK not found at expected location"
    echo ""
    echo "Please check the build output for errors."
    echo "You can try opening this project in Android Studio for easier debugging."
fi

echo ""
echo "=========================================="
echo "Build process complete!"
echo "=========================================="
