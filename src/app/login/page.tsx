import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { Icon } from "@/components/Icon";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-on-primary mb-4 shadow-md">
            <Icon name="dentistry" filled className="!text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Cabinet Stomatologic</h1>
          <p className="text-on-surface-variant text-sm mt-1">Autentificare personal</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 md:p-8">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-6">
          Acces exclusiv pentru personalul cabinetului.
        </p>
      </div>
    </div>
  );
}
