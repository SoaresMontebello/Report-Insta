"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Caso } from "@/types";

export function useCasos() {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const all = await db.casos.orderBy("createdAt").reverse().toArray();
    setCasos(all);
    setLoading(false);
  }, []);

  const createCaso = useCallback(async (payload: Omit<Caso, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const id = await db.casos.add({
      ...payload,
      createdAt: now,
      updatedAt: now,
    });
    await refresh();
    return id;
  }, [refresh]);

  const getCasoById = useCallback(async (id: number) => {
    return db.casos.get(id);
  }, []);

  const updateCaso = useCallback(async (id: number, payload: Partial<Caso>) => {
    await db.casos.update(id, { ...payload, updatedAt: new Date().toISOString() });
    await refresh();
  }, [refresh]);

  const deleteCaso = useCallback(async (id: number) => {
    await db.casos.delete(id);
    await refresh();
  }, [refresh]);

  const exportJson = useCallback(async () => {
    const all = await db.casos.toArray();
    return JSON.stringify(all, null, 2);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void db.casos
      .orderBy("createdAt")
      .reverse()
      .toArray()
      .then((all) => {
        if (!cancelled) {
          setCasos(all);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { casos, loading, createCaso, getCasoById, updateCaso, deleteCaso, exportJson, refresh };
}
