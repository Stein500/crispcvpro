# CrispCV Android — version native

Première base native Kotlin + Jetpack Compose. Elle fonctionne hors connexion et ne demande aucun compte.

## Depuis Android / Termux

Termux sert très bien à éditer, versionner et lancer les commandes Gradle. Pour compiler, il faut un JDK 17 et le SDK Android :

```bash
pkg update
pkg install git openjdk-17
cd android-app
# lorsque le wrapper Gradle sera ajouté :
./gradlew assembleDebug
```

Le fichier APK sera dans `app/build/outputs/apk/debug/`.

## Depuis GitHub Codespaces

Codespaces sert très bien à coder et compiler avec Java 17. Il ne remplace pas un téléphone Android pour tester l'interface. Pour installer l'APK sur le téléphone : télécharger l'APK puis l'ouvrir, ou utiliser ADB avec un appareil connecté.

## Règles du projet

- Android natif, pas de WebView.
- Kotlin + Jetpack Compose + Material 3.
- Données locales uniquement.
- Pas de compte ni de service payant obligatoire.
- Les prochaines étapes sont Room, éditeur complet, modèles et export PDF natif.
