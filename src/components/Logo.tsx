/** Erident tooth logo. Sized via the `className` (defaults fill currentColor). */
export function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.5c-2.2 0-3.3 1-5 1-1.6 0-2.8-.6-3.8.4C2 5 2.3 7.6 3 10.4c.5 2 .8 3.4 1.2 5.3.4 1.9.7 4.3 1.4 5.2.6.8 1.7.7 2.2-.2.5-.9.8-2.6 1.1-4 .3-1.4.6-2.6 1.1-2.6s.8 1.2 1.1 2.6c.3 1.4.6 3.1 1.1 4 .5.9 1.6 1 2.2.2.7-.9 1-3.3 1.4-5.2.4-1.9.7-3.3 1.2-5.3.7-2.8 1-5.4-.2-6.5-1-1-2.2-.4-3.8-.4-1.7 0-2.8-1-5-1Z"
        fill="currentColor"
      />
    </svg>
  );
}
