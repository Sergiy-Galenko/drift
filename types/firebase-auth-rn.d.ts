import type { Persistence, ReactNativeAsyncStorage } from '@firebase/auth';
import '@firebase/auth';

declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
