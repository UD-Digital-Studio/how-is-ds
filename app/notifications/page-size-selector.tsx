"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const PAGE_SIZES = [10, 20, 50, 100];

export function PageSizeSelector({ value }: { value: number }) {
  const router = useRouter();
  const [selected, setSelected] = useState(value);
  const [pending, startTransition] = useTransition();

  return <label className="page-size-form">
    <span>Deliveries per page</span>
    <select
      aria-label="Deliveries per page"
      value={selected}
      disabled={pending}
      onChange={(event) => {
        const next = Number(event.target.value);
        setSelected(next);
        startTransition(() => router.push(`/notifications?page=1&perPage=${next}`));
      }}
    >
      {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
    </select>
  </label>;
}
