import { Icon } from "@/components/Icon";

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface-container-lowest shadow-sm sticky top-0 z-40 h-16 flex items-center px-4 md:px-8">
        <div className="flex items-center gap-3 max-w-3xl mx-auto w-full">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <Icon name="dentistry" filled />
          </div>
          <div>
            <p className="font-bold text-primary leading-tight">Cabinet Stomatologic</p>
            <p className="text-xs text-on-surface-variant">Programare online</p>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8">{children}</main>
    </div>
  );
}
