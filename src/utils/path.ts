/**
 * Joins path segments correctly for FTP navigation
 * Handles edge cases like leading/trailing slashes
 */
export function joinPath(base: string, segment: string): string {
  // If base is root, just add the segment with a leading slash
  if (base === "/" || base === "") {
    return `/${segment.replace(/^\//, "")}`;
  }
  // Otherwise join them with a single slash between
  return `${base.replace(/\/$/, "")}/${segment.replace(/^\//, "")}`;
}

/**
 * Normalizes a path to ensure it has correct slashes
 */
export function normalizePath(path: string): string {
  // Ensure path starts with / and doesn't have double slashes
  return `/${path.replace(/^\//, "").replace(/\/+/g, "/")}`;
}
