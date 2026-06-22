import { getApp, getApps, initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every((value) => value.length > 0);
export const isMockBackend = !isFirebaseConfigured;

export function assertFirebaseConfigured(): void {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase environment variables are missing. Copy .env.example to .env and fill every Firebase value.');
  }
}

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
export const storage: FirebaseStorage | null = firebaseApp ? getStorage(firebaseApp) : null;

export function getDb(): Firestore {
  assertFirebaseConfigured();

  if (!db) {
    throw new Error('Firestore is not available in mock mode.');
  }

  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  assertFirebaseConfigured();

  if (!storage) {
    throw new Error('Firebase Storage is not available in mock mode.');
  }

  return storage;
}
