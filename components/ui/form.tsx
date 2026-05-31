import * as React from "react";
import { cn } from "@/lib/utils";

export function Form({ children, ...props }: React.ComponentProps<"form">) {
  return <form {...props}>{children}</form>;
}

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function FormMessage({ className, children }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return <p className={cn("text-sm text-red-600", className)}>{children}</p>;
}
