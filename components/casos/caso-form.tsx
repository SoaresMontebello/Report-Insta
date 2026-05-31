"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Caso, EvidenciaImagem, StatusCaso, ViolacaoTipo } from "@/types";
import { STATUS_LABELS, VIOLATION_LABELS } from "@/types";

const schema = z.object({
  username: z.string().min(1, "Username obrigatório"),
  profileUrl: z.string().url("URL do perfil inválida"),
  postUrlsText: z.string().min(1, "Informe pelo menos uma URL de post"),
  violationType: z.enum(["nudez_nao_consensual", "conteudo_menor", "assedio_ameaca", "suplantacao", "outro"]),
  severity: z.enum(["1", "2", "3", "4", "5"]),
  dateFound: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use formato YYYY-MM-DD"),
  shortDescription: z.string().optional(),
  status: z.enum(["pendente", "enviado", "resolvido"]),
  internalNotes: z.string().optional(),
  sentAt: z.string().optional(),
  sentObservations: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CasoFormProps {
  initialData?: Caso;
  onSubmit: (data: Omit<Caso, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  submitLabel?: string;
}

const toInputDate = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function CasoForm({ initialData, onSubmit, submitLabel = "Salvar" }: CasoFormProps) {
  const [images, setImages] = useState<EvidenciaImagem[]>(initialData?.evidenceImages ?? []);

  const defaultValues = useMemo<FormValues>(
    () => ({
      username: initialData?.username ?? "",
      profileUrl: initialData?.profileUrl ?? "",
      postUrlsText: initialData?.postUrls?.join("\n") ?? "",
      violationType: (initialData?.violationType ?? "outro") as ViolacaoTipo,
      severity: String(initialData?.severity ?? 3) as FormValues["severity"],
      dateFound: initialData?.dateFound ?? new Date().toISOString().split("T")[0],
      shortDescription: initialData?.shortDescription ?? "",
      status: (initialData?.status ?? "pendente") as StatusCaso,
      internalNotes: initialData?.internalNotes ?? "",
      sentAt: toInputDate(initialData?.sentAt),
      sentObservations: initialData?.sentObservations ?? "",
    }),
    [initialData],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleImages = async (files: FileList | null) => {
    if (!files) return;
    const parsed = await Promise.all(Array.from(files).map(async (file) => ({ name: file.name, dataUrl: await toDataUrl(file) })));
    setImages((prev) => [...prev, ...parsed]);
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const submit = form.handleSubmit(async (values) => {
    const postUrls = values.postUrlsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    await onSubmit({
      username: values.username.trim(),
      profileUrl: values.profileUrl.trim(),
      postUrls,
      violationType: values.violationType,
      severity: Number(values.severity) as Caso["severity"],
      dateFound: values.dateFound,
      shortDescription: values.shortDescription?.trim(),
      status: values.status,
      evidenceImages: images,
      internalNotes: values.internalNotes?.trim(),
      sentAt: values.sentAt ? new Date(values.sentAt).toISOString() : undefined,
      sentObservations: values.sentObservations?.trim(),
    });
  });

  return (
    <Form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <FormItem>
          <FormLabel>Username*</FormLabel>
          <FormControl>
            <Input {...form.register("username")} placeholder="@usuario" />
          </FormControl>
          <FormMessage>{form.formState.errors.username?.message}</FormMessage>
        </FormItem>

        <FormItem>
          <FormLabel>URL do perfil*</FormLabel>
          <FormControl>
            <Input {...form.register("profileUrl")} placeholder="https://instagram.com/..." />
          </FormControl>
          <FormMessage>{form.formState.errors.profileUrl?.message}</FormMessage>
        </FormItem>
      </div>

      <FormItem>
        <FormLabel>URLs dos posts (uma por linha)*</FormLabel>
        <FormControl>
          <Textarea {...form.register("postUrlsText")} className="min-h-24" />
        </FormControl>
        <FormMessage>{form.formState.errors.postUrlsText?.message}</FormMessage>
      </FormItem>

      <div className="grid gap-4 md:grid-cols-3">
        <FormItem>
          <FormLabel>Tipo de violação*</FormLabel>
          <Select {...form.register("violationType")}>
            {Object.entries(VIOLATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormItem>
        <FormItem>
          <FormLabel>Gravidade*</FormLabel>
          <Select {...form.register("severity")}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </FormItem>
        <FormItem>
          <FormLabel>Status*</FormLabel>
          <Select {...form.register("status")}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormItem>
      </div>

      <FormItem>
        <FormLabel>Data de identificação*</FormLabel>
        <Input type="date" {...form.register("dateFound")} />
        <FormMessage>{form.formState.errors.dateFound?.message}</FormMessage>
      </FormItem>

      <FormItem>
        <FormLabel>Descrição curta</FormLabel>
        <Textarea {...form.register("shortDescription")} />
      </FormItem>

      <FormItem>
        <FormLabel>Evidências (imagens)</FormLabel>
        <Input type="file" accept="image/*" multiple onChange={(event) => void handleImages(event.target.files)} />
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {images.map((image, idx) => (
              <div key={`${image.name}-${idx}`} className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.dataUrl} alt={image.name} className="h-24 w-full rounded border object-cover" />
                <Button variant="outline" size="sm" type="button" onClick={() => removeImage(idx)}>
                  Remover
                </Button>
              </div>
            ))}
          </div>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>Notas internas</FormLabel>
        <Textarea {...form.register("internalNotes")} />
      </FormItem>

      <div className="grid gap-4 md:grid-cols-2">
        <FormItem>
          <FormLabel>Data de envio da denúncia</FormLabel>
          <Input type="date" {...form.register("sentAt")} />
        </FormItem>
        <FormItem>
          <FormLabel>Observações pós-envio</FormLabel>
          <Textarea {...form.register("sentObservations")} />
        </FormItem>
      </div>

      <Button type="submit">{submitLabel}</Button>
    </Form>
  );
}
