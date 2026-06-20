import { Tabs } from 'expo-router/js-tabs';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabGlyph, TAB_ICONS } from '@/components/Icon';
import { T } from '@/components/ui';
import { colors } from '@/theme/tokens';

const TAB_META: Record<string, { label: string; icon: string }> = {
  index: { label: 'Path', icon: TAB_ICONS.home },
  review: { label: 'Review', icon: TAB_ICONS.review },
  stats: { label: 'Stats', icon: TAB_ICONS.stats },
  roadmap: { label: 'Roadmap', icon: TAB_ICONS.roadmap },
};

function ElephantamTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: colors.line,
        backgroundColor: colors.card,
        paddingTop: 8,
        paddingHorizontal: 14,
        paddingBottom: Math.max(insets.bottom, 10),
      }}
    >
      {state.routes.map((route, index) => {
        const meta = TAB_META[route.name];
        if (!meta) return null;
        const focused = state.index === index;
        const color = focused ? colors.accent : colors.ink3;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{ alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 14, minWidth: 56 }}
          >
            <TabGlyph path={meta.icon} color={color} strokeWidth={focused ? 2.4 : 1.9} />
            <T s={10.5} w={600} c={color} ls={0.1}>
              {meta.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <ElephantamTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="review" />
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="roadmap" />
    </Tabs>
  );
}
