import * as Haptics from 'expo-haptics';

import { useAuthStore } from '@/stores/authStore';
import { logger } from './logger';

export async function impactLight(): Promise<void> {
  if (!useAuthStore.getState().profile?.settings.vibrationEnabled) {
    return;
  }

  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    logger.warn('Haptic impact failed', { error: String(error) });
  }
}

export async function impactHeavy(): Promise<void> {
  if (!useAuthStore.getState().profile?.settings.vibrationEnabled) {
    return;
  }

  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    logger.warn('Haptic impact failed', { error: String(error) });
  }
}

export async function notifySuccess(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    logger.warn('Haptic notification failed', { error: String(error) });
  }
}

export async function notifyWarning(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    logger.warn('Haptic notification failed', { error: String(error) });
  }
}
