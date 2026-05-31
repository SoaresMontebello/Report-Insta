"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyTemplateButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return <Button onClick={onCopy}>{copied ? "Copiado" : "Copiar texto de denúncia"}</Button>;
}
