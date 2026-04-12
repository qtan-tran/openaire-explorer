/**
 * Shared utility functions used by both client and server.
 */

/**
 * Format an ISO date string to a human-readable short date.
 * Returns empty string for null/undefined.
 */
export function formatDate(
  dateStr: string | null | undefined,
  locale = "en-GB"
): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Truncate text to maxLength characters, appending ellipsis if cut.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Build a query string from a params object, omitting undefined/null values.
 * Returns a string WITHOUT a leading "?".
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.join("&");
}

/**
 * Safely get the first element of an array, or a fallback value.
 */
export function firstOf<T>(arr: T[] | null | undefined, fallback: T): T {
  return arr?.[0] ?? fallback;
}

/**
 * Strip HTML tags from a string (for rendering API descriptions safely).
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
