# Plezix browser interface

Plezix is moving toward a Safari-like desktop browser window while preserving
Firefox's engine, native browser commands, accessibility, customization, and
extension support.

## Visual principles

- Safari-style order: navigation toolbar, tab strip, then favorites/bookmarks.
- Centered rounded smart search, joined back/forward controls, and compact toolbar buttons.
- Separate rounded tabs with restrained light/dark materials.
- A native browser sidebar for open tabs, bookmarks, history, synced tabs, and passwords.
- A Safari-like Start Page built from the user's own shortcuts and search, without a news feed or sponsored tiles.
- Keep the small warm Plezix/Firefox accent; do not imitate macOS window controls on Windows.

## Scope and rollout

1. **Browser window** — navigation row, tabs, toolbar items, bookmarks row, and sidebar.
2. **Start Page** — centered search, Favorites shortcuts, native wallpaper/customization support.
3. **Browser panels** — downloads, bookmarks, tab overview, and extension menus.

The redesign intentionally excludes Settings pages and internal diagnostic/about pages.
Changes should be checked on Windows first, then reviewed for macOS/Linux and
accessibility regressions. Avoid always-running background services or heavy
extensions for visual features.
