"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/Field";
import { Button } from "@/components/ui";
import { changePassword, type ChangePasswordState } from "@/lib/actions/account";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ChangePasswordState, FormData>(changePassword, {});
  const fe = state.fieldErrors || {};

  return (
    <form action={formAction} className="space-y-5 max-w-md">
      <Field label="Parola curentă" htmlFor="currentPassword" error={fe.currentPassword}>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="Parola nouă" htmlFor="newPassword" error={fe.newPassword} hint="Minim 8 caractere">
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Confirmă parola nouă" htmlFor="confirmPassword" error={fe.confirmPassword}>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
      </Field>

      {state.ok && (
        <div className="bg-secondary-container text-on-secondary-container text-sm rounded-lg px-4 py-3">
          Parola a fost schimbată cu succes.
        </div>
      )}
      {state.error && (
        <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">{state.error}</div>
      )}

      <Button type="submit" icon="lock_reset" disabled={pending}>
        {pending ? "Se salvează..." : "Schimbă parola"}
      </Button>
    </form>
  );
}
