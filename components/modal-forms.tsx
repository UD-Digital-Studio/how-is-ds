"use client";

// Forms must remain in the React-owned DOM tree. Moving server-action forms
// after hydration causes React reconciliation to call removeChild on a node
// whose parent has changed. Route-specific, React-rendered dialogs can be
// introduced without mutating those nodes.
export function ModalForms() {
  return null;
}

