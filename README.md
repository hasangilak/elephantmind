# Mnemos

A memory-training game for iOS, Android and web, built with Expo + React Native.
It teaches the techniques competitive memory athletes use — the **memory palace**,
the **Major System** for numbers, and **Rule-of-Five spaced repetition** — through
short, playable rounds. Built from the research in [`research.md`](./research.md)
and the Mnemos design (Claude Design).

It is solo and fully local: all progress (XP, streak, spaced-repetition deck,
discipline bests, history) is stored on-device with AsyncStorage. No backend, no
accounts.

<p align="center">
  <img src="docs/screenshots/home.jpg" alt="Mnemos home screen" width="300" />
</p>

## Screens

- **Path (Home)** — level/XP, a resume card, and a 3-tier progression of disciplines.
- **Numbers** — a Major System lesson, then a timed memorize → keypad-recall →
  score round (beginner / intermediate / advanced).
- **Cards** — Speed Cards: flip through a shuffled deck one card at a time (with a
  PAO-style word per card), then reorganize the reshuffled deck back into order.
  Includes an editable 52-card system and a 1–4 cards-per-story selector.
- **Palace** — stash words at 12 rooms of a memory palace, then walk it back.
- **Images** — Link/Story: memorize a sequence of images, then tap them back in order.
- **Review** — Rule-of-Five spaced repetition over the 00–99 number-images, with a
  "simulate time" control to watch cards fall due.
- **Stats** — level, streak, Major System mastery, weekly activity, bests, history.
- **Roadmap** — the encoding upgrade path and planned features.
- **Settings** — haptics, daily reminder, reduce-motion, reset progress.

## Get started

```bash
npm install
npx expo start        # then press i / a / w for iOS, Android, or web
```

## Project layout

```
src/
  app/             expo-router routes ((tabs) + numbers + palace flows)
  engine/          pure game logic (digits/scoring, palace, spaced repetition, leveling)
  data/            Major System peg table + static game content
  state/           Zustand progress store (AsyncStorage) + ephemeral UI store
  components/      shared UI (Icon, Card, Ring, Toast, tab bar, layout helpers)
  theme/           design tokens (colors, fonts, radii)
```

## Scripts

```bash
npm test           # jest — engine/data unit tests
npm run typecheck  # tsc --noEmit
npm run lint       # expo lint
```
