# Plezix ad blocking

Plezix preconfigures **uBlock Origin** using Firefox's built-in
`ExtensionSettings` enterprise policy. The browser downloads the signed
extension package from Mozilla Add-ons on first launch; Plezix does not
repackage, modify, or host the extension binary.

## Behavior

- The extension is automatically installed for new and existing profiles.
- Installation uses the official AMO listing and follows its current release,
  so uBlock Origin can update through Firefox's normal extension update flow.
- The extension is user-disableable (`normal_installed`), rather than
  force-installed or locked.
- Its toolbar button is placed in the navigation bar by default.
- It is enabled in private windows through the `private_browsing` policy.
- uBlock Origin's own default filter lists are used; Plezix does not inject
  third-party filter subscriptions or override user filter choices.

An internet connection to addons.mozilla.org is required the first time the
policy installs the extension. If the extension is not visible immediately,
restart the browser and inspect `about:policies` (Active tab) and
`about:addons`.

## Implementation

The policy lives at `browser/app/distribution/policies.json` and is staged as
`distribution/policies.json` in the application directory. The build rule is
in `browser/app/distribution/moz.build`.

The extension ID is `uBlock0@raymondhill.net`. The policy uses
`normal_installed` so users retain control and may disable the blocker.
Do not set `force_installed` unless the product requirement explicitly changes
to making the extension mandatory.

## Verify a build

After rebuilding, launch Plezix with an internet connection. Open
`about:policies` and confirm that `ExtensionSettings` is active. Then open
`about:addons` and verify that uBlock Origin is installed and enabled. Test
a known ad-supported page and the uBlock Origin toolbar popup. Also verify
that private windows are covered.

If policy status shows an error, inspect the policy JSON and verify that the
staged file exists at `distribution/policies.json` beside the application
binary. The policy cannot download the extension while offline.
