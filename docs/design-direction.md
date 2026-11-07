# Plezix interface direction

Plezix is moving toward a quieter, Safari-inspired desktop interface while
keeping Firefox's flexibility, recognizable warmth, and native browser
behavior.

## Visual principles

- Compact browser chrome with clear hierarchy and fewer hard separators.
- Rounded address/search field and restrained capsule-style tabs.
- Neutral light/dark surfaces with a small warm Firefox-inspired accent.
- Preserve native Firefox controls, keyboard behavior, accessibility, themes,
  customization, and extension support unless a later change deliberately
  replaces them.

## Rollout

1. **Browser shell** — tabs, navigation toolbar, address field, and bookmarks
   toolbar. This is the first visual pass.
2. **New Tab / Home** — simplify the start page and align cards, search, and
   shortcuts with the same visual language.
3. **Panels and sidebar** — refine downloads, bookmarks, history, extensions,
   and sidebar surfaces without duplicating native Firefox features.
4. **Settings and details** — unify preferences, dialogs, context menus, and
   smaller browser surfaces.

Changes should be incremental and tested on Windows first, then checked for
macOS/Linux regressions. Avoid introducing always-running background services
or heavy extensions for visual features.
