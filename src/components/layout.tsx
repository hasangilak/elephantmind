/**
 * Screen layout helpers shared by the tab pages.
 */
import React from 'react';
import { ScrollView, type ScrollViewProps, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { T } from '@/components/ui';
import { colors } from '@/theme/tokens';

export interface ScreenProps extends ScrollViewProps {
  /** extra padding applied to the scroll content */
  contentStyle?: ViewStyle;
  children: React.ReactNode;
}

/** Paper-backed scrollable screen that respects the top safe-area inset. */
export function Screen({ children, contentStyle, ...rest }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.paper }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        { paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 28 },
        contentStyle,
      ]}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

export interface PageHeaderProps {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}

/** Eyebrow + big title with an optional right-aligned chip (Review/Stats/Roadmap). */
export function PageHeader({ eyebrow, title, right }: PageHeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}
    >
      <View>
        <T s={13} w={500} c={colors.ink3}>
          {eyebrow}
        </T>
        <T s={25} w={800} ls={-0.6} style={{ marginTop: 2 }}>
          {title}
        </T>
      </View>
      {right}
    </View>
  );
}
