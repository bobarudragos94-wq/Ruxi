import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/Logo";
import { BRAND_NAME } from "@/lib/brand";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Brand panel */}
      <div className="md:w-1/2 bg-primary text-on-primary flex flex-col justify-center px-8 py-12 md:px-16 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -left-10 bottom-0 w-48 h-48 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <Logo className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold">{BRAND_NAME}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
            Zâmbete sănătoase,<br />administrate simplu.
          </h1>
          <p className="text-on-primary/80 max-w-sm">
            Platforma internă a cabinetului Erident — pacienți, programări și remindere, într-un singur loc.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="md:w-1/2 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-on-primary mb-4 shadow-md">
              <Logo className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface">{BRAND_NAME}</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-on-surface">Bine ai revenit 👋</h2>
            <p className="text-on-surface-variant text-sm mt-1">Autentifică-te pentru a continua.</p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 md:p-8">
            <LoginForm />
          </div>

          <p className="text-center text-xs text-on-surface-variant mt-6">
            Acces exclusiv pentru personalul cabinetului {BRAND_NAME}.
          </p>
        </div>
      </div>
    </div>
  );
}
