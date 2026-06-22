# DRIFT

DRIFT is an Expo React Native app for posting real-life decisions, letting strangers vote, and committing publicly to the result.

## Stack

- Expo SDK 56, Expo Router, React Native, TypeScript strict
- Firebase Auth, Firestore realtime listeners, Firebase Storage
- Zustand, NativeWind, React Hook Form, Zod, Reanimated
- Expo Image Picker, Expo AV, Expo Font, Expo Haptics

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in Firebase and Google OAuth values.

3. Deploy Firebase rules:

   ```sh
   firebase deploy --only firestore:rules,storage
   ```

4. Start Expo:

   ```sh
   npm run start
   ```

## Firebase

Create a Firebase project with:

- Anonymous auth enabled
- Google auth enabled
- Firestore database
- Storage bucket

The app reads config from `EXPO_PUBLIC_FIREBASE_*` variables. Google sign-in uses Expo AuthSession and requires platform client IDs in `.env`.

## Notes

- Screens are thin route files under `app/`.
- Firebase access is isolated under `src/lib/firebase/`.
- Realtime data uses Firestore `onSnapshot`.
- The DRIFT countdown ring updates every second and changes to fire red under one hour.
