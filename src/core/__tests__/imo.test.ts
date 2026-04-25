/**
 * Tests des critères IMO A.749 §3.1.2 (stabilité intacte).
 *
 * Profils de validation :
 *   - Tanker MR2 par défaut → tous les critères PASS (gros navire, GMt confortable)
 *   - Voilier 12 m par défaut → tous PASS (GMt = 1.25, lest)
 *   - Barge avec KG remonté → cas FAIL (GMt < 0.15)
 */

import { describe, expect, it } from "vitest";
import { computeHydrostatics } from "../hydrostatics";
import {
  IMO_AREA_0_30_MIN,
  IMO_AREA_0_40_MIN,
  IMO_AREA_30_40_MIN,
  IMO_GM0_MIN,
  IMO_GZMAX_ANGLE_MIN,
  IMO_GZ_AT_30_MIN,
  evaluateImoA749,
  integrateGz,
} from "../imo";
import { BARGE, SAILBOAT, TANKER, defaultInputs } from "../profiles";
import { stabilityContext } from "../stability";

// ---------------------------------------------------------------------------
// 1. Constantes — alignées sur la résolution A.749(18) §3.1.2
// ---------------------------------------------------------------------------

describe("IMO — constantes réglementaires", () => {
  it("seuils alignés sur A.749(18) §3.1.2", () => {
    expect(IMO_AREA_0_30_MIN).toBe(0.055);
    expect(IMO_AREA_0_40_MIN).toBe(0.09);
    expect(IMO_AREA_30_40_MIN).toBe(0.03);
    expect(IMO_GZ_AT_30_MIN).toBe(0.2);
    expect(IMO_GZMAX_ANGLE_MIN).toBe(25);
    expect(IMO_GM0_MIN).toBe(0.15);
  });
});

// ---------------------------------------------------------------------------
// 2. integrateGz — intégration partielle
// ---------------------------------------------------------------------------

describe("IMO — integrateGz (trapèze)", () => {
  const inputs = defaultInputs(TANKER);
  const hydro = computeHydrostatics(inputs, TANKER);
  const ctx = stabilityContext(inputs, hydro);

  it("intégrale [0,0] = 0", () => {
    expect(integrateGz(ctx, 0, 0)).toBe(0);
  });

  it("intervalle inversé (lo > hi) → 0", () => {
    expect(integrateGz(ctx, 30, 10)).toBe(0);
  });

  it("intervalle [0,30] sur tanker > seuil IMO 0.055 m·rad (navire stable)", () => {
    expect(integrateGz(ctx, 0, 30)).toBeGreaterThan(IMO_AREA_0_30_MIN);
  });

  it("additivité : aire(0,30) + aire(30,40) ≈ aire(0,40) sur la portion stable", () => {
    const a = integrateGz(ctx, 0, 30);
    const b = integrateGz(ctx, 30, 40);
    const c = integrateGz(ctx, 0, 40);
    expect(a + b).toBeCloseTo(c, 9);
  });

  it("bornes non entières gérées (interpolation)", () => {
    const fullDeg = integrateGz(ctx, 0, 30);
    const fineFraction = integrateGz(ctx, 0, 30.5);
    expect(fineFraction).toBeGreaterThan(fullDeg);
  });
});

// ---------------------------------------------------------------------------
// 3. Tanker MR2 — navire stable, devrait passer tous les critères
// ---------------------------------------------------------------------------

