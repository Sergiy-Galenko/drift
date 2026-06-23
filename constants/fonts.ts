import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';

import { F } from './tokens';

export const fontMap = {
  [F.family.displayBlack]: SpaceGrotesk_700Bold,
  [F.family.displayBold]: SpaceGrotesk_700Bold,
  [F.family.bodyRegular]: Inter_400Regular,
  [F.family.bodyMedium]: Inter_500Medium,
  [F.family.bodySemi]: Inter_600SemiBold,
  [F.family.monoMedium]: JetBrainsMono_600SemiBold,
  [F.family.monoBold]: JetBrainsMono_700Bold,
} as const;
