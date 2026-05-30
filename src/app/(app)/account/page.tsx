import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader, Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { ROLE_LABELS } from "@/lib/constants";

export default async function AccountPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="space-y-5">
      <PageHeader title="Contul meu" subtitle="Profil, securitate și preferințe" />

      {/* Profile */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-sm text-on-surface-variant">{user.email}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
      </Card>

      {/* Password */}
      <Card className="p-5" id="password">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Icon name="lock_reset" className="text-primary" /> Schimbă parola
        </h2>
        <ChangePasswordForm />
      </Card>

      {/* Preferences (placeholder for future options) */}
      <Card className="p-5" id="preferences">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-2">
          <Icon name="tune" className="text-primary" /> Preferințe
        </h2>
        <p className="text-sm text-on-surface-variant">
          Opțiunile de personalizare (notificări, limbă, temă) vor fi disponibile în curând.
        </p>
      </Card>
    </div>
  );
}
