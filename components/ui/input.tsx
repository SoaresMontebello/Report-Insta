import * as React from "react";

import { cn } from "@/app/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-zinc-500",
        className,
      )}
      {...props}
    />
  );
}
