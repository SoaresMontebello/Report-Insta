import * as React from "react";

import { cn } from "@/app/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-zinc-200 bg-white p-4", className)} {...props} />;
}
