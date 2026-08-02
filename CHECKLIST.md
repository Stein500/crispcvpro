# ✅ Checklist avant compilation

Utilisez cette checklist pour vérifier que tout est prêt avant de compiler l'APK.

## 📁 Vérification des fichiers

- [ ] Le dossier `android-native/` existe
- [ ] Le dossier `android-app/` existe (Capacitor)
- [ ] Le fichier `BUILD-ANDROID-APK.sh` existe
- [ ] Le fichier `ANDROID-APK-GUIDE.md` existe

## 🌐 Vérification du site web

- [ ] Tous les fichiers du site sont dans `android-native/app/src/main/assets/public/`
  - `index.html` ✓
  - `assets/` ✓
  - `creer-mon-cv/` ✓
  - `convertisseur/` ✓
  - `guides/` ✓
  - `a-propos/` ✓
  - `notifications/` ✓
  - `confidentialite/` ✓

## 🎨 Vérification des icônes

- [ ] Les icônes sont dans `android-native/app/src/main/res/mipmap-*/`
  - `ic_launcher.png` (48x48) - mdpi
  - `ic_launcher.png` (72x72) - hdpi
  - `ic_launcher.png` (96x96) - xhdpi
  - `ic_launcher.png` (144x144) - xxhdpi
  - `ic_launcher.png` (192x192) - xxxhdpi

## 📝 Vérification de la configuration

- [ ] `android-native/app/src/main/res/values/strings.xml` contient le bon nom
- [ ] `android-native/app/build.gradle` contient le bon applicationId
- [ ] `android-native/AndroidManifest.xml` contient le bon package
- [ ] Les couleurs dans `colors.xml` correspondent au design du site

## 🛠 Vérification des outils (pour Termux)

- [ ] Java est installé (`java -version`)
- [ ] Android SDK est installé (`sdkmanager --list`)
- [ ] ANDROID_HOME est configuré
- [ ] Gradle est disponible (`./gradlew -v`)

## 🚀 Étapes de compilation

1. [ ] Exécuter `./BUILD-ANDROID-APK.sh` à la racine du projet
2. [ ] Choisir la méthode (Android Native recommandé)
3. [ ] Suivre les instructions
4. [ ] Récupérer l'APK dans `android-native/app/build/outputs/apk/debug/`
5. [ ] Installer l'APK sur l'appareil

## ✅ Vérification finale

- [ ] L'APK s'installe sans erreur
- [ ] L'application s'ouvre correctement
- [ ] Le site s'affiche complètement
- [ ] Toutes les fonctionnalités fonctionnent
- [ ] Le design est identique au site web
- [ ] La navigation fonctionne (bouton retour, liens)

## 🔧 Dépannage rapide

Si quelque chose ne fonctionne pas :

1. **Vérifiez les logs** : `adb logcat`
2. **Vérifiez les permissions** : `ls -la` sur les fichiers
3. **Vérifiez l'espace disque** : `df -h`
4. **Vérifiez Java** : `java -version`
5. **Vérifiez Android SDK** : `sdkmanager --list`

## 📞 Aide

Si vous avez des problèmes, consultez :
- `ANDROID-APK-GUIDE.md` - Guide complet
- `android-native/README.md` - Documentation spécifique
- Les commentaires dans les fichiers de code

---

**Bonne chance !** 🎉
