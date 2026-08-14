# DRIFT

DRIFT is an Expo / React Native social commitment app. Users post real-life decisions, strangers vote, and the author has to execute the result with proof.

## Setup

1. Install dependencies.

   ```sh
   npm install
   ```

2. Create a Firebase project with Firestore, Storage, and Email/Password Auth enabled.

3. Copy `.env.example` to `.env` and fill all `EXPO_PUBLIC_FIREBASE_*` values.

4. Deploy rules and indexes.

   ```sh
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

5. Configure observability by adding `EXPO_PUBLIC_SENTRY_DSN` to `.env`. Errors are sent to Sentry in production; product events are stored through the authenticated `trackAnalytics` Function without private Drift text.

6. Enable push notifications: run `npx eas init` once to add the EAS project ID to `app.json`, configure FCM V1 (Android) and APNs (iOS) credentials in EAS, then deploy the Functions.

   ```sh
   firebase deploy --only functions
   ```

   Push notifications require an Android/iOS development or production build; Expo Go does not support remote push on SDK 54.

7. Start Expo.

   ```sh
   npx expo start
   ```

## Architecture

- `app/` contains Expo Router screens and layouts.
- `components/` contains pure UI.
- `hooks/` owns subscriptions, mutations, and derived UI behavior.
- `lib/firebase/` owns Firebase Auth, Firestore, and Storage operations.
- `stores/` contains Zustand global state.
- `types/` contains Firestore document contracts.

## Firebase Notes

Firestore persistence is initialized through the Firebase JS SDK. Proof media uploads to Storage under `proofs/{driftId}`. Avatars are allowed under `avatars/{uid}` for future profile media support.

## Quality and release workflow

Run the full local reliability suite before a release:

```sh
npm run typecheck
npm run lint
npm run test:unit
npm run test:rules # requires JDK 21+
```

`npm run test:rules` starts the Firestore Emulator and verifies that authors can edit their own Drifts while other users cannot alter proofs, status, retention data, or notifications.

For the mobile flows, start the emulators and make a development build with `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true` and `EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=<your-LAN-IP>`; a physical device cannot use `127.0.0.1` to reach your computer.

```sh
npm run emulators
npm run build:development
maestro test e2e/maestro
```

The Maestro flows cover registration, creating a Drift, voting, and uploading proof. The proof flow expects a preloaded media fixture because Android and iOS own the media-picker UI.

EAS has three committed profiles in `eas.json`:

- `npm run build:development` — installable dev client for device/emulator testing.
- `npm run build:preview` — internal stakeholder build.
- `npm run build:production` — store-ready Android AAB and iOS archive.

Before the first production build, run `npx eas login` and `npx eas init`, then provide the Apple Developer and Google Play credentials when EAS requests them. Production push requires APNs and FCM V1 credentials in EAS.
