import "./style.css";
import { registerSW } from "virtual:pwa-register";
import { courses } from "./content/curriculum";
import { loadPreferences, savePreferences } from "./persistence/database";
import { initialPreferences, type Preferences } from "./study/state";
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
<a class="skip" href="#main">Skip to content</a>
<header><a class="brand" href="#home" aria-label="Kira home"><span class="brand-mark">k</span> kira<span class="brand-caption">NURSING REVISION</span></a><span class="personal">Made for you <span class="avatar">K</span></span></header>
<main id="main">
<div id="home-view"><section class="intro"><p class="eyebrow">A LITTLE TIME. A CLEAR NEXT STEP.</p><h1>Your space to<br><em>make it click.</em></h1><p class="intro-copy">Your most useful next step, chosen for you.<br>At your pace, between everything else.</p></section>
<section class="revision" aria-labelledby="revision-title"><div class="revision-copy"><p class="eyebrow">TODAY’S REVISION</p><h2 id="revision-title">A fresh start, Kira.</h2><p>Your course material comes next. Then we’ll recommend what to study, balancing your assessments and what you need to learn.</p><div class="waiting"><span class="status-dot"></span>Waiting for course material</div></div><div class="path-art" aria-hidden="true"><svg viewBox="0 0 280 200"><path d="M30 160C30 80 140 180 140 100S250 120 250 35" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 7"/><circle cx="30" cy="160" r="13" fill="#dce7ad"/><circle cx="140" cy="100" r="13" fill="#b8c9ba"/><circle cx="250" cy="35" r="19" fill="#dce7ad"/><path d="m241 35 6 6 12-13" fill="none" stroke="#193f37" stroke-width="3"/></svg><span>One useful step at a time.</span></div></section>
<section class="time-section" aria-labelledby="time-title"><div><h2 id="time-title">What does your day allow?</h2><p>Save a preference. You can always keep going or stop early.</p></div><div class="time-options" role="group" aria-label="Available study time"><button data-minutes="5" aria-pressed="false">5 min</button><button data-minutes="20" aria-pressed="false">20 min</button><button data-minutes="60" aria-pressed="false">An hour +</button><button data-minutes="null" aria-pressed="false">Go with the flow</button></div><p id="save-status" class="save-status" role="status">Loading your preference…</p></section>
</div><section id="courses" hidden aria-labelledby="courses-title"><div class="section-heading"><h2 id="courses-title">Your two courses</h2><span>Room to build understanding</span></div><div class="course-grid">${courses.map((course, index) => `<article class="course ${course.id}"><div class="course-top"><span class="course-symbol" aria-hidden="true">${index === 0 ? "↔" : "✳"}</span><span class="course-number">0${index + 1} / YOUR COURSE</span></div><h3>${course.name}</h3><p>${index === 0 ? "Connect the pieces of care." : "Make the connections that matter."}</p><div class="course-state"><span class="empty-ring" aria-hidden="true"></span><div><strong>Not started</strong><span>Curriculum awaiting course material</span></div></div><div class="course-footer">Assessment details to come<span aria-hidden="true">—</span></div></article>`).join("")}</div></section>
<footer><span class="footer-mark" aria-hidden="true">✧</span><p>Understanding first. Confidence follows.</p><span id="offline-status" role="status">Preparing offline access…</span><button id="install" hidden>Install Kira</button><button id="update" hidden>Update available · Reload</button></footer>
</main><nav aria-label="Main navigation"><a href="#home" aria-current="page"><span aria-hidden="true">⌂</span>Home</a><a href="#courses"><span aria-hidden="true">▦</span>Courses</a></nav>`;
let preferences: Preferences = { ...initialPreferences };
const buttons = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-minutes]"),
];
const status = document.querySelector<HTMLElement>("#save-status")!;
function showPreference() {
  for (const button of buttons)
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.minutes === String(preferences.availableMinutes)),
    );
}
function storageError(error: unknown) {
  console.error("Kira could not access saved preferences.", error);
  status.textContent =
    "Your preference could not be saved. Check that browser storage is allowed, then reload.";
  status.setAttribute("role", "alert");
}
window.addEventListener("storage-blocked", () => {
  status.textContent =
    "Close other Kira tabs, then reload to open your saved preferences.";
});
for (const button of buttons) button.disabled = true;
loadPreferences()
  .then((saved) => {
    preferences = saved;
    showPreference();
    status.textContent = "Your preference stays on this device.";
    for (const button of buttons) button.disabled = false;
  })
  .catch(storageError);
for (const button of buttons)
  button.addEventListener("click", async () => {
    for (const option of buttons) option.disabled = true;
    const next: Preferences = {
      schemaVersion: 1,
      availableMinutes:
        button.dataset.minutes === "null"
          ? null
          : (Number(button.dataset.minutes) as 5 | 20 | 60),
    };
    try {
      await savePreferences(next);
      preferences = next;
      showPreference();
      status.textContent = "Preference saved on this device.";
    } catch (error) {
      storageError(error);
    } finally {
      for (const option of buttons) option.disabled = false;
    }
  });
const offlineStatus = document.querySelector<HTMLElement>("#offline-status")!;
const updateButton = document.querySelector<HTMLButtonElement>("#update")!;
const updateSW = registerSW({
  onOfflineReady() {
    offlineStatus.textContent = "Ready to open offline";
  },
  onNeedRefresh() {
    updateButton.hidden = false;
  },
  onRegisterError(error) {
    console.error("Offline setup failed", error);
    offlineStatus.textContent =
      "Offline access unavailable. Reopen while connected to try again.";
  },
});
updateButton.addEventListener("click", () => void updateSW(true));
if ("serviceWorker" in navigator)
  navigator.serviceWorker.ready.then(() => {
    offlineStatus.textContent = "Ready to open offline";
  });
else
  offlineStatus.textContent =
    "This browser does not support offline installation.";
interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
let installPrompt: InstallPrompt | undefined;
const installButton = document.querySelector<HTMLButtonElement>("#install")!;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event as InstallPrompt;
  installButton.hidden = false;
});
installButton.addEventListener("click", async () => {
  if (installPrompt === undefined) return;
  await installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = undefined;
  installButton.hidden = true;
});
window.addEventListener("appinstalled", () => {
  installButton.hidden = true;
});

function navigate() {
  const courseView = location.hash === "#courses";
  document.querySelector<HTMLElement>("#home-view")!.hidden = courseView;
  document.querySelector<HTMLElement>("#courses")!.hidden = !courseView;
  for (const link of document.querySelectorAll<HTMLAnchorElement>("nav a")) {
    if ((link.hash === "#courses") === courseView)
      link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  document.title = courseView
    ? "Your courses · Kira"
    : "Kira · Nursing revision";
}
window.addEventListener("hashchange", () => {
  navigate();
  window.scrollTo(0, 0);
});
navigate();
