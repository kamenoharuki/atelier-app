import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../constants/theme';

type Props = {
  name: string;
  life: number;
  maxLife?: number;
};

export default function FanHeader({ name, life, maxLife = 3 }: Props) {
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

      <View style={styles.lifeRow}>
        {Array.from({ length: maxLife }).map((_, i) => (
          <Ionicons
            key={i}
            name={i < life ? 'heart' : 'heart-outline'}
            size={18}
            color={colors.danger}
          />
        ))}
      </View>
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
  lifeRow: {
    flexDirection: 'row',
    gap: 4,
  },
});
