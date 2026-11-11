export function KitsuneMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 17.5 7.5 6.5 18.5 12" />
      <path d="M37 17.5 40.5 6.5 29.5 12" />
      <path d="M24 13c-7.4 0-13 5.2-13 12.1 0 7.1 5.8 11.7 13 11.7s13-4.6 13-11.7C37 18.2 31.4 13 24 13Z" />
      <path d="M16.5 23.5h3.2" />
      <path d="M28.3 23.5h3.2" />
      <path d="M24 29.2v1.6" />
      <path d="M21.4 33c1.6 1.1 3.6 1.1 5.2 0" />
    </svg>
  );
}
