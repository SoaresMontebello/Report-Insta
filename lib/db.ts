import Dexie, { type Table } from "dexie";
import type { Caso } from "@/types";

class SafeReportDB extends Dexie {
  casos!: Table<Caso, number>;

  constructor() {
    super("SafeReportDB");
    this.version(1).stores({
      casos: "++id, username, violationType, status, severity, dateFound, createdAt, sentAt",
    });
  }
}

export const db = new SafeReportDB();
