#!/usr/bin/env bash
# Reproduit la configuration Android du Codespace Alpine.
# À lancer depuis la racine du dépôt avec un compte sudo.
set -euo pipefail

sudo apk update
sudo apk add openjdk17 bash curl wget unzip git zip github-cli android-tools

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export ANDROID_HOME=/opt/android-sdk
export ANDROID_SDK_ROOT=/opt/android-sdk
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/35.0.0:$PATH"

if [ ! -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
  tmp=$(mktemp -d)
  wget -q -O "$tmp/tools.zip" https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  sudo mkdir -p "$ANDROID_HOME/cmdline-tools"
  unzip -q "$tmp/tools.zip" -d "$tmp"
  sudo rm -rf "$ANDROID_HOME/cmdline-tools/latest"
  sudo mv "$tmp/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  sudo chown -R "$(id -un):$(id -gn)" "$ANDROID_HOME"
  rm -rf "$tmp"
fi

yes | sdkmanager --licenses >/dev/null || true
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

cd "$(dirname "$0")/../android-app"
[ -x ./gradlew ] || gradle wrapper --gradle-version 8.9
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > local.properties
./gradlew assembleDebug
printf '\nAPK: %s\n' "$PWD/app/build/outputs/apk/debug/app-debug.apk"
