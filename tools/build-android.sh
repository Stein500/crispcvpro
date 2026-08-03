#!/usr/bin/env bash
# Build reproducible depuis un Codespace Alpine déjà configuré.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/android-app"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/35.0.0:$PATH"

command -v java >/dev/null || { echo "Java 17 introuvable. Lance tools/setup-android-codespace.sh"; exit 1; }
[ -d "$ANDROID_HOME" ] || { echo "Android SDK introuvable: $ANDROID_HOME"; exit 1; }
[ -x "$APP/gradlew" ] || { echo "Gradle Wrapper introuvable"; exit 1; }

printf 'sdk.dir=%s\n' "$ANDROID_HOME" > "$APP/local.properties"
cd "$APP"
chmod +x gradlew
./gradlew --no-daemon clean assembleDebug
APK="$APP/app/build/outputs/apk/debug/app-debug.apk"
[ -f "$APK" ] || { echo "APK absente après compilation"; exit 1; }
printf '\nBUILD OK\nAPK: %s\nSIZE: ' "$APK"
du -h "$APK" | cut -f1
