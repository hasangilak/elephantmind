import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardChip } from '@/components/CardChip';
import { AppBar, T } from '@/components/ui';
import { DECK, type SuitKey } from '@/data/cards';
import { useProgress } from '@/state/store';
import { colors, radii } from '@/theme/tokens';

const SUIT_ORDER: { key: SuitKey; name: string }[] = [
  { key: 'spades', name: 'Spades' },
  { key: 'hearts', name: 'Hearts' },
  { key: 'diamonds', name: 'Diamonds' },
  { key: 'clubs', name: 'Clubs' },
];

export default function CardSystemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cardWords = useProgress((s) => s.cardWords);
  const setCardWord = useProgress((s) => s.setCardWord);

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <AppBar title="Card system" subtitle="Your 52 associations" onClose={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      >
        <T s={13} c={colors.ink2} style={{ lineHeight: 19, marginBottom: 18 }}>
          Give each card a vivid word or character — a Person, Action or Object you can weave into a story. Leave one blank to keep its default.
        </T>
        {SUIT_ORDER.map((suit) => (
          <View key={suit.key} style={{ marginBottom: 18 }}>
            <T s={11} w={700} ls={0.8} c={colors.ink3} style={{ marginBottom: 9 }}>
              {suit.name.toUpperCase()}
            </T>
            <View style={{ gap: 8 }}>
              {DECK.filter((c) => c.suit === suit.key).map((card) => (
                <View key={card.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <CardChip card={card} size="sm" />
                  <TextInput
                    value={cardWords[String(card.id)] ?? ''}
                    onChangeText={(t) => setCardWord(card.id, t)}
                    placeholder={card.defaultWord}
                    placeholderTextColor={colors.ink3}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      flex: 1,
                      borderWidth: 1.5,
                      borderColor: colors.line,
                      backgroundColor: colors.card,
                      borderRadius: radii.md,
                      paddingVertical: 11,
                      paddingHorizontal: 14,
                      fontSize: 15,
                      color: colors.ink,
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
