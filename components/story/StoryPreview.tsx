import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { StoryRing } from './StoryRing';
import { Avatar } from '@/components/ui/Avatar';
import { Colors, F, S } from '@/constants/tokens';
import type { Drift } from '@/types/drift';

type StoryPreviewProps = {
  drift: Drift;
};

export function StoryPreview({ drift }: StoryPreviewProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/(drift)/[id]', params: { id: drift.id } })}
      style={styles.wrap}
    >
      <StoryRing size={72}>
        <Avatar username={drift.authorUsername} avatarUrl={null} reputationScore={drift.authorReputationScore} size={62} showReputationRing={false} />
      </StoryRing>
      <View style={styles.textWrap}>
        <Text numberOfLines={1} style={styles.username}>
          {drift.authorUsername}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {drift.votesYes + drift.votesNo} votes
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 82,
    alignItems: 'center',
    gap: S.xs,
  },
  textWrap: {
    alignItems: 'center',
    width: '100%',
  },
  username: {
    color: Colors.white,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.xs,
  },
  meta: {
    color: Colors.textTertiary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.micro,
  },
});
