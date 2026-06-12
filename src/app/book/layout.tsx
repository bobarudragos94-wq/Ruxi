import { Icon } from "@/components/Icon";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-x-clip">
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&display=swap"
        rel="stylesheet"
      />
      {/* Decorative background: soft gradient + floating orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-[#0a84ff]/15 to-[#00c389]/10 blur-3xl animate-float-slow" />
        <div className="absolute top-[40%] -left-32 w-[24rem] h-[24rem] rounded-full bg-gradient-to-tr from-[#6d4bf6]/10 to-[#0a84ff]/10 blur-3xl animate-float-slower" />
        <div className="absolute -bottom-40 right-[15%] w-[26rem] h-[26rem] rounded-full bg-gradient-to-t from-[#00c389]/10 to-transparent blur-3xl animate-float-slow" />
      </div>

      <header className="glass shadow-sm sticky top-0 z-40 h-16 flex items-center px-4 md:px-8 border-b border-white/40">
        <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a84ff] to-[#005dac] flex items-center justify-center text-white shadow-md shadow-primary/25">
              <Icon name="dentistry" filled />
            </div>
            <div>
              <p className="font-display font-semibold text-lg text-primary leading-tight tracking-tight">{BRAND_NAME}</p>
              <p className="text-xs text-on-surface-variant">{BRAND_TAGLINE}</p>
            </div>
          </div>
          <a
            href="#programare"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-[#0a84ff] transition-colors"
          >
            <Icon name="calendar_add_on" className="!text-xl" />
            Programează-te
          </a>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-10">{children}</main>

      <footer className="relative border-t border-outline-variant/50 mt-8">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-on-surface-variant">
          <p className="font-medium">
            {BRAND_NAME} · {BRAND_TAGLINE}
          </p>
          <p className="flex items-center gap-1.5">
            <Icon name="verified_user" className="!text-base" />
            Datele tale sunt protejate
          </p>
        </div>
      </footer>
    </div>
  );
}
