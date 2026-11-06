# Plezix performance

This guide describes the supported production build and the benchmarks used to
measure changes. Do not use a debug build to judge end-user performance.

## Desktop: production build

Use the checked-in `mozconfig.plezix-performance`:

```sh
export MOZCONFIG="$PWD/mozconfig.plezix-performance"
./mach build
./mach package
```

The configuration enables the release build, Profile-Guided Optimization (PGO),
and Link-Time Optimization (LTO). PGO is not a single compiler switch: the
Mozilla build system creates an instrumented build, runs its profile workload,
and then builds again using the collected profile. This takes significantly
longer than a normal build, but optimizes hot code paths based on runtime data.
LTO mode is selected by the Mozilla build system for the detected compiler and
platform.

The release configuration already requests optimized Rust compilation. Avoid
adding `-C target-cpu=native` or other machine-specific CPU flags to distributable
builds: they can make the binary run poorly or fail on other customers' devices.

## Desktop: memory-focused browsing

The desktop profile is tuned to reduce the steady-state footprint of several
same-site video tabs:

- Background video decoding is suspended after 1 second. Audio playback is not
  intentionally stopped; video decoding resumes when a tab is selected.
- The small memory-backed media cache is limited to 64 MiB or 2% of physical
  RAM, whichever limit is reached first. The HTTP memory cache is capped at
  32 MiB; larger media files continue to use the file-backed cache.
- The decoded-image surface cache is capped at 256 MiB per content process and
  at one eighth of physical RAM, whichever is smaller. Old decoded surfaces
  can be evicted and decoded again when needed; images and page features remain
  available, with a possible extra decode cost when revisiting image-heavy pages.
- When a content process moves to the background, Gecko returns unused
  allocator pages to the OS. This does not unload the page, discard live
  JavaScript objects, or disable background functionality.
- Fission remains enabled, but the maximum number of isolated content
  processes per origin is reduced to one. This can let tabs on the same origin
  (such as multiple YouTube tabs) share a process; different origins remain
  isolated.
- Speculative tab warmup, cached background tab layers, and the spare
  prelaunched content process are disabled to avoid keeping idle resources.
- Under OS memory pressure, background tabs can be unloaded after 60 seconds
  inactive. Their tab entries remain visible, but selecting an unloaded tab
  reloads its page and any video.

These measures reduce avoidable background memory, not the memory needed by an
actively playing video, its JavaScript heap, browser chrome, GPU process, or
operating system. Five loaded YouTube pages may still exceed 300 MiB; five
simultaneously playing videos will use more. The 300 MiB target must be checked
with repeatable measurements on the target desktop OS and hardware.

## Android: optimized Fenix release

Build the release variant:

```sh
./mach gradle fenix:assembleRelease
```

The Fenix release build already enables R8 minification and resource shrinking.
Do not pass `-PdisableOptimization` to a shipping build. The dedicated
`benchmark` variant deliberately turns those optimizations off because it is
used to generate/measure profiles.

## Android: keep background YouTube tabs lighter

Android's GeckoView build now suspends video decoding in background tabs after
1 second instead of waiting for the 10-second engine default. Audio playback is
not intentionally disabled; this targets background video decoding and its
frame/decoder resources. Returning to a tab resumes decoding.

The combined budget for small memory-backed media caches is capped at 64 MiB
and 2% of physical RAM (whichever limit is reached first). Larger media streams
continue to use the file-backed media cache.

These settings reduce avoidable background media memory, but they do not unload
the page or its JavaScript heap. Five loaded YouTube tabs therefore cannot be
guaranteed to fit in 300 MiB, especially while multiple videos are actively
playing or decoding. GeckoView does not currently provide Firefox Desktop's
full low-memory tab-unloading feature. Do not reduce Fission/site isolation to
chase a memory number: that trades away tab isolation and increases the risk of
unresponsive tabs and out-of-memory crashes.

## Measure Android performance

The repository already contains Macrobenchmark journeys for cold startup,
normal browsing, tab switching, and long-page scrolling. Run them on a physical
Android device (not an emulator), and compare results from the same device,
OS version, build variant, and thermal/power state.

From `mobile/android/fenix`:

```sh
./gradlew :benchmark:connectedBenchmarkAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=org.mozilla.fenix.benchmark.BaselineProfilesStartupBenchmark \
  -PbenchmarkTest
```

To inspect other journeys, use these benchmark classes:

- `org.mozilla.fenix.benchmark.BaselineProfilesNormalBrowsingBenchmark`
- `org.mozilla.fenix.benchmark.BaselineProfilesSwitchTabsBenchmark`
- `org.mozilla.fenix.benchmark.BaselineProfilesBrowserPageScrollBenchmark`

These tests compare execution without a Baseline Profile against execution
with one. The profile-enabled case explicitly requires a Baseline Profile, so
make sure the build is supplied with the generated profile through the existing
`baselineProfilePath` build property before using that comparison. Do not
hand-write profile rules; generate them from representative user journeys and
ship the measured profile with the release build.

## Runtime behavior changed here

Desktop speculative tab warmup and the extra background-tab layer cache are
disabled to avoid retaining graphics and process resources for tabs that are
not being used. Selecting a cold tab may take slightly longer, but normal tab
switching, page state, and browser features remain available unless the
existing low-memory tab-unloading mechanism is triggered by OS memory pressure.

The image-surface cache is smaller, so old decoded images may need to be decoded
again when revisited. Images themselves are not disabled or removed from pages.

No security sandbox, tracking protection, certificate validation, process
isolation between origins, extensions, or web-compatibility feature is disabled
for this memory pass.

## Benchmark discipline

For each performance change, record cold-start time, warm-start time, page-load
time, tab-switch latency, memory use, and battery impact where relevant. Compare
multiple runs and report medians; do not claim a speedup until measurements on
the same device confirm it.
