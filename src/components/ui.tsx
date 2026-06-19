/**
 * Shared UI primitives styled to the Mnemos design.
 */
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { ChevronLeft, Close } from '@/components/Icon';
import { useProgress } from '@/state/store';
import { useUI } from '@/state/ui';
import { colors, fonts, radii } from '@/theme/tokens';

type Weight = 400 | 500 | 600 | 700 | 800;

const SANS: Record<Weight, string> = {
  400: fonts.sans,
  500: fonts.sansMedium,
  600: fonts.sansSemibold,
  700: fonts.sansBold,
  800: fonts.sansExtra,
};

export interface TProps extends TextProps {
  /** font size */
  s?: number;
  /** weight 400–800 */
  w?: Weight;
  /** color */
  c?: string;
  mono?: boolean;
  /** letterSpacing */
  ls?: number;
}

/** Typography helper that maps weight → the right font family. */
export function T({ s, w = 400, c = colors.ink, mono, ls, style, ...rest }: TProps) {
  const family = mono ? (w >= 700 ? fonts.monoBold : fonts.mono) : SANS[w];
  return (
    <Text
      {...rest}
      style={[{ fontFamily: family, color: c, fontSize: s, letterSpacing: ls }, style]}
    />
  );
}

export function Card({ style, ...rest }: ViewProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: radii.xxl,
        },
        style,
      ]}
    />
  );
}

export interface ProgressBarProps {
  pct: number;
  height?: number;
  track?: string;
  fill?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  pct,
  height = 8,
  track = colors.card2,
  fill = colors.accent,
  style,
}: ProgressBarProps) {
  const w = useSharedValue(pct);
  useEffect(() => {
    w.value = withTiming(Math.max(0, Math.min(100, pct)), { duration: 450 });
  }, [pct, w]);
  const animated = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View style={[{ height, backgroundColor: track, borderRadius: radii.pill, overflow: 'hidden' }, style]}>
      <Animated.View style={[{ height: '100%', backgroundColor: fill, borderRadius: radii.pill }, animated]} />
    </View>
  );
}

export interface RingProps {
  pct: number;
  size?: number;
  color?: string;
  label?: string;
}

/** Circular progress ring (tiers on Home). */
export function Ring({ pct, size = 46, color = colors.accent, label }: RingProps) {
  const r = 19;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 46 46" style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={23} cy={23} r={r} stroke={colors.card2} strokeWidth={5} fill="none" />
        <Circle
          cx={23}
          cy={23}
          r={r}
          stroke={color}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </Svg>
      {label != null && (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <T mono w={700} s={11.5} c={colors.ink}>
            {label}
          </T>
        </View>
      )}
    </View>
  );
}

/** Rounded chip with border (streak chip, review-day chip). */
export function Pill({ style, ...rest }: ViewProps) {
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: radii.pill,
          paddingVertical: 7,
          paddingHorizontal: 12,
        },
        style,
      ]}
    />
  );
}

export interface AppBarProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
}

/** Full-screen flow app bar: close button + centered title/subtitle. */
export function AppBar({ title, subtitle, onClose }: AppBarProps) {
  return (
    <View style={styles.appBar}>
      {onClose ? (
        <Pressable onPress={onClose} style={styles.appBarBtn} hitSlop={8}>
          <Close size={18} color={colors.ink2} />
        </Pressable>
      ) : (
        <View style={{ width: 36 }} />
      )}
      <View style={{ alignItems: 'center' }}>
        <T w={700} s={15} ls={-0.2}>
          {title}
        </T>
        {subtitle ? (
          <T mono s={11} c={colors.ink3}>
            {subtitle}
          </T>
        ) : null}
      </View>
      <View style={{ width: 36 }} />
    </View>
  );
}

/** Square back button used inside flows. */
export function SquareButton({ onPress, kind = 'back' }: { onPress: () => void; kind?: 'back' }) {
  return (
    <Pressable onPress={onPress} style={styles.squareBtn}>
      <ChevronLeft size={20} color={colors.ink2} />
    </Pressable>
  );
}

/** Floating toast above the tab bar, driven by the UI store. */
export function ToastHost() {
  const toast = useUI((s) => s.toast);
  const seq = useUI((s) => s.seq);
  if (!toast) return null;
  return (
    <Animated.View
      key={seq}
      entering={FadeInDown.duration(220)}
      exiting={FadeOut.duration(200)}
      style={styles.toast}
      pointerEvents="none"
    >
      <View style={styles.toastDot} />
      <T w={700} s={13.5} c={colors.onInk}>
        {toast}
      </T>
    </Animated.View>
  );
}

/** Standard fade-in-up entering animation matching the design's mnUp/mnPop. */
export const enterUp = FadeInDown.duration(360);

/**
 * Returns the entrance animation, or undefined when the user has enabled
 * "reduce motion". Optionally delayed (ms).
 */
export function useEntering(delayMs?: number) {
  const reduce = useProgress((s) => s.settings.reduceMotion);
  if (reduce) return undefined;
  return delayMs ? FadeInDown.duration(360).delay(delayMs) : enterUp;
}

export interface CountUpProps extends TProps {
  value: number;
  duration?: number;
}

/** Animated number that counts up to `value` (instant when reduce-motion is on). */
export function CountUp({ value, duration, ...textProps }: CountUpProps) {
  const reduce = useProgress((s) => s.settings.reduceMotion);
  if (reduce) return <T {...textProps}>{value}</T>;
  return <AnimatedCount value={value} duration={duration} {...textProps} />;
}

function AnimatedCount({ value, duration = 700, ...textProps }: CountUpProps) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <T {...textProps}>{display}</T>;
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  appBarBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareBtn: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 104,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.ink,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: radii.lg,
  },
  toastDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