describe("IMO — tanker MR2 par défaut (navire stable, ALL PASS)", () => {
  const inputs = defaultInputs(TANKER);
  const hydro = computeHydrostatics(inputs, TANKER);
  const ctx = stabilityContext(inputs, hydro);
  const evalResult = evaluateImoA749(ctx, hydro.GMt, hydro.envAngle);

  it("(a) aire 0-30° ≥ 0.055 m·rad", () => {
    expect(evalResult.area_0_30.pass).toBe(true);
    expect(evalResult.area_0_30.value).toBeGreaterThanOrEqual(IMO_AREA_0_30_MIN);
  });

  it("(b) aire 0-40° (ou θf) ≥ 0.090 m·rad", () => {
    expect(evalResult.area_0_40.pass).toBe(true);
  });

  it("(c) aire 30-40° — non applicable si θf < 30° (tanker envAngle ≈ 21°)", () => {
    // A.749(18) §3.1.2(c) : « 30° ou θf si plus petit ». Si θf < 30°, la
    // fenêtre 30°→θf est vide → critère sans objet, pas FAIL.
    if (hydro.envAngle < 30) {
      expect(evalResult.area_30_40.applicable).toBe(false);
      expect(evalResult.area_30_40.pass).toBe(true); // non applicable ⇒ ne fait pas échouer allPass
    } else {
      expect(evalResult.area_30_40.applicable).toBe(true);
      expect(evalResult.area_30_40.pass).toBe(true);
    }
  });

  it("(d) GZ à 30° — non applicable si θf < 30° sur tanker (envahissement avant)", () => {
    if (hydro.envAngle < 30) {
      expect(evalResult.gz_at_30.applicable).toBe(false);
    }
    expect(evalResult.gz_at_30.pass).toBe(true);
  });

  it("(e) angle de GZmax ≥ 25°", () => {
    expect(evalResult.gz_max_angle.pass).toBe(true);
  });

  it("(f) GM₀ ≥ 0.15 m (tanker GMt ≈ 2.84 m, large marge)", () => {
    expect(evalResult.gm0.pass).toBe(true);
    expect(evalResult.gm0.value).toBeCloseTo(2.8415, 3);
  });

  it("allPass = true sur tanker malgré (c) et (d) non applicables (envahissement précoce)", () => {
    // Sémantique A.749 : non-applicable ne dégrade pas l'évaluation globale
    expect(evalResult.allPass).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Voilier 12 m — petit navire, doit avoir GMt > 0.15 m (lest profond)
// ---------------------------------------------------------------------------

describe("IMO — voilier 12 m (lest profond, GMt confortable)", () => {
  const inputs = defaultInputs(SAILBOAT);
  const hydro = computeHydrostatics(inputs, SAILBOAT);
  const ctx = stabilityContext(inputs, hydro);
  const evalResult = evaluateImoA749(ctx, hydro.GMt, hydro.envAngle);

  it("GM₀ ≈ 1.25 m, largement supérieur au seuil", () => {
    expect(evalResult.gm0.pass).toBe(true);
    expect(evalResult.gm0.value).toBeCloseTo(1.25, 3);
  });

  it("GZmax atteint à un angle ≥ 25°", () => {
    expect(evalResult.gz_max_angle.pass).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. Cas FAIL — GMt insuffisant
// ---------------------------------------------------------------------------

describe("IMO — cas pédagogique de non-conformité", () => {
  it("GM₀ < 0.15 m → critère (f) FAIL, allPass = false", () => {
    // Barge avec KG très haut → GMt très petit, voire négatif
    const inputs = { ...defaultInputs(BARGE), KG: 4.25 }; // KMt ≈ 4.31, donc GMt ≈ 0.06
    const hydro = computeHydrostatics(inputs, BARGE);
    const ctx = stabilityContext(inputs, hydro);
    const evalResult = evaluateImoA749(ctx, hydro.GMt, hydro.envAngle);
    expect(evalResult.gm0.pass).toBe(false);
    expect(evalResult.gm0.value).toBeLessThan(IMO_GM0_MIN);
    expect(evalResult.allPass).toBe(false);
  });

  it("GMt < 0 strict → critère (e) non applicable (instable au repos)", () => {
    // Barge KG=5 → GMt ≈ -0.69 → analysis.stableAtStart = false
    const inputs = { ...defaultInputs(BARGE), KG: 5.0 };
    const hydro = computeHydrostatics(inputs, BARGE);
    const ctx = stabilityContext(inputs, hydro);
    const evalResult = evaluateImoA749(ctx, hydro.GMt, hydro.envAngle);
    expect(evalResult.gz_max_angle.applicable).toBe(false);
    // Mais (f) reste FAIL car applicable et GM₀ < 0.15
    expect(evalResult.gm0.applicable).toBe(true);
    expect(evalResult.gm0.pass).toBe(false);
    expect(evalResult.allPass).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 6. Sémantique des labels et structures
// ---------------------------------------------------------------------------

describe("IMO — structure de la sortie", () => {
  const inputs = defaultInputs(TANKER);
  const hydro = computeHydrostatics(inputs, TANKER);
  const ctx = stabilityContext(inputs, hydro);
  const evalResult = evaluateImoA749(ctx, hydro.GMt, hydro.envAngle);

  it("chaque check expose value, min, pass, applicable, label", () => {
    for (const check of [
      evalResult.area_0_30,
      evalResult.area_0_40,
      evalResult.area_30_40,
      evalResult.gz_at_30,
      evalResult.gz_max_angle,
      evalResult.gm0,
    ]) {
      expect(typeof check.value).toBe("number");
      expect(typeof check.min).toBe("number");
      expect(typeof check.pass).toBe("boolean");
      expect(typeof check.applicable).toBe("boolean");
      expect(typeof check.label).toBe("string");
      expect(check.label.length).toBeGreaterThan(0);
    }
  });

  it("envAngle < 40° remonte dans les labels (b) et (c)", () => {
    // tanker envAngle ≈ 21° → labels devraient mentionner 21°
    if (hydro.envAngle < 40) {
      expect(evalResult.area_0_40.label).toContain(hydro.envAngle.toFixed(1));
    }
  });
});
