/**
 * Design tokens ported 1:1 from the Mnemos Claude Design file (Mnemos.dc.html).
 * The design exposed configurable `accentColor`, `paperTone` and `errorColor`
 * props; we bake the defaults here (warm paper, #3f6f54 accent).
 */

export const paperTones = {
  warm: '#efeae0',
  cool: '#eceef0',
  neutral: '#eeece9',
} as const;

export type PaperTone = keyof typeof paperTones;

export const colors = {
  paper: paperTones.warm,
  card: '#fbf9f4',
  card2: '#f5f1e8',
  ink: '#211e19',
  ink2: '#5d574c',
  ink3: '#9c9486',
  line: '#e7e0d2',
  accent: '#3f6f54',
  accentDeep: '#2c513c',
  accentSoft: '#e7efe6',
  err: '#b0543c',
  errSoft: '#f5e6df',
  gold: '#b07f2c',
  /** Light text used on dark (ink) surfaces. */
  onInk: '#fbf9f4',
} as const;

/** Font families — loaded via @expo-google-fonts in the root layout. */
export const fonts = {
  /** Schibsted Grotesk weights */
  sans: 'SchibstedGrotesk_400Regular',
  sansMedium: 'SchibstedGrotesk_500Medium',
  sansSemibold: 'SchibstedGrotesk_600SemiBold',
  sansBold: 'SchibstedGrotesk_700Bold',
  sansExtra: 'SchibstedGrotesk_800ExtraBold',
  /** Space Mono */
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

export const radii = {
  sm: 9,
  md: 11,
  lg: 14,
  xl: 16,
  xxl: 20,
  pill: 999,
} as const;

export const space = {
  screenH: 20,
} as const;
