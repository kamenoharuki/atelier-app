import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../constants/theme';

export type ArtistStatus = '制作中' | '休憩中' | '退室中';

const STATUS_ORDER: ArtistStatus[] = ['制作中', '休憩中', '退室中'];

const STATUS_STYLE: Record<ArtistStatus, { bg: string; fg: string; dot: string }> = {
  制作中: { bg: colors.primaryMuted, fg: colors.primary, dot: colors.primary },
  休憩中: { bg: '#EFEDE6', fg: colors.textMuted, dot: colors.textMuted },
  退室中: { bg: '#EFE3E0', fg: colors.danger, dot: colors.danger },
};

type Props = {
  name: string;
  status: ArtistStatus;
  onChangeStatus: (status: ArtistStatus) => void;
};

export default function ArtistHeader({ name, status, onChangeStatus }: Props) {
  const style = STATUS_STYLE[status];

  const cycleStatus = () => {
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length];
    onChangeStatus(next);
  };

  return (
    <View style={styles.row}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={22} color={colors.textMuted} />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>

      <Pressable
        onPress={cycleStatus}
        style={[styles.statusPill, { backgroundColor: style.bg }]}
        hitSlop={8}
      >
        <View style={[styles.dot, { backgroundColor: style.dot }]} />
        <Text style={[styles.statusText, { color: style.fg }]}>{status}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
