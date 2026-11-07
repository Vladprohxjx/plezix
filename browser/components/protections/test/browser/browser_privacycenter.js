/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

add_task(async function test_privacy_center_page_loads_and_reports_status() {
  const tab = await BrowserTestUtils.openNewForegroundTab({
    gBrowser,
    url: "about:privacycenter",
  });

  try {
    await SpecialPowers.spawn(tab.linkedBrowser, [], async function () {
      await ContentTaskUtils.waitForCondition(
        () => {
          const status = content.document.getElementById("tracking-status");
          return status && status.dataset.state !== "checking";
        },
        "Privacy Center reads the current tracking-protection preference"
      );

      const doc = content.document;
      Assert.equal(
        doc.title,
        "Plezix — Центр конфиденциальности",
        "The Privacy Center document is loaded"
      );
      Assert.ok(
        ["on", "off"].includes(
          doc.getElementById("overall-status").dataset.state
        ),
        "The overall protection status is initialized"
      );
      Assert.ok(
        doc.querySelector('a[href="about:addons"]'),
        "The page links to Add-ons Manager"
      );
      Assert.ok(
        doc.querySelector('a[href="about:protections"]'),
        "The page links to Firefox's existing Protections report"
      );
      Assert.ok(
        doc.getElementById("doh-status").textContent.length > 0,
        "The DNS-over-HTTPS status is displayed"
      );
    });
  } finally {
    BrowserTestUtils.removeTab(tab);
  }
});
