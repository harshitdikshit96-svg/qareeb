// Shared inline icon set. Pulled out of the individual components that
// each used to define their own copy (MasjidCard, MasjidGallery,
// ImageCarousel, the detail page) so there is one definition per icon.

export function MosqueIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeOpacity="0.85"
      strokeWidth="1.4"
    >
      <path d="M12 2c1.2 1.2 1.6 2.3.9 3.6C14.6 6.3 15.5 7.3 15.5 8.5H8.5c0-1.2.9-2.2 1.6-2.9C9.4 4.3 10.8 3.2 12 2Z" />
      <path d="M3 21v-6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v6" />
      <path d="M16 21v-6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v6" />
      <path d="M8.5 8.5V21h7V8.5" />
      <path d="M2 21h20" />
      <path d="M11 13.5a1 1 0 1 1 2 0v2.5h-2v-2.5Z" />
    </svg>
  );
}

export function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "#d9a441" : "none"}
      stroke={filled ? "#d9a441" : "#123832"}
      strokeWidth="2"
    >
      <path d="M12 21s-7.5-4.6-10-9.3C.5 8.3 2.3 5 5.6 5 8 5 9.7 6.6 12 9c2.3-2.4 4-4 6.4-4 3.3 0 5.1 3.3 3.6 6.7C19.5 16.4 12 21 12 21Z" />
    </svg>
  );
}

export function DirectionIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11 21 3l-8 18-2-8-8-2Z" />
    </svg>
  );
}

export function BackIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`rtl:-scale-x-100 ${className}`}
    >
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

export function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
