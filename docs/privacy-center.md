# Plezix Privacy Center

Open `about:privacycenter` to see the current browser privacy configuration.

The page is part of the existing Protections component and uses Firefox's
Remote Page Manager preference readers. It reads current values for tracking
protection, third-party cookie partitioning, fingerprinting protection,
cryptomining protection, Global Privacy Control, and DNS-over-HTTPS mode.

The quick links open built-in Firefox settings and tools:
- `about:preferences#privacy`
- `about:addons`
- `about:policies`
- `about:protections`

The extension section describes the Plezix default installation policy. It is
not a live Add-on Manager inventory; use `about:addons` to confirm that an
extension is installed, enabled, and allowed in private windows. First-time
installation requires a connection to Mozilla Add-ons.

The page intentionally does not change privacy preferences directly. It
provides a status view and links to the browser's existing controls, keeping
Firefox's normal site-exception and preference-management behavior intact.

## Implementation

- Page: `browser/components/protections/content/privacycenter.html`
- Styling: `privacycenter.css`
- Preference status reader: `privacycenter.mjs`
- Chrome resource registration: `browser/components/protections/jar.mn`
- `about:privacycenter` redirect and security flags:
  `browser/components/about/AboutRedirector.cpp`
- About module contract registration:
  `browser/components/about/components.conf`
- Registration and security-flag test:
  `browser/components/about/test/unit/test_getURIFlags.js`

The page is loaded in the privileged about process with the same safe-content,
child-process, script, and secure-chrome-UI flags used by Firefox's existing
Protections report. It loads only packaged chrome resources and does not make
remote requests.
