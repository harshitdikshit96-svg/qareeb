const STORAGE_KEY = "qareeb:bookmarks";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("qareeb:bookmarks-changed"));
}

export function getBookmarks(): string[] {
  return read();
}

export function isBookmarked(id: string): boolean {
  return read().includes(id);
}

export function toggleBookmark(id: string): boolean {
  const current = read();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  write(next);
  return next.includes(id);
}
