#!/usr/bin/env bash
# Local Android APK build — no EAS, no login, no cloud. Builds entirely on this Mac.
#
# Usage:
#   npm run build:android                                          # release APK, arm64-v8a
#   ARCH=armeabi-v7a,arm64-v8a,x86,x86_64 npm run build:android    # universal (also runs on emulators)
#   VARIANT=debug npm run build:android                            # debug (needs Metro running; rarely useful)
#
# Output: builds/elephantam-<variant>-<timestamp>.apk  (the builds/ folder is gitignored)
set -euo pipefail
cd "$(dirname "$0")/.."

VARIANT="${VARIANT:-release}"
ARCH="${ARCH:-arm64-v8a}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"

# Force a Gradle-compatible JDK (17–21). The React Native gradle plugin breaks on
# Java 25, so we must NOT inherit a too-new JAVA_HOME from the shell.
JBR="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
if [ -x "$JBR/bin/java" ]; then
  export JAVA_HOME="$JBR"
elif J="$(/usr/libexec/java_home -v 21 2>/dev/null)"; then
  export JAVA_HOME="$J"
elif J="$(/usr/libexec/java_home -v 17 2>/dev/null)"; then
  export JAVA_HOME="$J"
else
  echo "✖ Need a JDK 17–21 (e.g. install Android Studio). Found JAVA_HOME=$JAVA_HOME" >&2
  exit 1
fi
echo "▶ Using JDK: $("$JAVA_HOME/bin/java" -version 2>&1 | head -1)"

# release -> assembleRelease
TASK="assemble$(printf '%s' "${VARIANT:0:1}" | tr '[:lower:]' '[:upper:]')${VARIANT:1}"

# Generate the native android/ project (gitignored). prebuild also rewrites
# package.json/app.json scripts, so snapshot and restore them — keeps the repo clean.
cp package.json .pkg.bak
cp app.json .app.bak
trap 'mv -f .pkg.bak package.json 2>/dev/null || true; mv -f .app.bak app.json 2>/dev/null || true' EXIT
echo "▶ expo prebuild (android — gitignored)…"
npx expo prebuild -p android --no-install >/dev/null

# Expo ships Gradle 9.x, which is incompatible with AGP 8.12 (JvmVendorSpec.IBM_SEMERU
# was removed in Gradle 9). Pin the wrapper to 8.13 so the local build succeeds.
sed -i '' 's#gradle-9\.[0-9.]*-bin\.zip#gradle-8.13-bin.zip#' android/gradle/wrapper/gradle-wrapper.properties

echo "▶ gradle $TASK ($ARCH) — the first build takes a while…"
(
  cd android
  ./gradlew --stop >/dev/null 2>&1 || true   # drop any stale daemon on the wrong JVM
  ./gradlew "$TASK" -PreactNativeArchitectures="$ARCH" -Dorg.gradle.java.home="$JAVA_HOME" --console=plain
)

mkdir -p builds
OUT="builds/elephantam-${VARIANT}-$(date +%Y%m%d-%H%M%S).apk"
cp "android/app/build/outputs/apk/${VARIANT}/app-${VARIANT}.apk" "$OUT"
echo ""
echo "✅ APK ready → $OUT"
ls -lh "$OUT"
