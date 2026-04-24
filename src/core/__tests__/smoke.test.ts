import { describe, expect, it } from "vitest";

describe("bootstrap — chaîne de tests core", () => {
  it("Vitest répond correctement", () => {
    expect(1 + 1).toBe(2);
  });

  it("isFinite garde-fou pour core physique (NaN / Infinity rejetés)", () => {
    expect(Number.isFinite(1 / 0)).toBe(false);
    expect(Number.isFinite(Number.NaN)).toBe(false);
    expect(Number.isFinite(42)).toBe(true);
  });
});
