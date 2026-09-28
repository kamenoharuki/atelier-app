import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FanHeader from '../../components/FanHeader';
import { colors, spacing, radius } from '../../constants/theme';

export default function FanTimelineScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FanHeader name="namenamename" life={1} />

      <ScrollView contentContainerStyle={styles.list}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle-outline" size={20} color={colors.textMuted} />
              <Text style={styles.userName}>user name _000000</Text>
            </View>
            <Text style={styles.taskText}>タスク「」を設定しました</Text>
            <View style={styles.actionRow}>
              <Pressable hitSlop={8}>
                <Ionicons name="heart-outline" size={18} color={colors.danger} />
              </Pressable>
              <Pressable hitSlop={8}>
                <Ionicons name="gift-outline" size={18} color={colors.primary} />
              </Pressable>
              <Pressable hitSlop={8}>
                <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 13, fontWeight: '600', color: colors.text },
  taskText: { fontSize: 15, color: colors.text },
  actionRow: { flexDirection: 'row', gap: spacing.lg },
});
