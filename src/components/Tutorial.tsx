/**
 * Shared engine for the animated, auto-playing worked-sample tutorials
 * (memory palace, numbers, images, cards). Each tutorial supplies its own
 * "beats" and stage rendering; this module owns the playback machinery,
 * controls, progress bar and the reusable stage primitives.
 *
 * Beats auto-advance on a per-beat timer (each beat carries its own `dur`),
 * so a full run lasts a minute-plus. Manual back/forward pauses playback so
 * the viewer can study a step.
 */
import React, { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowRight, ChevronLeft, ChevronRight, Play } from '@/components/Icon';
import { AppBar, ProgressBar, T, useEntering } from '@/components/ui';
import { colors, radii } from '@/theme/tokens';

export interface TutorialBeatBase {
  /** How long this beat stays on screen while auto-playing (ms). */
  dur: number;
}

interface Player {
  step: number;
  playing: boolean;
  atEnd: boolean;
  back: () => void;
  fwd: () => void;
  toggle: () => void;
  pct: number;
}

/** Auto-advancing step machine shared by every tutorial. */
export function useTutorialPlayer<B extends TutorialBeatBase>(beats: B[]): Player {
  const last = beats.length - 1;
  const [step, setStep] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const atEnd = step >= last;

  React.useEffect(() => {
    if (!playing || atEnd) return;
    const id = setTimeout(() => setStep((s) => Math.min(s + 1, last)), beats[step].dur);
    return () => clearTimeout(id);
  }, [step, playing, atEnd, last, beats]);

  const back = () => {
    setPlaying(false);
    setStep((s) => Math.max(0, s - 1));
  };
  const fwd = () => {
    setPlaying(false);
    setStep((s) => Math.min(last, s + 1));
  };
  const toggle = () => {
    if (atEnd) {
      setStep(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  return { step, playing, atEnd, back, fwd, toggle, pct: Math.round(((step + 1) / beats.length) * 100) };
}

export interface TutorialScaffoldProps<B extends TutorialBeatBase> {
  title: string;
  subtitle?: string;
  beats: B[];
  onClose: () => void;
  /** Optional persistent strip above the stage (route rail / image chain). */
  renderRail?: (step: number) => ReactNode;
  /** The animated stage for the current beat. Re-mounts each step. */
  renderStage: (beat: B, step: number) => ReactNode;
}

/** Full-screen tutorial shell: app bar, rail, animated stage, progress, controls. */
export function TutorialScaffold<B extends TutorialBeatBase>({
  title,
  subtitle,
  beats,
  onClose,
  renderRail,
  renderStage,
}: TutorialScaffoldProps<B>) {
  const insets = useSafeAreaInsets();
  const player = useTutorialPlayer(beats);
  const beat = beats[player.step];

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <AppBar title={title} subtitle={subtitle} onClose={onClose} />
      <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 18 }}>
        {renderRail ? <View style={{ marginBottom: 16 }}>{renderRail(player.step)}</View> : null}

        {/* keyed by step so each beat re-runs its entering animation */}
        <View key={player.step} style={{ flex: 1, justifyContent: 'center' }}>
          {renderStage(beat, player.step)}
        </View>

        <ProgressBar pct={player.pct} height={6} style={{ marginBottom: 14 }} />
        {!player.atEnd && <Controls player={player} />}
      </View>
    </View>
  );
}

/* ----------------------------- stage primitives ----------------------------- */

/** Centered narration card for intro / teach / transition / done beats. */
export function NarrationStage({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  const entering = useEntering();
  return (
    <Animated.View entering={entering} style={{ alignItems: 'center', paddingHorizontal: 6 }}>
      <T s={26} w={800} ls={-0.6} c={colors.ink} style={{ textAlign: 'center', marginBottom: 12 }}>
        {title}
      </T>
      <T s={15} c={colors.ink2} style={{ textAlign: 'center', lineHeight: 23, maxWidth: 320 }}>
        {body}
      </T>
      {children}
    </Animated.View>
  );
}

/** The two call-to-action buttons shown on a tutorial's final beat. */
export function TutorialCtas({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <View style={{ alignSelf: 'stretch', gap: 10, marginTop: 22 }}>
      <Pressable
        onPress={onPrimary}
        style={{ height: 54, borderRadius: radii.xl, backgroundColor: colors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }}
      >
        <T s={16} w={700} c="#fff">
          {primaryLabel}
        </T>
        <ArrowRight size={17} color="#fff" strokeWidth={2.2} />
      </Pressable>
      {secondaryLabel && onSecondary ? (
        <Pressable
          onPress={onSecondary}
          style={{ height: 50, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}
        >
          <T s={14.5} w={700} c={colors.ink}>
            {secondaryLabel}
          </T>
        </Pressable>
      ) : null}
    </View>
  );
}

export interface ChainItem {
  key: string;
  /** Big label or emoji shown once filled. */
  main: string;
  /** Small caption under the main label. */
  sub?: string;
  filled: boolean;
  active: boolean;
  /** Render `main` at emoji size. */
  big?: boolean;
}

/** Horizontal strip of chips that fill in as a tutorial builds its sequence. */
export function ChainRail({ items }: { items: ChainItem[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
      {items.map((it) => (
        <View
          key={it.key}
          style={{
            alignItems: 'center',
            minWidth: 64,
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderRadius: radii.md,
            backgroundColor: it.active ? colors.accentSoft : colors.card,
            borderWidth: 1,
            borderColor: it.active ? colors.accent : colors.line,
            opacity: it.filled ? 1 : 0.45,
          }}
        >
          <T s={it.big ? 26 : 14.5} w={700} c={it.active ? colors.accentDeep : colors.ink}>
            {it.filled ? it.main : '·'}
          </T>
          {it.sub ? (
            <T mono s={10} c={it.active ? colors.accentDeep : colors.ink3} style={{ marginTop: 2 }}>
              {it.filled ? it.sub : ''}
            </T>
          ) : null}
        </View>
      ))}
    </View>
  );
}

/** Small accent banner that opens a tutorial from a game's ready screen. */
export function DemoBanner({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: radii.lg, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accent }}
    >
      <Play size={15} color={colors.accentDeep} />
      <T s={13} w={700} c={colors.accentDeep}>
        {label}
      </T>
    </Pressable>
  );
}

/* ----------------------------- controls ----------------------------- */

function Controls({ player }: { player: Player }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <CircleBtn onPress={player.back} disabled={player.step === 0}>
        <ChevronLeft size={20} color={player.step === 0 ? colors.ink3 : colors.ink2} />
      </CircleBtn>
      <Pressable
        onPress={player.toggle}
        style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
      >
        {player.playing ? <PauseGlyph /> : <Play size={22} color="#fff" />}
      </Pressable>
      <CircleBtn onPress={player.fwd}>
        <ChevronRight size={20} color={colors.ink2} />
      </CircleBtn>
    </View>
  );
}

function CircleBtn({ onPress, disabled, children }: { onPress: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : 1 }}
    >
      {children}
    </Pressable>
  );
}

function PauseGlyph() {
  return (
    <View style={{ flexDirection: 'row', gap: 5 }}>
      <View style={{ width: 5, height: 20, borderRadius: 2, backgroundColor: '#fff' }} />
      <View style={{ width: 5, height: 20, borderRadius: 2, backgroundColor: '#fff' }} />
    </View>
  );
}
