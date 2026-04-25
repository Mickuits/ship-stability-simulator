/**
 * Tests du module `freeSurface` — formule l³L/12 + cloisonnement + correction de KG.
 *
 * Référence pédagogique : CMP §«Effet de carène liquide par les chiffres».
 *
 * Formule de base :  i = L · B³ / ( 12 · (n+1)² )
 * Correction KG    :  Δ = ρ_cargo · i · fsRatio  /  ( ρ_eau · V )
 */

import { describe, expect, it } from "vitest";
import { bulkheadsFromLayout, freeSurfaceCorrection, freeSurfaceMoment } from "../freeSurface";

// ---------------------------------------------------------------------------
// 1. bulkheadsFromLayout — mapping layout → nombre de cloisons
// ---------------------------------------------------------------------------

describe("freeSurface — bulkheadsFromLayout", () => {
  it("maps layouts to bulkhead counts", () => {
    expect(bulkheadsFromLayout("none")).toBe(-1);
    expect(bulkheadsFromLayout("single")).toBe(0);
    expect(bulkheadsFromLayout("double")).toBe(1);
    expect(bulkheadsFromLayout("triple")).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 2. freeSurfaceMoment — formule L·B³/(12·(n+1)²)
// ---------------------------------------------------------------------------

describe("freeSurface — freeSurfaceMoment (formule fermée)", () => {
  it("n=0 (cuve unique) : i = L·B³/12", () => {
    expect(freeSurfaceMoment(174, 32.2, 0)).toBeCloseTo((174 * 32.2 ** 3) / 12, 1);
    expect(freeSurfaceMoment(10, 6, 0)).toBeCloseTo((10 * 216) / 12, 9);
  });

  it("n=1 (double) : i = L·B³/48 (un quart de la valeur sans cloison)", () => {
    const iZero = freeSurfaceMoment(174, 32.2, 0);
    const iOne = freeSurfaceMoment(174, 32.2, 1);
    expect(iOne / iZero).toBeCloseTo(0.25, 9);
    // V1 form: 2 · L · (B/2)³ / 12
    const v1 = (2 * 174 * (32.2 / 2) ** 3) / 12;
    expect(iOne).toBeCloseTo(v1, 3);
  });

  it("n=2 (triple) : i = L·B³/108 = un neuvième", () => {
    const iZero = freeSurfaceMoment(174, 32.2, 0);
    const iTwo = freeSurfaceMoment(174, 32.2, 2);
    expect(iTwo / iZero).toBeCloseTo(1 / 9, 9);
  });

  it("n=3 (4 cloisons hypothétiques) : i = i_base / 16 (vérification scaling)", () => {
    const iZero = freeSurfaceMoment(174, 32.2, 0);
    const iThree = freeSurfaceMoment(174, 32.2, 3);
    expect(iThree / iZero).toBeCloseTo(1 / 16, 9);
  });

  it("dépendance cubique en B : doubler B multiplie i par 8", () => {
    const i1 = freeSurfaceMoment(10, 5, 0);
    const i2 = freeSurfaceMoment(10, 10, 0);
    expect(i2 / i1).toBeCloseTo(8, 9);
  });

  it("retourne 0 sur inputs invalides (L≤0, B≤0, NaN, Infinity)", () => {
    expect(freeSurfaceMoment(0, 10, 1)).toBe(0);
    expect(freeSurfaceMoment(10, 0, 1)).toBe(0);
    expect(freeSurfaceMoment(-5, 10, 1)).toBe(0);
    expect(freeSurfaceMoment(10, -5, 1)).toBe(0);
    expect(freeSurfaceMoment(Number.NaN, 10, 1)).toBe(0);
    expect(freeSurfaceMoment(10, Number.NaN, 1)).toBe(0);
    expect(freeSurfaceMoment(Number.POSITIVE_INFINITY, 10, 1)).toBe(0);
  });

  it("bulkheads négatif est traité comme 0 (clamp)", () => {
    const expected = (10 * 216) / 12;
    expect(freeSurfaceMoment(10, 6, -3)).toBeCloseTo(expected, 9);
  });

  it("bulkheads non entier est tronqué (Math.floor)", () => {
    const i = freeSurfaceMoment(10, 6, 1.7);
    const expected = freeSurfaceMoment(10, 6, 1);
    expect(i).toBeCloseTo(expected, 9);
  });
});

// ---------------------------------------------------------------------------
// 3. freeSurfaceCorrection — correction de KG complète
// ---------------------------------------------------------------------------

describe("freeSurface — freeSurfaceCorrection", () => {
  const baseInputs = {
    L: 174,
    B: 32.2,
    tankLayout: "double" as const,
    fsRatio: 1,
    cargoDensity: 0.85,
    rho: 1.025,
    V: 60958.464, // ≈ L·B·TE·Cb tanker
  };

  it("tankLayout='none' → correction = 0 (sentinelle)", () => {
    expect(freeSurfaceCorrection({ ...baseInputs, tankLayout: "none" })).toBe(0);
  });

  it("fsRatio = 0 → correction = 0", () => {
    expect(freeSurfaceCorrection({ ...baseInputs, fsRatio: 0 })).toBe(0);
  });

  it("fsRatio négatif ou NaN → 0 (pas d'effet pervers)", () => {
    expect(freeSurfaceCorrection({ ...baseInputs, fsRatio: -0.5 })).toBe(0);
    expect(freeSurfaceCorrection({ ...baseInputs, fsRatio: Number.NaN })).toBe(0);
  });

  it("V ≤ 0 ou ρ ≤ 0 → 0 (évite division par zéro)", () => {
    expect(freeSurfaceCorrection({ ...baseInputs, V: 0 })).toBe(0);
    expect(freeSurfaceCorrection({ ...baseInputs, V: -100 })).toBe(0);
    expect(freeSurfaceCorrection({ ...baseInputs, rho: 0 })).toBe(0);
    expect(freeSurfaceCorrection({ ...baseInputs, rho: -1 })).toBe(0);
  });

  it("cargoDensity ≤ 0 ou NaN → 0 (pas de correction négative perverse)", () => {
    expect(freeSurfaceCorrection({ ...baseInputs, cargoDensity: 0 })).toBe(0);
    expect(freeSurfaceCorrection({ ...baseInputs, cargoDensity: -0.5 })).toBe(0);
    expect(freeSurfaceCorrection({ ...baseInputs, cargoDensity: Number.NaN })).toBe(0);
  });

  it("formule : Δ = ρ_cargo · i · fsRatio / (ρ_eau · V) — vérification numérique", () => {
    const { L, B, fsRatio, cargoDensity, rho, V } = baseInputs;
    const i = freeSurfaceMoment(L, B, 1); // double → 1 cloison
    const expected = (cargoDensity * i * fsRatio) / (rho * V);
    expect(freeSurfaceCorrection(baseInputs)).toBeCloseTo(expected, 9);
  });

  it("ratio linéaire en fsRatio (interpolation linéaire entre 0 et 1)", () => {
    const halfFs = freeSurfaceCorrection({ ...baseInputs, fsRatio: 0.5 });
    const fullFs = freeSurfaceCorrection(baseInputs);
    expect(halfFs).toBeCloseTo(fullFs * 0.5, 9);
  });

  it("triple < double < single (cloisonnement réduit l'effet)", () => {
    const single = freeSurfaceCorrection({ ...baseInputs, tankLayout: "single" });
    const double = freeSurfaceCorrection({ ...baseInputs, tankLayout: "double" });
    const triple = freeSurfaceCorrection({ ...baseInputs, tankLayout: "triple" });
    expect(double).toBeLessThan(single);
    expect(triple).toBeLessThan(double);
    // Ratios analytiques exacts : triple/single = 1/9, double/single = 1/4
    expect(double / single).toBeCloseTo(0.25, 9);
    expect(triple / single).toBeCloseTo(1 / 9, 9);
  });

  it("cargoDensity influence linéairement la correction (eau douce = 1, brut = 0.85)", () => {
    const water = freeSurfaceCorrection({ ...baseInputs, cargoDensity: 1.0 });
    const oil = freeSurfaceCorrection({ ...baseInputs, cargoDensity: 0.85 });
    expect(oil / water).toBeCloseTo(0.85, 9);
  });

  it("à V immergé constant, ρ ambiante divise la correction", () => {
    const sea = freeSurfaceCorrection({ ...baseInputs, rho: 1.025 });
    const fresh = freeSurfaceCorrection({ ...baseInputs, rho: 1.0 });
    // Δ_eauDouce / Δ_eauMer = ρ_mer / ρ_douce = 1.025
    expect(fresh / sea).toBeCloseTo(1.025, 9);
  });
});
