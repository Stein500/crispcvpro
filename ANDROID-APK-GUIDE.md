# Guide pour créer l'APK de CrispCV Pro

Ce guide vous explique comment transformer le site CrispCV Pro en application Android (APK) tout en conservant toutes les fonctionnalités et le design.

## 📁 Structure des dossiers

Deux méthodes sont disponibles pour créer l'APK :

```
crispcvpro/
├── android-native/      # Méthode 1: Projet Android natif avec WebView (recommandé)
└── android-app/          # Méthode 2: Projet Capacitor (alternative)
```

## 🚀 Méthode 1: Projet Android Natif (Recommandé)

Le dossier `android-native/` contient un projet Android complet qui utilise une WebView pour afficher votre site localement.

### Avantages :
- ✅ Pas besoin de connexion internet après installation
- ✅ Toutes les fonctionnalités conservées
- ✅ Design identique au site web
- ✅ Support du stockage local (localStorage)
- ✅ Gestion des téléchargements
- ✅ Navigation fluide

### Prérequis

#### Sur Android avec Termux :

1. **Installer Termux** depuis F-Droid (recommandé) ou Google Play
2. **Mettre à jour les packages** :
   ```bash
   pkg update && pkg upgrade
   ```
3. **Installer les dépendances** :
   ```bash
   pkg install openjdk-17 git wget unzip
   ```

4. **Installer Android SDK** :
   ```bash
   # Télécharger les outils de ligne de commande Android
   wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
   unzip commandlinetools-linux-*.zip -d ~/android-sdk
   
   # Configurer les variables d'environnement
   echo "export ANDROID_HOME=~/android-sdk" >> ~/.bashrc
   echo "export PATH=\$PATH:~/android-sdk/cmdline-tools/latest/bin" >> ~/.bashrc
   source ~/.bashrc
   
   # Accepter les licences
   yes | sdkmanager --licenses
   
   # Installer les packages nécessaires
   sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```

#### Sur PC (Linux/Mac/Windows) :

