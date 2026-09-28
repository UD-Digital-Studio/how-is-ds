"use client";
import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISSED = "hows-ds-install-dismissed";
const SILENCE = 14 * 24 * 60 * 60 * 1000;
// "Not now" stores the moment it was clicked, so the card offers itself again two
// weeks later rather than never. A value we cannot read as a timestamp counts as
// expired, which is what we want for anything left over from an earlier version.
const remember = () => { try { localStorage.setItem(DISMISSED, String(Date.now())); } catch { /* private mode */ } };
const dismissed = () => { try { const at = Number(localStorage.getItem(DISMISSED)); return at > 0 && Date.now() - at < SILENCE; } catch { return false; } };

export function InstallPrompt() {
  const [offer, setOffer] = useState<InstallEvent | null>(null);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    if (dismissed()) return;
    const capture = (event: Event) => { event.preventDefault(); setOffer(event as InstallEvent); };
    const installed = () => { remember(); setOffer(null); };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    return () => { window.removeEventListener("beforeinstallprompt", capture); window.removeEventListener("appinstalled", installed); };
  }, []);
  if (!offer) return null;
  const install = async () => { await offer.prompt(); await offer.userChoice; setOffer(null); };
  const later = () => { remember(); setOffer(null); };
  return (
    <div className="install-prompt">
      <img src="/icon-192.png" alt="" width={38} height={38}/>
      <div>
        <strong>Install the app</strong>
        <span>Add it to your home screen for quicker access.</span>
      </div>
      <button className="primary" onClick={install}>Install</button>
      <button className="install-later" onClick={later}>Not now</button>
    </div>
  );
}
