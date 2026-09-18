"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { useDictionary } from "@/lib/i18n/LocaleContext";

type NavIcon = () => ReactElement;

export default function BottomNav() {
  const pathname = usePathname();
  const dict = useDictionary();

  const items = [
    { href: "/", label: dict.nav.home, icon: HomeIcon },
    { href: "/masjids", label: dict.nav.masjids, icon: DomeIcon },
    { href: "/bookmarks", label: dict.nav.bookmarks, icon: BookmarkIcon },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-card border-t border-black/5">
      <div className="max-w-md mx-auto grid grid-cols-3 items-center px-2 pb-[calc(env(safe-area-inset-bottom))]">
        {items.map((item) => (
          <NavItem key={item.href} item={item} active={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  item,
  active,
}: {
  item: { href: string; label: string; icon: NavIcon };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center gap-1 py-2.5 text-[11px] leading-none ${
        active ? "text-brand" : "text-muted"
      }`}
    >
      <Icon />
      {item.label}
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function DomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20v-6a8 8 0 0 1 16 0v6" />
      <path d="M2 20h20M12 6V2M10 4h4" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}
