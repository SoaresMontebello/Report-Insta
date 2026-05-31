import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700",
        className,
      )}
      {...props}
    />
  );
}

export function SelectTrigger({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span>{placeholder}</span>;
}

export function SelectContent({ children }: React.HTMLAttributes<HTMLDivElement>) {
  return <>{children}</>;
}

export function SelectItem({ children, value }: React.ComponentProps<"option">) {
  return <option value={value}>{children}</option>;
}
