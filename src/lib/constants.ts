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
