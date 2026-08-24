"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ModalForms() {
  const pathname = usePathname();
  useEffect(() => {
    const forms = document.querySelectorAll<HTMLFormElement>(".authenticated-content form:not([data-no-modal])");
    forms.forEach((form) => {
      if (form.dataset.modalized === "true") return;
      form.dataset.modalized = "true";
      const submit = [...form.querySelectorAll<HTMLButtonElement>("button")].find((button) => button.type !== "button");
      const heading = form.querySelector("h2")?.textContent?.trim();
      const label = heading || submit?.textContent?.trim() || "Open form";
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = form.classList.contains("danger-zone") || form.querySelector(".delete-inline") ? "modal-trigger danger" : "modal-trigger";
      trigger.textContent = label;
      const dialog = document.createElement("dialog");
      dialog.className = "form-modal";
      const frame = document.createElement("div");
      frame.className = "form-modal-frame";
      const close = document.createElement("button");
      close.type = "button";
      close.className = "modal-close";
      close.setAttribute("aria-label", "Close");
      close.textContent = "×";
      form.parentNode?.insertBefore(trigger, form);
      form.parentNode?.insertBefore(dialog, form);
      frame.append(close, form);
      dialog.append(frame);
      trigger.addEventListener("click", () => dialog.showModal());
      close.addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    });
  }, [pathname]);
  return null;
}

