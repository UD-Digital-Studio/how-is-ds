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

// No browser on iOS can offer an install programmatically — Chrome and the rest
// are WebKit underneath, and WebKit has no beforeinstallprompt. Installing there
// is the Share sheet, by hand, so iOS gets the instruction instead of a button.
const onIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
const alreadyInstalled = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

export function InstallPrompt() {
  const [offer, setOffer] = useState<InstallEvent | null>(null);
  const [manual, setManual] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    if (dismissed() || alreadyInstalled()) return;
    if (onIOS()) setManual(true);
    const capture = (event: Event) => { event.preventDefault(); setOffer(event as InstallEvent); };
    const installed = () => { remember(); setOffer(null); setManual(false); };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    return () => { window.removeEventListener("beforeinstallprompt", capture); window.removeEventListener("appinstalled", installed); };
  }, []);
  if (!offer && !manual) return null;
  const install = async () => { if (!offer) return; await offer.prompt(); await offer.userChoice; setOffer(null); };
  const later = () => { remember(); setOffer(null); setManual(false); };
  return (
    <div className="install-prompt">
      <img src="/icon-192.png" alt="" width={38} height={38}/>
      <div>
        <strong>Install the app</strong>
        {offer ? <span>Add it to your home screen for quicker access.</span> : <span>Tap Share, then Add to Home Screen.</span>}
      </div>
      {offer && <button className="primary" onClick={install}>Install</button>}
      <button className="install-later" onClick={later}>{offer ? "Not now" : "Got it"}</button>
    </div>
  );
}
