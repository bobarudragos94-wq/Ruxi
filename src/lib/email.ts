/**
 * Mock email sender. Logs to console instead of sending real emails.
 * Structured so a real provider (Resend, etc.) can be swapped in later.
 */

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}

export interface SendEmailResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface EmailProvider {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}

class MockEmailProvider implements EmailProvider {
  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log("📧 [MOCK EMAIL]", {
      to: input.to,
      subject: input.subject,
      body: input.body,
      providerMessageId: id,
    });
    return { ok: true, providerMessageId: id };
  }
}

// Future: if (process.env.EMAIL_PROVIDER === "resend") return new ResendProvider();
export function getEmailProvider(): EmailProvider {
  return new MockEmailProvider();
}

export function buildRecallEmail(bookingLink: string): { subject: string; body: string } {
  return {
    subject: "Reamintire control stomatologic periodic",
    body: `Bună ziua,

Vă reamintim că este timpul pentru controlul stomatologic periodic / detartraj.

Vă puteți programa accesând linkul de mai jos:
${bookingLink}

O zi bună,
Cabinetul stomatologic`,
  };
}
