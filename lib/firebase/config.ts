import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, type Auth } from '@firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const requiredEnvFirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim();

const envFirebaseConfig = {
  ...requiredEnvFirebaseConfig,
  ...(measurementId ? { measurementId } : {}),
};

export const isFirebaseConfigured = Object.values(requiredEnvFirebaseConfig).every(
  (value): value is string => typeof value === 'string' && value.trim().length > 0,
);

const firebaseConfig = isFirebaseConfigured
  ? envFirebaseConfig
  : {
      apiKey: 'dev-placeholder-api-key',
      authDomain: 'drift-dev-placeholder.firebaseapp.com',
      projectId: 'drift-dev-placeholder',
      storageBucket: 'drift-dev-placeholder.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:0000000000000000000000',
    };

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

function initFirestore(): Firestore {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    return getFirestore(app);
  }
}

function initAuth(): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const db = initFirestore();
export const auth = initAuth();
export const storage: FirebaseStorage = getStorage(app);
