#!/bin/bash

# Main script to build Android APK for CrispCV Pro
# This script guides you through the entire process

echo "============================================================"
echo "  CrispCV Pro - Android APK Builder"
echo "============================================================"
echo ""
echo "This script will help you create an Android APK from the website."
echo "All features and design will be preserved."
echo ""

# Check if we're in the right directory
if [ ! -d "android-native" ] || [ ! -d "android-app" ]; then
    echo "ERROR: Please run this script from the crispcvpro directory"
    echo "Usage: cd crispcvpro && ./BUILD-ANDROID-APK.sh"
    exit 1
fi

echo "Current directory: $(pwd)"
echo ""

# Show options
PS3="Choose a build method: "
options=(
    "Android Native (Recommended - Simple WebView app)"
    "Capacitor (Alternative - Hybrid app framework)"
    "Exit"
)

select opt in "${options[@]}"; do
    case $opt in
        "Android Native (Recommended - Simple WebView app)")
            echo ""
            echo "You selected: Android Native method"
            echo ""
            cd android-native
            chmod +x build-apk.sh
            ./build-apk.sh
            break
            ;;
        "Capacitor (Alternative - Hybrid app framework)")
            echo ""
            echo "You selected: Capacitor method"
            echo ""
            echo "Please note: Capacitor requires Node.js and additional setup."
            echo ""
            cd android-app
            echo "Installing dependencies..."
            npm install
            echo ""
            echo "Adding Android platform..."
            npx cap sync android
            echo ""
            echo "Capacitor project is ready!"
            echo ""
            echo "Next steps:"
            echo "1. Open the android/ folder in Android Studio"
            echo "2. Or run: npx cap open android"
            echo "3. Build the APK in Android Studio"
            break
            ;;
        "Exit")
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid option. Please try again."
            ;;
    esac
done

echo ""
echo "============================================================"
echo "  Build process initiated!"
echo "  Follow the instructions above to complete the build."
echo "============================================================"
