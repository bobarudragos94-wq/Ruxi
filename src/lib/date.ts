import { DAY_LABELS } from "./constants";

const MONTHS = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
];

export function formatDateRo(date: Date | string): string {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateLongRo(date: Date | string): string {
  const d = new Date(date);
  return `${DAY_LABELS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatTimeRo(date: Date | string): string {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatDateTimeRo(date: Date | string): string {
  return `${formatDateRo(date)}, ${formatTimeRo(date)}`;
}

export function monthYearRo(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** Returns the Monday of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toDateInputValue(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
