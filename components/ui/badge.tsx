import * as React from "react";

import { cn } from "@/app/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-800", className)}
      {...props}
    />
  );
}
