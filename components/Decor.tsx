export function Rings({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} fill="none" aria-hidden="true">
      <circle cx="45" cy="40" r="28" stroke="#b8913f" strokeWidth="2.5" />
      <circle cx="75" cy="40" r="28" stroke="#d9bd78" strokeWidth="2.5" />
      <circle cx="45" cy="40" r="23" stroke="#b8913f" strokeWidth="0.8" opacity="0.6" />
      <circle cx="75" cy="40" r="23" stroke="#d9bd78" strokeWidth="0.8" opacity="0.6" />
      <path d="M60 14 L64 8 L60 2 L56 8Z" fill="#7a2e44" opacity="0.85" />
    </svg>
  );
}
