export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.length > 0 ? base : "post";
}

/** slugExists should account for excluding the post being edited, via closure. */
export async function uniqueSlug(title: string, slugExists: (candidate: string) => Promise<boolean>): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let suffix = 1;
  while (await slugExists(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}
