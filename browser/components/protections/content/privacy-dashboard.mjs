/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global RPMGetBoolPref, RPMGetIntPref, RPMGetStringPref, RPMSendAsyncMessage, RPMSendQuery */

const numberFormat = new Intl.NumberFormat();

function getBoolPref(name) {
  try {
    return RPMGetBoolPref(name, false);
  } catch {
    return false;
  }
}

function getIntPref(name) {
  try {
    return RPMGetIntPref(name, 0);
  } catch {
    return 0;
  }
}

function getStringPref(name, fallback) {
  try {
    return RPMGetStringPref(name) || fallback;
  } catch {
    return fallback;
  }
}

function setLocalizedText(id, message) {
  const node = document.getElementById(id);
  if (node) {
    document.l10n.setAttributes(node, message);
  }
}

function setState(id, enabled) {
  const node = document.getElementById(id);
  if (!node) {
    return;
  }
  node.dataset.state = enabled ? "on" : "off";
  document.l10n.setAttributes(
    node,
    enabled ? "plezix-privacy-state-enabled" : "plezix-privacy-state-disabled"
  );
}

function updateProtectionStatus() {
  const category = getStringPref("browser.contentblocking.category", "custom");
  const trackingNormal = getBoolPref("privacy.trackingprotection.enabled");
  const trackingPrivate = getBoolPref("privacy.trackingprotection.pbmode.enabled");
  const trackingProtection = trackingNormal || trackingPrivate;
  const cookieBehavior = getIntPref("network.cookie.cookieBehavior");
  const fingerprinting =
    getBoolPref("privacy.trackingprotection.fingerprinting.enabled") ||
    getBoolPref("privacy.fingerprintingProtection") ||
    getBoolPref("privacy.fingerprintingProtection.pbmode");
  const cryptomining = getBoolPref(
    "privacy.trackingprotection.cryptomining.enabled"
  );
  const socialTracking = getBoolPref(
    "privacy.trackingprotection.socialtracking.enabled"
  );
  const globalPrivacyControl = getBoolPref(
    "privacy.globalprivacycontrol.enabled"
  );

  const modeMessages = {
    strict: "plezix-privacy-mode-strict",
    standard: "plezix-privacy-mode-standard",
    custom: "plezix-privacy-mode-custom",
  };
  setLocalizedText(
    "mode-value",
    modeMessages[category] || "plezix-privacy-mode-custom"
  );

  const modeDetails = {
    strict: "plezix-privacy-mode-detail-strict",
    standard: "plezix-privacy-mode-detail-standard",
    custom: "plezix-privacy-mode-detail-custom",
  };
  setLocalizedText(
    "mode-detail",
    modeDetails[category] || "plezix-privacy-mode-detail-custom"
  );

  setState("tracking-state", trackingProtection);
  const trackingDetail =
    trackingNormal && trackingPrivate
      ? "plezix-privacy-etp-both"
      : trackingNormal
        ? "plezix-privacy-etp-normal"
        : trackingPrivate
          ? "plezix-privacy-etp-private"
          : "plezix-privacy-etp-detail";
  setLocalizedText("tracking-detail", trackingDetail);

  const cookieMessages = {
    0: "plezix-privacy-cookie-none",
    1: "plezix-privacy-cookie-third-party",
    2: "plezix-privacy-cookie-all",
    3: "plezix-privacy-cookie-limited",
    4: "plezix-privacy-cookie-trackers",
    5: "plezix-privacy-cookie-partitioned",
  };
  const cookieEnabled = cookieBehavior !== 0;
  const cookieNode = document.getElementById("cookie-state");
  cookieNode.dataset.state = cookieEnabled ? "on" : "off";
  document.l10n.setAttributes(
    cookieNode,
    cookieMessages[cookieBehavior] || "plezix-privacy-cookie-custom"
  );
  setLocalizedText("cookie-detail", "plezix-privacy-cookies-detail");

  setState("fingerprint-state", fingerprinting);
  setState("cryptominer-state", cryptomining);
  setState("social-state", socialTracking);
  setState("gpc-state", globalPrivacyControl);

  const activeProtections = [
    trackingProtection,
    cookieEnabled,
    fingerprinting,
    cryptomining,
    socialTracking,
  ].filter(Boolean).length;
  const overall = document.getElementById("overall-status");
  overall.dataset.state = activeProtections ? "on" : "off";
  setLocalizedText(
    "overall-status-text",
    activeProtections
      ? "plezix-privacy-status-active"
      : "plezix-privacy-status-review"
  );
}

function renderMetricsUnavailable(message) {
  const card = document.getElementById("metrics-card");
  card.dataset.state = "unavailable";
  document.getElementById("metric-total").textContent = "—";
  setLocalizedText("metrics-status", message);
}

async function updateProtectionMetrics() {
  const card = document.getElementById("metrics-card");
  try {
    const stats = await RPMSendQuery("FetchPrivacyMetrics");
    if (stats?.isPrivate) {
      card.dataset.state = "private";
      renderMetricsUnavailable("plezix-privacy-activity-private");
      return;
    }
    if (!stats || !Number.isFinite(stats.total)) {
      renderMetricsUnavailable("plezix-privacy-activity-unavailable");
      return;
    }

    const categories = [
      { key: "trackers", count: stats.trackers, valueId: "metric-trackers", barId: "bar-trackers" },
      { key: "cookies", count: stats.cookies, valueId: "metric-cookies", barId: "bar-cookies" },
      { key: "fingerprinters", count: stats.fingerprinters, valueId: "metric-fingerprinters", barId: "bar-fingerprinters" },
      { key: "cryptominers", count: stats.cryptominers, valueId: "metric-cryptominers", barId: "bar-cryptominers" },
      { key: "social", count: stats.socialTrackers, valueId: "metric-social", barId: "bar-social" },
    ].map(item => ({ ...item, count: Math.max(0, Number(item.count) || 0) }));

    const total = Math.max(0, Number(stats.total));
    const largest = Math.max(1, ...categories.map(item => item.count));
    document.getElementById("metric-total").textContent = numberFormat.format(total);

    for (const item of categories) {
      document.getElementById(item.valueId).textContent = numberFormat.format(item.count);
      document.getElementById(item.barId).style.width =
        String(Math.round((item.count / largest) * 100)) + "%";
    }

    document.getElementById("metrics-breakdown").hidden = false;
    card.dataset.state = total ? "ready" : "empty";
    setLocalizedText(
      "metrics-status",
      total
        ? "plezix-privacy-activity-summary"
        : "plezix-privacy-activity-empty"
    );
  } catch (error) {
    console.error("Plezix Privacy Dashboard: failed to load protection metrics", error);
    renderMetricsUnavailable("plezix-privacy-activity-unavailable");
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    document.querySelectorAll("[data-rpm-message]").forEach(button => {
      button.addEventListener("click", () => {
        RPMSendAsyncMessage(button.dataset.rpmMessage);
      });
    });
    updateProtectionStatus();
    updateProtectionMetrics();
  },
  { once: true }
);
