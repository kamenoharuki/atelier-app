import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ArtistHeader, { ArtistStatus } from '../../components/ArtistHeader';
import { colors, spacing, radius } from '../../constants/theme';

type Tag = 'TODO' | '悩み';

type TimelineItem = {
  id: string;
  tag: Tag;
  text: string;
  giftCount: number;
  done: boolean;
};

const initialItems: TimelineItem[] = [
  { id: '1', tag: 'TODO', text: '背景のラフを描く', giftCount: 4, done: false },
  { id: '2', tag: '悩み', text: '配色の方向性で迷っている', giftCount: 7, done: false },
  { id: '3', tag: 'TODO', text: '線画を清書する', giftCount: 2, done: true },
];

export default function ArtistHomeScreen() {
  const [status, setStatus] = useState<ArtistStatus>('制作中');
  const [mood, setMood] = useState('');
  const [moodDraft, setMoodDraft] = useState('');
  const [items, setItems] = useState<TimelineItem[]>(initialItems);
  const [newTag, setNewTag] = useState<Tag>('TODO');
  const [newText, setNewText] = useState('');

  const postMood = () => {
    if (!moodDraft.trim()) return;
    setMood(moodDraft.trim());
    setMoodDraft('');
  };

  const addItem = () => {
    if (!newText.trim()) return;
    setItems((prev) => [
      { id: Date.now().toString(), tag: newTag, text: newText.trim(), giftCount: 0, done: false },
      ...prev,
    ]);
    setNewText('');
  };

  const toggleDone = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const sortedItems = [...items].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ArtistHeader name="namenamename" status={status} onChangeStatus={setStatus} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={12}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1行のつぶやき入力 */}
          <View style={styles.moodCard}>
            {mood ? <Text style={styles.moodText}>「{mood}」</Text> : null}
            <View style={styles.moodInputRow}>
              <TextInput
                style={styles.moodInput}
                placeholder="いま何してる？"
                placeholderTextColor={colors.textMuted}
                value={moodDraft}
                onChangeText={setMoodDraft}
                onSubmitEditing={postMood}
                returnKeyType="send"
              />
              <Pressable style={styles.moodSendButton} onPress={postMood} hitSlop={8}>
                <Ionicons name="paper-plane-outline" size={18} color={colors.surface} />
              </Pressable>
            </View>
          </View>

          {/* タグ + 新規追加 */}
          <View style={styles.addCard}>
            <View style={styles.tagSwitch}>
              {(['TODO', '悩み'] as Tag[]).map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => setNewTag(tag)}
                  style={[styles.tagOption, newTag === tag && styles.tagOptionActive]}
                >
                  <Text style={[styles.tagOptionText, newTag === tag && styles.tagOptionTextActive]}>
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.addInputRow}>
              <TextInput
                style={styles.addInput}
                placeholder={newTag === 'TODO' ? '新しいタスクを追加' : '悩みを共有する'}
                placeholderTextColor={colors.textMuted}
                value={newText}
                onChangeText={setNewText}
                onSubmitEditing={addItem}
                returnKeyType="done"
              />
              <Pressable style={styles.addButton} onPress={addItem} hitSlop={8}>
                <Ionicons name="add" size={20} color={colors.surface} />
              </Pressable>
            </View>
          </View>

          {/* TODOタイムライン */}
          <Text style={styles.sectionLabel}>タイムライン</Text>
          <View style={styles.timeline}>
            {sortedItems.map((item) => (
              <View key={item.id} style={[styles.itemCard, item.done && styles.itemCardDone]}>
                {item.tag === 'TODO' ? (
                  <Pressable
                    onPress={() => toggleDone(item.id)}
                    style={[styles.checkCircle, item.done && styles.checkCircleDone]}
                    hitSlop={8}
                  >
                    {item.done && <Ionicons name="checkmark" size={14} color={colors.surface} />}
                  </Pressable>
                ) : (
                  <View style={styles.worryDot} />
                )}

                <View style={styles.itemBody}>
                  <View style={styles.itemTagRow}>
                    <Text
                      style={[
                        styles.itemTag,
                        item.tag === '悩み' && styles.itemTagWorry,
                      ]}
                    >
                      {item.tag}
                    </Text>
                  </View>
                  <Text style={[styles.itemText, item.done && styles.itemTextDone]}>
                    {item.text}
                  </Text>
                </View>

                <View style={styles.giftBadge}>
                  <Ionicons name="gift-outline" size={14} color={colors.primary} />
                  <Text style={styles.giftCount}>{item.giftCount}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  moodCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  moodText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  moodInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moodInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 4,
  },
  moodSendButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  tagSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
    alignSelf: 'flex-start',
  },
  tagOption: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  tagOptionActive: {
    backgroundColor: colors.text,
  },
  tagOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tagOptionTextActive: {
    color: colors.surface,
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 6,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: 2,
  },
  timeline: {
    gap: spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  itemCardDone: {
    opacity: 0.55,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: colors.primary,
  },
  worryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginHorizontal: 7,
  },
  itemBody: {
    flex: 1,
    gap: 3,
  },
  itemTagRow: {
    flexDirection: 'row',
  },
  itemTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  itemTagWorry: {
    color: colors.accent,
  },
  itemText: {
    fontSize: 15,
    color: colors.text,
  },
  itemTextDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  giftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  giftCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
