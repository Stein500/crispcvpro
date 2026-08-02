# CrispCV Pro - Application Android Native

Cette application Android utilise une WebView pour afficher le site CrispCV Pro localement, conservant ainsi toutes les fonctionnalités et le design.

## Structure du projet

```
android-native/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/crispcvpro/MainActivity.java
│   │   │   ├── res/
│   │   │   │   ├── layout/activity_main.xml
│   │   │   │   ├── values/
│   │   │   │   │   ├── strings.xml
│   │   │   │   │   ├── colors.xml
│   │   │   │   │   └── styles.xml
│   │   │   │   └── mipmap-*
│   │   │   └── assets/public/  (Contient tous les fichiers du site)
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── gradle.properties
```

## Prérequis pour compiler l'APK

### Sur Android avec Termux :

1. **Installer les dépendances** :
   ```bash
   pkg update && pkg upgrade
   pkg install openjdk-17 git nodejs
   ```

2. **Installer Android SDK** :
   ```bash
   pkg install wget unzip
   wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
   unzip commandlinetools-linux-*.zip -d ~/android-sdk
   export ANDROID_HOME=~/android-sdk
   export PATH=$PATH:~/android-sdk/cmdline-tools/latest/bin
   sdkmanager --install "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```

3. **Compiler l'APK** :
   ```bash
   cd android-native
   ./gradlew assembleDebug
   ```
   L'APK sera générée dans : `app/build/outputs/apk/debug/app-debug.apk`

### Sur PC (Linux/Mac/Windows) :

1. Installer Android Studio
2. Ouvrir le projet `android-native` dans Android Studio
3. Cliquer sur "Build > Build Bundle(s) / APK(s) > Build APK"
4. L'APK sera dans `app/build/outputs/apk/debug/`

### Alternative: Utiliser Capacitor (déjà configuré)

Un projet Capacitor est également disponible dans le dossier `android-app/` :

```bash
cd android-app
npm install
npx cap sync android
npx cap open android
```

Puis compiler avec Android Studio.

## Fonctionnalités

- ✅ Chargement local de tous les fichiers (pas besoin d'internet après installation)
- ✅ JavaScript activé
- ✅ Support du stockage local (localStorage)
- ✅ Gestion des téléchargements
- ✅ Barre de progression
- ✅ Navigation avant/arrière
- ✅ Ouverture des liens externes dans le navigateur
- ✅ Design et fonctionnalités 100% conservés

## Personnalisation

### Changer le nom de l'application
Modifier dans :
- `app/src/main/res/values/strings.xml` (nom affiché)
- `app/build.gradle` (applicationId)
- `AndroidManifest.xml` (package)

### Changer les couleurs
Modifier dans : `app/src/main/res/values/colors.xml`

### Changer l'icône
Remplacer les fichiers dans : `app/src/main/res/mipmap-*`

## Dépannage

### Erreur: Java not found
Installer Java 17 : `pkg install openjdk-17` (Termux) ou télécharger depuis Oracle.

### Erreur: Android SDK not found
Configurer la variable d'environnement ANDROID_HOME et installer le SDK.

### Erreur: Gradle not found
Gradle est inclus avec le projet. Si problème, installer Gradle : `pkg install gradle` (Termux)

### Le site ne s'affiche pas
Vérifier que les fichiers sont bien dans `app/src/main/assets/public/`

## Notes

- Cette application charge le site localement depuis les assets
- Aucune connexion internet n'est requise après installation (sauf pour les fonctionnalités qui en ont besoin comme le partage)
- Toutes les données restent sur l'appareil de l'utilisateur
- L'application supporte le mode sombre/clair du site

## Version

1.0.0 - Application de base avec WebView
