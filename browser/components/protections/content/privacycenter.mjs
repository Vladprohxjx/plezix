/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const getBool = (name, fallback = false) => {
  try {
    return RPMGetBoolPref(name, fallback);
  } catch {
    return fallback;
  }
};

const getInt = (name, fallback = 0) => {
  try {
    return RPMGetIntPref(name, fallback);
  } catch {
    return fallback;
  }
};

const getString = (name, fallback = "") => {
  try {
    return RPMGetStringPref(name, fallback);
  } catch {
    return fallback;
  }
};

const setState = (id, enabled, enabledText = "Включена", disabledText = "Выключена") => {
  const node = document.getElementById(id);
  if (!node) {
    return false;
  }
  node.dataset.state = enabled ? "on" : "off";
  node.textContent = enabled ? enabledText : disabledText;
  return enabled;
};

function refreshPrivacyStatus() {
  const trackingProtection =
    getBool("privacy.trackingprotection.enabled") ||
    getBool("privacy.trackingprotection.pbmode.enabled");
  const cookieBehavior = getInt("network.cookie.cookieBehavior", 0);
  const cookieIsolation = cookieBehavior === 5;
  const fingerprinting =
    getBool("privacy.trackingprotection.fingerprinting.enabled") ||
    getBool("privacy.fingerprintingProtection");
  const cryptomining = getBool("privacy.trackingprotection.cryptomining.enabled");
  const globalPrivacyControl = getBool("privacy.globalprivacycontrol.enabled");
  const category = getString("browser.contentblocking.category", "custom");

  const protectionSignals = [
    trackingProtection,
    cookieIsolation,
    fingerprinting,
    cryptomining,
  ];
  const enabledCount = protectionSignals.filter(Boolean).length;
  const protectionEnabled = enabledCount > 0;

  const overall = document.getElementById("overall-status");
  const overallText = document.getElementById("overall-status-text");
  overall.dataset.state = protectionEnabled ? "on" : "off";
  overallText.textContent = protectionEnabled
    ? "Защита активна"
    : "Проверьте настройки защиты";

  const trackingNode = document.getElementById("tracking-status");
  trackingNode.dataset.state = trackingProtection ? "on" : "off";
  trackingNode.textContent = trackingProtection ? "Включена" : "Выключена";
  document.getElementById("tracking-detail").textContent =
    category === "strict"
      ? "Выбран строгий режим встроенной защиты Firefox."
      : category === "standard"
        ? "Выбран стандартный режим встроенной защиты Firefox."
        : "Режим защиты настроен индивидуально или политикой браузера.";

  setState("cookie-status", cookieIsolation, "Сторонние cookie разделены", "Разделение не включено");
  setState("fingerprint-status", fingerprinting);
  setState("cryptominer-status", cryptomining);
  setState("gpc-status", globalPrivacyControl, "Сигнал отправляется", "Сигнал выключен");

  const trrMode = getInt("network.trr.mode", 0);
  const dohNode = document.getElementById("doh-status");
  const dohDetail = document.getElementById("doh-detail");
  if (trrMode === 2) {
    dohNode.dataset.state = "on";
    dohNode.textContent = "Строгий DoH";
    dohDetail.textContent = "DNS-запросы направляются через DNS-over-HTTPS без обычного DNS fallback.";
  } else if (trrMode === 3 || trrMode === 4) {
    dohNode.dataset.state = "on";
    dohNode.textContent = "DoH с fallback";
    dohDetail.textContent = "Используется зашифрованный DNS с возможностью перехода на системный DNS.";
  } else if (trrMode === 5) {
    dohNode.dataset.state = "off";
    dohNode.textContent = "Отключён";
    dohDetail.textContent = "Браузер использует обычный DNS из сетевых настроек.";
  } else {
    dohNode.dataset.state = "off";
    dohNode.textContent = "Системная настройка";
    dohDetail.textContent = "Режим DNS-over-HTTPS не принудительно задан Plezix.";
  }

  document.getElementById("privacy-center").dataset.category = category;
  document.getElementById("privacy-center").dataset.enabledProtections = String(enabledCount);
}

document.addEventListener("DOMContentLoaded", refreshPrivacyStatus, { once: true });
