# 🚀 Quick Start - Créer l'APK en 5 minutes

## Pour les pressés ! ⏰

### Si vous êtes sur **Android avec Termux** :

```bash
# 1. Installer les dépendances
pkg update && pkg upgrade
pkg install openjdk-17 git wget unzip

# 2. Installer Android SDK
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip commandlinetools-linux-*.zip -d ~/android-sdk
echo "export ANDROID_HOME=~/android-sdk" >> ~/.bashrc
echo "export PATH=\$PATH:~/android-sdk/cmdline-tools/latest/bin" >> ~/.bashrc
source ~/.bashrc
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# 3. Compiler l'APK
cd crispcvpro
./BUILD-ANDROID-APK.sh
# Choisir option 1 (Android Native)
# Suivre les instructions

# 4. Installer l'APK
adb install android-native/app/build/outputs/apk/debug/app-debug.apk
```

---

### Si vous êtes sur **PC (Linux/Mac/Windows)** :

1. **Installer Android Studio** : [Télécharger ici](https://developer.android.com/studio)
2. **Ouvrir le projet** :
   - Lancer Android Studio
   - Cliquer sur "Open"
   - Sélectionner `crispcvpro/android-native/`
3. **Compiler** :
   - Attendre la synchronisation Gradle
   - Cliquer sur "Build > Build APK"
4. **Installer** :
   - L'APK sera dans `app/build/outputs/apk/debug/`
   - Copier sur votre téléphone et installer

---

## Commandes utiles

| Action | Commande |
|--------|----------|
| Synchroniser les fichiers du site | `cd android-native && ./sync-assets.sh` |
| Générer les icônes | `cd android-native && ./generate-icons.sh` |
| Compiler l'APK | `cd android-native && ./build-apk.sh` |
| Compiler avec Gradle | `cd android-native && ./gradlew assembleDebug` |
| Installer l'APK | `adb install android-native/app/build/outputs/apk/debug/app-debug.apk` |
| Voir les logs | `adb logcat` |

---

## 📁 Structure importante

```
crispcvpro/
├── android-native/          # 🎯 Projet Android (recommandé)
│   └── app/src/main/assets/public/  # 📁 Fichiers du site
├── android-app/            # Projet Capacitor (alternative)
├── BUILD-ANDROID-APK.sh    # 🚀 Script principal
├── ANDROID-APK-GUIDE.md    # 📖 Guide complet
└── QUICK-START.md          # Ce fichier
```

---

## ❓ Questions fréquentes

**Q: Quelle méthode choisir ?**
**R:** Android Native (dossier `android-native/`) - plus simple et plus rapide.

**Q: L'APK fonctionnera-t-elle sans internet ?**
**R:** Oui ! Tous les fichiers sont inclus dans l'APK.

**Q: Les fonctionnalités du site seront-elles toutes présentes ?**
**R:** Oui ! 100% des fonctionnalités et du design sont conservés.

**Q: Puis-je personnaliser l'application ?**
**R:** Oui ! Modifiez les fichiers dans `android-native/` (nom, icône, couleurs, etc.)

**Q: Quelle est la taille de l'APK ?**
**R:** Environ 10-20 Mo selon les assets du site.

---

## 🎯 Recommandation

**Utilisez la méthode Android Native** (`android-native/`) - c'est la plus simple et la plus efficace pour votre cas d'usage.

---

**À vous de jouer !** 🎉
