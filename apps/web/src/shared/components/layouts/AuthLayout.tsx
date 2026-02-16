/**
 * Full-page layout for auth pages (Login, Register) with a clean SVG pattern
 * background using the primary (blue) accent.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.02]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0 32 L 32 0 M -32 32 L 32 32 M 32 -32 L 32 32"
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="w-full max-w-[420px] px-4 sm:px-6">{children}</div>
    </div>
  );
}
