import { describe, expect, it } from "vitest";
import { matchesAudience, normalizeRule, parseAttributesParam } from "@/lib/audience";

describe("matchesAudience", () => {
  it("shows a post with no rule to everyone", () => {
    expect(matchesAudience(null, {})).toBe(true);
    expect(matchesAudience(undefined, { plan: "free" })).toBe(true);
  });

  it("shows a post with an empty rule array to everyone", () => {
    expect(matchesAudience([], { plan: "free" })).toBe(true);
  });

  it("requires every condition to match (AND)", () => {
    const rule = [
      { attribute: "plan", value: "pro" },
      { attribute: "region", value: "eu" },
    ];
    expect(matchesAudience(rule, { plan: "pro", region: "eu" })).toBe(true);
    expect(matchesAudience(rule, { plan: "pro", region: "us" })).toBe(false);
    expect(matchesAudience(rule, { plan: "pro" })).toBe(false);
  });

  it("does not match when the visitor attribute is missing entirely", () => {
    const rule = [{ attribute: "plan", value: "pro" }];
    expect(matchesAudience(rule, {})).toBe(false);
  });

  it("ignores malformed rule input instead of throwing", () => {
    expect(matchesAudience("not-an-array", {})).toBe(true);
    expect(matchesAudience({ attribute: "plan" }, {})).toBe(true);
  });
});

describe("normalizeRule", () => {
  it("drops entries missing a value or with an empty attribute", () => {
    const input = [
      { attribute: "plan", value: "pro" },
      { attribute: "", value: "pro" },
      { attribute: "region" },
      "garbage",
      42,
      null,
    ];
    expect(normalizeRule(input)).toEqual([{ attribute: "plan", value: "pro" }]);
  });

  it("returns an empty array for non-array input", () => {
    expect(normalizeRule(null)).toEqual([]);
    expect(normalizeRule({})).toEqual([]);
  });
});

describe("parseAttributesParam", () => {
  it("parses a valid JSON object of string/number/boolean values", () => {
    expect(parseAttributesParam('{"plan":"pro","seats":5,"trial":false}')).toEqual({
      plan: "pro",
      seats: "5",
      trial: "false",
    });
  });

  it("returns an empty object for null, malformed JSON, or non-object JSON", () => {
    expect(parseAttributesParam(null)).toEqual({});
    expect(parseAttributesParam("not json")).toEqual({});
    expect(parseAttributesParam("[1,2,3]")).toEqual({});
    expect(parseAttributesParam('"just a string"')).toEqual({});
  });
});
