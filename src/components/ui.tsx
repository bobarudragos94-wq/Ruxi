import { Icon } from "./Icon";

export function Card({
  children,
  className = "",
  id,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      id={id}
      style={style}
      className={`bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">{title}</h1>
        {subtitle && <p className="text-on-surface-variant mt-1 text-sm md:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface-container-high text-on-surface-variant",
    primary: "bg-primary-fixed text-on-primary-fixed",
    success: "bg-secondary-container text-on-secondary-container",
    warning: "bg-[#ffe2b8] text-[#7a4e00]",
    danger: "bg-error-container text-on-error-container",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, hint }: { icon: string; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-4">
        <Icon name={icon} className="!text-3xl" />
      </div>
      <p className="font-semibold text-on-surface">{title}</p>
      {hint && <p className="text-sm text-on-surface-variant mt-1">{hint}</p>}
    </div>
  );
}

const buttonVariants: Record<string, string> = {
  primary:
    "bg-gradient-to-br from-[#0a84ff] to-[#005dac] text-white shadow-sm hover:shadow-md hover:brightness-105",
  secondary: "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
  outline: "border border-outline text-on-surface hover:bg-surface-container",
  danger: "bg-gradient-to-br from-[#ff5a5a] to-[#ba1a1a] text-white shadow-sm hover:brightness-105",
  success: "bg-gradient-to-br from-[#00c389] to-[#00875a] text-white shadow-sm hover:brightness-105",
};

export function Button({
  children,
  variant = "primary",
  icon,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonVariants; icon?: string }) {
  return (
    <button
      className={`h-12 px-5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${buttonVariants[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} className="!text-xl" />}
      {children}
    </button>
  );
}

/** Colored icon chip used in section headers / list rows. */
const chipTones: Record<string, string> = {
  blue: "bg-[#e3f0ff] text-[#0a6cdc]",
  green: "bg-[#d6f7ec] text-[#00875a]",
  purple: "bg-[#ece6ff] text-[#6d4bf6]",
  orange: "bg-[#ffeede] text-[#e06a00]",
  pink: "bg-[#ffe3ef] text-[#d11b6b]",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

export function IconChip({
  icon,
  tone = "blue",
  className = "",
}: {
  icon: string;
  tone?: keyof typeof chipTones;
  className?: string;
}) {
  return (
    <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${chipTones[tone]} ${className}`}>
      <Icon name={icon} filled className="!text-xl" />
    </span>
  );
}

export function SectionTitle({
  icon,
  tone = "blue",
  children,
  action,
  className = "mb-4",
}: {
  icon: string;
  tone?: keyof typeof chipTones;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="font-semibold text-lg flex items-center gap-2.5">
        <IconChip icon={icon} tone={tone} />
        {children}
      </h2>
      {action}
    </div>
  );
}
