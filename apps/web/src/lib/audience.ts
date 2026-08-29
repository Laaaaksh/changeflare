export interface AudienceCondition {
  attribute: string;
  value: string;
}

/** null/empty means "show to everyone". Every condition must match (AND) — deliberately not a segmentation engine. */
export type AudienceRule = AudienceCondition[] | null;

export function matchesAudience(rule: unknown, attributes: Record<string, string>): boolean {
  const conditions = normalizeRule(rule);
  if (conditions.length === 0) return true;
  return conditions.every((condition) => String(attributes[condition.attribute] ?? "") === condition.value);
}

export function normalizeRule(rule: unknown): AudienceCondition[] {
  if (!Array.isArray(rule)) return [];
  return rule.filter(
    (item): item is AudienceCondition =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as AudienceCondition).attribute === "string" &&
      typeof (item as AudienceCondition).value === "string" &&
      (item as AudienceCondition).attribute.length > 0,
  );
}

export function parseAttributesParam(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string") result[key] = value;
      else if (typeof value === "number" || typeof value === "boolean") result[key] = String(value);
    }
    return result;
  } catch {
    return {};
  }
}
