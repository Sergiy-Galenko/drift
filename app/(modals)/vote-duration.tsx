import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/Button';
import { Colors, F, R, S } from '@/constants/tokens';
import { useDraftStore } from '@/stores/draftStore';
import { VOTING_DURATION_HOURS, type VotingDurationHours } from '@/types/drift';

const DURATION_DETAILS: Record<VotingDurationHours, string> = {
  1: 'Fast decision',
  6: 'Same-day vote',
  24: 'Recommended',
  72: 'Give everyone time',
};

export default function VoteDurationScreen() {
  const router = useRouter();
  const durationHours = useDraftStore((state) => state.durationHours);
  const saveDraft = useDraftStore((state) => state.saveDraft);
  const [selected, setSelected] = useState<VotingDurationHours>(durationHours);

  const confirm = () => {
    saveDraft({ durationHours: selected });
    router.back();
  };

  return (
    <View style={styles.root}>
      <Header title="Voting duration" showBack />
      <View style={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.title}>How long should voting stay open?</Text>
          <Text style={styles.description}>Once your Drift is live, this setting cannot be changed.</Text>
        </View>

        <View style={styles.options}>
          {VOTING_DURATION_HOURS.map((hours) => {
            const isSelected = selected === hours;
            return (
              <Pressable
                key={hours}
                onPress={() => setSelected(hours)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Select ${hours}-hour voting period`}
                style={[styles.option, isSelected ? styles.optionSelected : null]}
              >
                <View>
                  <Text style={[styles.optionTitle, isSelected ? styles.optionTitleSelected : null]}>{hours} hours</Text>
                  <Text style={styles.optionDescription}>{DURATION_DETAILS[hours]}</Text>
                </View>
                <View style={[styles.radio, isSelected ? styles.radioSelected : null]}>
                  {isSelected ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Button label="Confirm duration" onPress={confirm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgBase },
  content: { flex: 1, padding: S.lg, gap: S.xl },
  intro: { gap: S.sm },
  title: { color: Colors.textPrimary, fontFamily: F.family.displayBold, fontSize: F.size.xl },
  description: { color: Colors.textSecondary, fontFamily: F.family.bodyRegular, fontSize: F.size.base, lineHeight: F.size.base * F.lineHeight.normal },
  options: { gap: S.sm },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: S.px, borderColor: Colors.strokeStrong, borderRadius: R.md, backgroundColor: Colors.bgSurface, padding: S.lg },
  optionSelected: { borderColor: Colors.accentVolt, backgroundColor: Colors.bgElevated },
  optionTitle: { color: Colors.textPrimary, fontFamily: F.family.bodySemi, fontSize: F.size.md },
  optionTitleSelected: { color: Colors.accentVolt },
  optionDescription: { color: Colors.textSecondary, fontFamily: F.family.bodyRegular, fontSize: F.size.sm, marginTop: S.xs },
  radio: { width: 22, height: 22, borderWidth: 2, borderColor: Colors.textTertiary, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: Colors.accentVolt },
  radioDot: { width: 10, height: 10, borderRadius: R.pill, backgroundColor: Colors.accentVolt },
});
