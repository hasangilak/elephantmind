# Elephantam

A memory-training game for iOS, Android and web, built with Expo + React Native.
It teaches the techniques competitive memory athletes use — the **memory palace**,
the **Major System** for numbers, and **Rule-of-Five spaced repetition** — through
short, playable rounds. Built from the research in [`research.md`](./research.md)
and the Elephantam design (Claude Design).

It is solo and fully local: all progress (XP, streak, spaced-repetition deck,
discipline bests, history) is stored on-device with AsyncStorage. No backend, no
accounts.

<p align="center">
  <img src="docs/screenshots/home.jpg" alt="Elephantam home screen" width="300" />
</p>

## Features

- **Five disciplines, one loop.** Every round is the same shape — *memorize → recall → score* — tuned per discipline:
  - **Numbers** (the Major System) with a built-in lesson: the digit→consonant code, "vowels are free," worked peg examples, and a quick check before you play.
  - **Cards** (Speed Cards): flip a shuffled deck one card at a time, then rebuild the reshuffled deck back into the exact order you memorized.
  - **Palace** (Method of Loci): place words around a 12-room palace, then walk it back.
  - **Images** (Link/Story): chain a sequence of images and tap them back in order.
  - **Review** (spaced repetition): drill the full 00–99 number-images on a Rule-of-Five schedule.
- **Build your own encoding systems.** Edit the word/image for any of the 52 cards (PAO-style) and choose how many cards form one "scene" (1–4). The full 100-image Major System table ships built in.
- **Real spaced repetition.** Cards fall due on real calendar days (now → +1 day → +1 week → +1 month → +3 months), with new / due / mastered counts and *x*/100 mastery tracking.
- **Progression & habit-building.** XP and levels with ranks (Novice → Grandmaster), a 3-tier skill path, day streaks, a weekly-activity chart, per-discipline bests, recent-session history, and an optional daily reminder.
- **Benchmark feedback.** Rounds are graded against real memory-sport benchmarks (e.g. "at this pace you'd place: *Intermediate*"), plus accuracy, time, and longest-correct-run.
- **Feel & accessibility.** Haptics, score count-up animations, a reduce-motion switch, an editable display name, and a warm-paper / ink theme (Schibsted Grotesk + Space Mono).
- **Solo & fully offline.** All progress lives on-device (AsyncStorage) — no account, no backend, no network. Runs on iOS, Android, and the web.

## Screens

- **Path (Home)** — level/XP, a resume card, and a 3-tier progression of disciplines.
- **Numbers** — a Major System lesson, then a timed memorize → keypad-recall →
  score round (beginner / intermediate / advanced).
- **Cards** — Speed Cards: flip through a shuffled deck one card at a time (with a
  PAO-style word per card), then reorganize the reshuffled deck back into order.
  Includes an editable 52-card system and a 1–4 cards-per-story selector.
- **Palace** — stash words at 12 rooms of a memory palace, then walk it back.
- **Images** — Link/Story: memorize a sequence of images, then tap them back in order.
- **Review** — Rule-of-Five spaced repetition over all 100 number-images; cards
  come due on real calendar days (now, +1 day, +1 week, +1 month, +3 months).
- **Stats** — level, streak, Major System mastery, weekly activity, bests, history.
- **Roadmap** — the encoding upgrade path and planned features.
- **Settings** — your display name, haptics, daily reminder, reduce-motion, reset progress.

## Run it on your device

This is a personal-use app — it is **not published to the app stores**. Clone it
and run it yourself:

```bash
git clone https://github.com/hasangilak/elephantmind.git elephantam
cd elephantam
npm install
npx expo start        # press w for web, or scan the QR with Expo Go
```

- **Quick try (Expo Go):** install **Expo Go** on your phone — it must support
  **Expo SDK 56** (update it if older) — then scan the QR from `npx expo start`.
  Everything works except the daily reminder, which Expo Go can't run.
- **Full features (dev build):** for the daily reminder, build a development
  client instead of Expo Go (needs Android Studio / Xcode):
  ```bash
  npx expo run:android   # or: npx expo run:ios
  ```

A fresh install starts empty — level 1, no streak, all 100 number-images "new" —
and builds real progress as you play.

**Standalone APK (no account):** build an installable release APK entirely on your
machine — no EAS, no login, no cloud:

```bash
npm run build:android      # → builds/elephantam-release-<timestamp>.apk  (gitignored)
```

## Project layout

```
src/
  app/             expo-router routes ((tabs) + numbers / cards / palace / images / settings)
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
