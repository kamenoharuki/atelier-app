import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FanHeader from '../../components/FanHeader';
import { colors, spacing, radius } from '../../constants/theme';

type SubTab = 'お知らせ' | 'ランキング';

export default function FanCreditScreen() {
  const [subTab, setSubTab] = useState<SubTab>('お知らせ');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FanHeader name="namenamename" life={1} />

      <View style={styles.segmented}>
        {(['お知らせ', 'ランキング'] as SubTab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.segment, subTab === tab && styles.segmentActive]}
            onPress={() => setSubTab(tab)}
          >
            <Text style={[styles.segmentText, subTab === tab && styles.segmentTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {subTab === 'お知らせ'
          ? Array.from({ length: 6 }).map((_, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.rowText}>○○さんのタスク「」にギフトを送りました</Text>
              </View>
            ))
          : Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={styles.rankRow}>
                <Text style={styles.rankIndex}>{i + 1}</Text>
                <Text style={styles.rowText}>○○さん</Text>
                <Text style={styles.rankCount}>○○回</Text>
              </View>
            ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  segment: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.primaryMuted },
  segmentText: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  segmentTextActive: { color: colors.primary },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  rowText: { fontSize: 14, color: colors.text },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  rankIndex: { fontWeight: '700', color: colors.primary, width: 20 },
  rankCount: { marginLeft: 'auto', color: colors.textMuted, fontSize: 13 },
});
