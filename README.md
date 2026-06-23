# DRIFT

DRIFT is an Expo / React Native social commitment app. Users post real-life decisions, strangers vote, and the author has to execute the result with proof.

## Setup

1. Install dependencies.

   ```sh
   npm install
   ```

2. Create a Firebase project with Firestore, Storage, and Email/Password Auth enabled.

3. Copy `.env.example` to `.env` and fill all `EXPO_PUBLIC_FIREBASE_*` values.

4. Deploy rules.

   ```sh
   firebase deploy --only firestore:rules,storage
   ```

5. Start Expo.

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
