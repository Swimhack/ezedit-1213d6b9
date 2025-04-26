
/**
 * Joins path segments correctly for FTP navigation
 * Handles edge cases like leading/trailing slashes
 */
export function joinPath(base: string, segment: string): string {
  // If base is root, just add the segment without multiple slashes
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
  if (!path) return "/";
  
  // Ensure path starts with / and doesn't have double slashes
  const normalized = `/${path.replace(/^\//, "").replace(/\/+/g, "/")}`;
  
  // Log for debugging
  console.log(`[normalizePath] Original: "${path}" → Normalized: "${normalized}"`);
  
  return normalized;
}
