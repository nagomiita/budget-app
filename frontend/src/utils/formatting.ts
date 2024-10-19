import { format } from "date-fns";

export function formatMonth(date: Date): string {
  return format(date, "yyyy-MM");
}

export function formatCurrency(amount: number) {
  return amount.toLocaleString("ja-JP");
}
