"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { gerarTextoDenuncia } from "@/lib/templates";
import type { Caso } from "@/types";

export function TemplateModal({ caso }: { caso: Caso }) {
  const [open, setOpen] = useState(false);
  const template = useMemo(() => gerarTextoDenuncia(caso), [caso]);

  const copyText = async () => {
    await navigator.clipboard.writeText(template);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} type="button">Gerar texto</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Texto de denúncia</DialogTitle>
            <DialogDescription>Modelo gerado automaticamente com os dados do caso.</DialogDescription>
          </DialogHeader>
          <Textarea value={template} readOnly className="min-h-72" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} type="button">Fechar</Button>
            <Button onClick={copyText} type="button">Copiar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
