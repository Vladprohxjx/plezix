# Plezix ad and tracking protection

Plezix combines two complementary extensions with Firefox's built-in
Enhanced Tracking Protection (ETP):

- **uBlock Origin** blocks ads, known tracking endpoints, malicious domains,
  and cosmetic page elements using filter lists.
- **Privacy Badger** from EFF learns to identify third-party trackers by their
  behavior, which can catch trackers missing from manually maintained lists.
- **Firefox ETP Strict** blocks known tracking content in regular and private
  windows, partitions cross-site cookies, and enables additional protections
  such as bounce-tracking protection.

No browser extension can guarantee that every form of tracking is stopped.
First-party analytics, account-based tracking, server-side profiling,
fingerprinting variants, and tracking through data voluntarily submitted to a
site can still occur. A website may also need some third-party services to
function.

## Extension behavior

Both extensions are installed from their official Mozilla Add-ons listings.
Plezix downloads signed packages on first launch; it does not modify or host
the extension binaries.

- uBlock Origin ID: `uBlock0@raymondhill.net`
- Privacy Badger ID: `jid1-MnnxcxisBPnSXQ@jetpack`
- Both use `normal_installed`: they are installed automatically but are not
  force-locked and can be disabled or removed by the user.
- Both toolbar buttons are placed in the navigation bar.
- Both are enabled in private windows.
- Each extension updates through Firefox's normal add-on update mechanism.

Privacy Badger's official FAQ says it is compatible with other ad blockers
and Firefox ETP. It learns trackers from observed behavior, so its purpose
overlaps with uBlock Origin and ETP in some places but is not identical.

## Firefox tracking protection

The `EnableTrackingProtection` policy selects ETP Strict, enables protection
in regular and private windows, and leaves the top-level protection switch
user-changeable (`Locked: false`). Baseline and convenience exceptions remain
enabled to reduce major website breakage. The Strict category is managed by
policy; users can still turn ETP off for a site through the shield panel, or
disable the top-level protection switch in settings.

Strict mode can break some sign-ins, embedded videos, payment flows, and
cross-site widgets. Add an exception only for a site that demonstrably needs
it, rather than globally weakening protection.

## First launch and verification

An internet connection to `addons.mozilla.org` is required when the policy
first installs the extensions. If an extension is not visible immediately,
restart Plezix and inspect:

1. `about:policies` — the Active tab should show `ExtensionSettings` and
   `EnableTrackingProtection`.
2. `about:addons` — both uBlock Origin and Privacy Badger should be installed
   and enabled.
3. The shield panel on a regular (not only private) window — ETP Strict should
   be active.
4. The Privacy Badger toolbar popup — it should report its current status and
   show tracking domains as it learns from browsing.

The policy lives at `browser/app/distribution/policies.json` and is staged as
`distribution/policies.json` by `browser/app/distribution/moz.build`.
