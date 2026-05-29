/**
 * Normalizes Romanian phone numbers to a canonical E.164-ish format.
 * Accepts inputs like "0722 123 456", "+40722123456", "0040722123456".
 * Returns "+40722123456" or null if it cannot be normalized.
 */
export function normalizePhone(input: string): string | null {
  if (!input) return null;
  let digits = input.replace(/[^\d+]/g, "");

  if (digits.startsWith("+40")) {
    digits = "0" + digits.slice(3);
  } else if (digits.startsWith("0040")) {
    digits = "0" + digits.slice(4);
  } else if (digits.startsWith("40") && digits.length === 11) {
    digits = "0" + digits.slice(2);
  }

  digits = digits.replace(/\D/g, "");

  // Romanian mobile/landline: 0 + 9 digits = 10 digits total
  if (digits.length === 10 && digits.startsWith("0")) {
    return "+40" + digits.slice(1);
  }
  return null;
}

export function formatPhoneDisplay(phone: string): string {
  // +40722123456 -> 0722 123 456
  const local = phone.startsWith("+40") ? "0" + phone.slice(3) : phone;
  if (local.length === 10) {
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  return phone;
}
