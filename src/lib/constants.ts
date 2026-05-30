import { InterventionType, AppointmentStatus, ReminderStatus, Role } from "@prisma/client";

/** Romanian UI labels for intervention types. */
export const INTERVENTION_LABELS: Record<InterventionType, string> = {
  CONTROL: "Control",
  DETARTRAJ: "Detartraj",
  PLOMBA: "Plombă",
  EXTRACTIE: "Extracție",
  TRATAMENT_CANAL: "Tratament canal",
  ALTCEVA: "Altceva",
};

/** Services a patient can pick in the public booking flow (no "Altceva"). */
export const PUBLIC_SERVICES: { value: InterventionType; label: string }[] = [
  { value: "CONTROL", label: "Control" },
  { value: "DETARTRAJ", label: "Detartraj" },
  { value: "PLOMBA", label: "Plombă" },
  { value: "EXTRACTIE", label: "Extracție" },
  { value: "TRATAMENT_CANAL", label: "Tratament canal" },
];

export function publicServiceLabel(value: string): string | null {
  return PUBLIC_SERVICES.find((s) => s.value === value)?.label ?? null;
}

/** How far ahead the public booking flow may reach (anti-abuse horizon). */
export const PUBLIC_BOOKING_HORIZON_DAYS = 90;

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Programat",
  CONFIRMED: "Confirmat",
  CANCELLED: "Anulat",
  COMPLETED: "Finalizat",
  NO_SHOW: "Neprezentat",
};

export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  PENDING: "În așteptare",
  SENT: "Trimis",
  CONFIRMED: "Confirmat",
  BOOKED: "Programat",
  CANCELLED: "Anulat",
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  DENTIST: "Medic",
  STAFF: "Personal",
};

export const DAY_LABELS = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
export const DAY_LABELS_SHORT = ["DUM", "LUN", "MAR", "MIE", "JOI", "VIN", "SÂM"];
