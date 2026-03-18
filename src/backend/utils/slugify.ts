export function slugifyTitleServer(title: string) {
  if (!title) return '';
  const normalized = title
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  return encodeURIComponent(normalized);
}