1. Installer [Android Studio](https://developer.android.com/studio)
2. Ou installer manuellement :
   - Java JDK 17+
   - Android SDK
   - Gradle 8.1+

### Compilation de l'APK

#### Avec Termux :

```bash
cd crispcvpro/android-native
chmod +x gradlew build-apk.sh
./build-apk.sh
```

Suivez les instructions à l'écran. Si tout se passe bien, l'APK sera générée dans :
```
app/build/outputs/apk/debug/app-debug.apk
```

#### Avec Android Studio :

1. Ouvrir Android Studio
2. Cliquer sur "Open" et sélectionner le dossier `android-native/`
3. Attendre que Gradle synchronise
4. Cliquer sur "Build > Build Bundle(s) / APK(s) > Build APK"
5. L'APK sera dans `app/build/outputs/apk/debug/`

#### En ligne de commande (PC) :

```bash
cd crispcvpro/android-native
./gradlew assembleDebug
```

### Installation de l'APK

#### Méthode 1: Avec ADB (recommandé)

```bash
# Connecter votre téléphone
adb devices

# Installer l'APK
adb install app/build/outputs/apk/debug/app-debug.apk
```

#### Méthode 2: Transfert manuel

1. Copier le fichier `app-debug.apk` sur votre téléphone
2. Ouvrir le fichier avec un gestionnaire de fichiers
3. Autoriser l'installation d'applications de sources inconnues
4. Installer l'APK

## 🔄 Méthode 2: Capacitor (Alternative)

Le dossier `android-app/` contient un projet configuré avec Capacitor.

### Prérequis

```bash
# Installer Node.js (déjà installé dans cet environnement)
npm install -g @capacitor/cli
```

### Compilation

```bash
cd crispcvpro/android-app
npm install
npx cap sync android
npx cap open android
```

Cela ouvrira le projet dans Android Studio. Ensuite, compilez normalement.

### Avantages Capacitor :
- ✅ Framework moderne pour les apps hybrides
- ✅ Meilleure intégration avec les fonctionnalités natives
- ✅ Communauté active

### Inconvénients :
- ⚠️ Nécessite plus de dépendances
- ⚠️ Configuration plus complexe

## 📋 Vérification avant compilation

Avant de compiler, assurez-vous que :

1. **Tous les fichiers du site sont dans les assets** :
   ```bash
   cd android-native
   ./sync-assets.sh
   ```

2. **Les icônes sont configurées** :
   - Remplacer les fichiers dans `app/src/main/res/mipmap-*` avec vos propres icônes
   - Format recommandé : PNG, tailles multiples (48x48, 72x72, 96x96, 144x144, 192x192)

3. **Le nom et l'ID de l'application** :
   - Modifier dans `app/build.gradle` (applicationId)
   - Modifier dans `app/src/main/res/values/strings.xml` (app_name)
   - Modifier dans `AndroidManifest.xml` (package)

## 🎨 Personnalisation

### Changer le nom de l'application

Modifier dans `android-native/app/src/main/res/values/strings.xml` :
```xml
<string name="app_name">CrispCV Pro</string>
```

### Changer les couleurs

Modifier dans `android-native/app/src/main/res/values/colors.xml` :
```xml
<color name="colorPrimary">#B23A2E</color>
<color name="colorPrimaryDark">#8A2B22</color>
<color name="colorAccent">#B23A2E</color>
<color name="windowBackground">#FAFAF8</color>
```

### Changer l'icône

Remplacer les fichiers dans :
- `android-native/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android-native/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `android-native/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android-native/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android-native/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

Vous pouvez générer des icônes Android à partir de votre logo avec :
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [App Icon Generator](https://appicon.co/)

### Modifier le comportement de la WebView

Modifier dans `android-native/app/src/main/java/com/crispcvpro/MainActivity.java` :
- Activer/désactiver JavaScript
- Configurer les permissions
- Personnaliser la gestion des liens externes

## 🔧 Dépannage

### Erreur: "Java not found"

**Solution** : Installer Java JDK 17+

```bash
# Termux
pkg install openjdk-17

# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Mac
brew install openjdk@17
```

### Erreur: "Android SDK not found"

**Solution** : Installer Android SDK et configurer ANDROID_HOME

Voir les instructions ci-dessus pour l'installation du SDK.

### Erreur: "Gradle not found"

**Solution** : Utiliser le wrapper Gradle inclus

```bash
cd android-native
chmod +x gradlew
./gradlew assembleDebug
```

### Le site ne s'affiche pas dans l'application

**Solution** : Vérifier que les fichiers sont bien copiés dans les assets

```bash
cd android-native
ls -la app/src/main/assets/public/index.html
```

Si le fichier n'existe pas, exécutez :
```bash
./sync-assets.sh
```

### L'application plante au démarrage

**Vérifications** :
1. Vérifiez que `index.html` existe dans les assets
2. Vérifiez que JavaScript est activé dans la WebView (il l'est par défaut)
3. Consultez les logs avec :
   ```bash
   adb logcat
   ```

### Problème de permissions

**Solution** : Ajouter les permissions dans `AndroidManifest.xml`

Les permissions suivantes sont déjà ajoutées :
- INTERNET (pour les fonctionnalités en ligne)
- ACCESS_NETWORK_STATE
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE

## 📱 Fonctionnalités de l'application

L'application Android inclut :

- ✅ **Chargement local** : Le site est chargé depuis les assets, pas besoin d'internet
- ✅ **JavaScript activé** : Toutes les fonctionnalités interactives fonctionnent
- ✅ **Stockage local** : localStorage et sessionStorage sont supportés
- ✅ **Téléchargements** : Gestion des téléchargements de fichiers
- ✅ **Barre de progression** : Indicateurs de chargement
- ✅ **Navigation** : Bouton retour fonctionnel
- ✅ **Liens externes** : Ouverture dans le navigateur par défaut
- ✅ **Mode sombre/clair** : Respecte les préférences du système
- ✅ **Responsive design** : Adapté à tous les écrans

## 🔄 Mise à jour du contenu

Après avoir modifié le site web, exécutez :

```bash
cd android-native
./sync-assets.sh
```

Cela copiera automatiquement tous les fichiers modifiés vers les assets Android.

## 📊 Comparaison des méthodes

| Critère | Android Natif | Capacitor |
|---------|--------------|-----------|
| Facilité | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Fonctionnalités | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Taille APK | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Dépendances | Minimales | Nombreuses |
| Recommandé | ✅ Oui | ⚠️ Alternative |

## 🎯 Recommandation

Pour un utilisateur Termux sur Android, nous recommandons :

1. **Utiliser la méthode Android Native** (`android-native/`)
2. **Suivre les instructions** dans ce guide
3. **Compiler avec Termux** si vous avez assez d'espace de stockage
4. **Sinon, utiliser un PC** avec Android Studio pour compiler plus facilement

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs d'erreur
2. Consultez le dépannage ci-dessus
3. Assurez-vous que toutes les dépendances sont installées
4. Essayez de compiler sur un PC si Termux pose problème

## 📝 Notes importantes

- L'APK générée est une **version debug** (non optimisée)
- Pour une version production, utilisez `assembleRelease` et signez l'APK
- La taille de l'APK sera d'environ 10-20 Mo (selon les assets)
- Toutes les données restent sur l'appareil de l'utilisateur
- Aucune connexion internet n'est requise pour utiliser l'application

## 🔐 Sécurité

- L'application n'a pas accès à internet sauf si explicitement autorisé
- Tous les fichiers sont locaux
- Aucune donnée n'est envoyée à des serveurs externes
- Les permissions sont minimales et nécessaires

---

**Bonne compilation !** 🎉

Si vous avez des questions, n'hésitez pas à demander.
