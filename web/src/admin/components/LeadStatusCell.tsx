"use client";

import React from "react";

type Props = {
  cellData?: string | null;
};

const LABELS: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  confirmed: "Подтверждена",
  done: "Закрыта",
  cancelled: "Отмена",
  spam: "Спам",
};

export function LeadStatusCell({ cellData }: Props) {
  const value = String(cellData || "new");
  const label = LABELS[value] || value;
  return <span className={`crm-status crm-status--${value}`}>{label}</span>;
}
