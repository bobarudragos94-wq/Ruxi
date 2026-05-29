export function Field({
  label,
  htmlFor,
  error,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-on-surface-variant">{hint}</p>}
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full h-12 px-4 bg-surface-container-lowest border border-outline rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full p-4 bg-surface-container-lowest border border-outline rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`${inputClass} appearance-none pr-10 ${props.className ?? ""}`}
      />
      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
        expand_more
      </span>
    </div>
  );
}
