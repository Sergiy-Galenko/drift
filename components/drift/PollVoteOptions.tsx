import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors, F, R, S } from '@/constants/tokens';
import type { Drift, PollVote } from '@/types/drift';

type PollVoteOptionsProps = {
  drift: Drift;
  currentVote: PollVote | null;
  canVote: boolean;
  loading: boolean;
  onVote: (vote: PollVote) => void;
};

export function PollVoteOptions({ drift, currentVote, canVote, loading, onVote }: PollVoteOptionsProps) {
  const rankingPoll = drift.pollType === 'ranking';
  const [ranking, setRanking] = useState<string[]>(Array.isArray(currentVote) ? currentVote : []);

  useEffect(() => {
    if (Array.isArray(currentVote)) setRanking(currentVote);
  }, [currentVote]);

  const toggleRanking = (optionId: string) => {
    if (!canVote || loading) return;
    setRanking((current) => current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>
        {rankingPoll ? 'TAP OPTIONS IN RANK ORDER' : drift.pollType === 'plan' ? 'CHOOSE A PLAN' : 'CHOOSE ONE OPTION'}
      </Text>
      {drift.pollOptions?.map((option) => {
        const rank = ranking.indexOf(option.id);
        const selected = rankingPoll ? rank >= 0 : currentVote === option.id;
        return (
          <Pressable
            key={option.id}
            accessibilityRole={rankingPoll ? 'button' : 'radio'}
            accessibilityState={{ selected }}
            disabled={!canVote || loading}
            onPress={() => rankingPoll ? toggleRanking(option.id) : onVote(option.id)}
            style={[styles.option, selected ? styles.selected : null, (!canVote || loading) ? styles.disabled : null]}
          >
            <Text style={[styles.optionText, selected ? styles.selectedText : null]}>{option.label}</Text>
            {rankingPoll ? <Text style={styles.rank}>{rank >= 0 ? rank + 1 : '—'}</Text> : null}
          </Pressable>
        );
      })}
      {rankingPoll ? (
        <Button
          label={Array.isArray(currentVote) ? 'Update ranking' : 'Submit ranking'}
          variant="secondary"
          disabled={!canVote || loading || ranking.length !== (drift.pollOptions?.length ?? 0)}
          loading={loading}
          onPress={() => onVote(ranking)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: S.sm },
  heading: { color: Colors.textSecondary, fontFamily: F.family.monoBold, fontSize: F.size.xs },
  option: { minHeight: 48, borderRadius: R.md, borderWidth: S.px, borderColor: Colors.strokeStrong, backgroundColor: Colors.bgInteractive, paddingHorizontal: S.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: S.md },
  selected: { borderColor: Colors.accentVolt, backgroundColor: Colors.bgElevated },
  disabled: { opacity: 0.5 },
  optionText: { flex: 1, color: Colors.textPrimary, fontFamily: F.family.bodySemi, fontSize: F.size.sm },
  selectedText: { color: Colors.accentVolt },
  rank: { color: Colors.accentVolt, fontFamily: F.family.monoBold, fontSize: F.size.base },
});
