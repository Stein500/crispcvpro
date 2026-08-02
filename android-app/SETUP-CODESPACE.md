# Configuration Android du Codespace

Les paquets installés manuellement dans une machine Codespace ne sont pas une sauvegarde durable si le Codespace est supprimé ou reconstruit. La configuration reproductible est conservée dans le dépôt avec `tools/setup-android-codespace.sh`.

Depuis la racine du dépôt :

```bash
chmod +x tools/setup-android-codespace.sh
./tools/setup-android-codespace.sh
```

Le script installe Java 17, les outils Android, le SDK Android 35, le Gradle Wrapper et génère l'APK debug.

## Variables de session

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export ANDROID_HOME=/opt/android-sdk
export ANDROID_SDK_ROOT=/opt/android-sdk
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/35.0.0:$PATH"
```

`local.properties` et les dossiers `build/` sont volontairement ignorés par Git : ils dépendent de la machine et sont recréés automatiquement.
