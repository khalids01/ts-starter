import { format } from "date-fns";
import type { VisitorItem } from "./types";

export function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 29);

  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

export function formatChartTick(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return format(parsed, "MMM d");
}

export function displayUserName(item: VisitorItem) {
  if (item.userName) {
    return item.userName;
  }

  if (item.userEmail) {
    return item.userEmail;
  }

  return "Anonymous";
}
