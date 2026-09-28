import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FanHeader from '../../components/FanHeader';
import { colors, spacing, radius } from '../../constants/theme';

export default function FanSettingsScreen() {
  const [keyPass, setKeyPass] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <FanHeader name="namenamename" life={1} />
        <Pressable onPress={() => router.replace('/')} style={styles.logoutButton}>
          <Text style={styles.logout}>ログアウト</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>アカウントパスワード</Text>
        <Text style={styles.secretDots}>●●●●●●●●●●●●</Text>

        <Text style={styles.label}>
          key-password <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="password"
          placeholderTextColor={colors.textMuted}
          value={keyPass}
          onChangeText={setKeyPass}
          secureTextEntry
        />
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>パスワードを変更する</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoutButton: { paddingHorizontal: spacing.sm },
  logout: { fontSize: 14, color: colors.danger, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  secretDots: { fontSize: 16, color: colors.text, letterSpacing: 2, marginBottom: spacing.xs },
  label: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm },
  required: { color: colors.danger },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  button: {
    marginTop: spacing.sm,
    paddingVertical: 12,
    borderRadius: radius.pill,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: { fontSize: 14, fontWeight: '600', color: colors.text },
});
