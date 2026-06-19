/**
 * SVG icon set — paths lifted directly from the Mnemos design.
 */
import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Factory for a single stroked-path icon. */
function strokeIcon(d: string) {
  return function StrokeIcon({ size = 24, color = colors.ink2, strokeWidth = 2 }: IconProps) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  };
}

export const ChevronRight = strokeIcon('M9 6l6 6-6 6');
export const ChevronLeft = strokeIcon('M15 6l-6 6 6 6');
export const ArrowRight = strokeIcon('M5 12h14M13 6l6 6-6 6');
export const ArrowDown = strokeIcon('M12 4v16M6 14l6 6 6-6');
export const Close = strokeIcon('M6 6l12 12M18 6 6 18');
export const Lock = strokeIcon('M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5z');
export const Check = strokeIcon('M5 13l4 4 10-11');
export const Padlock = strokeIcon('M3 11h18M7 11V7a5 5 0 0 1 10 0v4M9 16h6');

export function Play({ size = 18, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 5v14l11-7z" fill={color} />
    </Svg>
  );
}

export function Flame({ size = 15, color = colors.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3c2.5 4 5 5.5 5 9.5A5 5 0 0 1 7 12.5C7 9.8 8 8 9.2 6.6c.5 1.2 1.2 1.7 2 2C11.4 6.8 11 4.8 12 3Z"
        fill={color}
      />
    </Svg>
  );
}

export function Timer({ size = 15, color = colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={13} r={8} stroke={color} strokeWidth={2} />
      <Path d="M12 9v4M9 2h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function Gear({ size = 20, color = colors.ink2, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M19.4 13.5a7.6 7.6 0 000-3l1.8-1.4-2-3.4-2.1.9a7.6 7.6 0 00-2.6-1.5L14 2h-4l-.5 2.6a7.6 7.6 0 00-2.6 1.5l-2.1-.9-2 3.4L4.6 10a7.6 7.6 0 000 3l-1.8 1.4 2 3.4 2.1-.9a7.6 7.6 0 002.6 1.5L10 22h4l.5-2.6a7.6 7.6 0 002.6-1.5l2.1.9 2-3.4-1.8-1.4z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Clock({ size = 14, color = colors.ink2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={13} r={8} stroke={color} strokeWidth={2} />
      <Path d="M12 9v4l2 2M9 2h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

/** Generic tab-bar glyph (paths from the design's tabDef). */
export function TabGlyph({
  path,
  color,
  strokeWidth = 2,
  size = 22,
}: IconProps & { path: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={path} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export const TAB_ICONS = {
  home: 'M4 11.5 12 4l8 7.5M6 10v10h12V10',
  review: 'M4 7h16M4 12h16M4 17h10',
  stats: 'M5 19V11M12 19V5M19 19v-5',
  roadmap: 'M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z',
} as const;
