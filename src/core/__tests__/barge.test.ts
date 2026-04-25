/**
 * Tests **gold standard** sur le profil barge parallélépipédique (Cb = 1).
 *
 * Ces tests servent de **non-régression numérique stricte** : pour une box pure,
 * les formules hydrostatiques du core deviennent analytiquement exactes (et non
 * plus approchées). Toute dérive sur ces valeurs signale un bug du moteur.
 *
 * Référence pédagogique : CMP §«Calcul du tirant d'eau — exemple barge 25 m».
 *
 * Constantes de validation (calculs à la main, valeurs fermées) :
 *   L = 25 m, B = 8 m, D = 3 m, TE = 1.5 m, KG = 1 m, Cb = 1, ρ = 1.025 t/m³
 *   V         = L · B · TE · Cb  = 25 · 8 · 1.5 · 1 = 300 m³
 *   Δ         = ρ · V            = 1.025 · 300       = 307.5 t
 *   KB        = TE / 2           = 0.75 m
 *   BM        = B² / (12 · TE)   = 64 / 18           ≈ 3.55555…  m
 *   KMt       = KB + BM          = 0.75 + 64/18      ≈ 4.30555…  m
 *   GMt       = KMt − KG         = 64/18 − 0.25      ≈ 3.30555…  m
 *   envAngle  = atan( (D−TE)/(B/2) ) = atan(0.375)   ≈ 20.5560°
 *
 * GZ wall-sided pour θ < envAngle (formule de Bouger pour box uniquement) :
 *   GZ(θ) = sin θ · ( GMt + ½ · BM · tan² θ )
 */

import { describe, expect, it } from "vitest";
import { freeSurfaceMoment } from "../freeSurface";
import { bm, computeB0, computeHydrostatics, envAngle, kb, kmt } from "../hydrostatics";
import { BARGE, RHO_FRESHWATER, RHO_SEAWATER, defaultInputs } from "../profiles";
import { gzAnalysis, gzAt, stabilityContext } from "../stability";

// ---------------------------------------------------------------------------
// Valeurs gold — calculs analytiques fermés
// ---------------------------------------------------------------------------

const GOLD = {
  L: 25,
  B: 8,
  D: 3,
  TE: 1.5,
  KG: 1.0,
  Cb: 1.0,
  V: 300, // L · B · TE · Cb
  disp: 307.5, // ρ_seawater · V
  KB: 0.75, // TE / 2
  BM: 64 / 18, // B² / (12 · TE)            (Cb=1 ⇒ exact)
  KMt: 0.75 + 64 / 18, // KB + BM
  GMt: 64 / 18 - 0.25, // KMt − KG
  envAngleDeg: (Math.atan(1.5 / 4) * 180) / Math.PI,
} as const;

/** Formule wall-sided (Bouger) pour box pure, θ < envAngle. */
function gzWallSided(thetaDeg: number, GMt: number, BM: number): number {
  const r = (thetaDeg * Math.PI) / 180;
  return Math.sin(r) * (GMt + 0.5 * BM * Math.tan(r) * Math.tan(r));
}

// ---------------------------------------------------------------------------
// 1. Profil — sanity check
// ---------------------------------------------------------------------------

describe("BARGE profile — definition sanity", () => {
  it("Cb = 1 (parallélépipède pur)", () => {
    expect(BARGE.Cb).toBe(1.0);
  });

  it("L = 25 m, hasTanks = false, tankLayout = none (pas de carène liquide)", () => {
    expect(BARGE.L).toBe(25);
    expect(BARGE.hasTanks).toBe(false);
    expect(BARGE.tankLayout).toBe("none");
  });

  it("ranges des sliders cohérents avec les valeurs par défaut", () => {
    expect(BARGE.B.def).toBeGreaterThanOrEqual(BARGE.B.min);
    expect(BARGE.B.def).toBeLessThanOrEqual(BARGE.B.max);
    expect(BARGE.D.def).toBeGreaterThanOrEqual(BARGE.D.min);
    expect(BARGE.TE.def).toBeGreaterThanOrEqual(BARGE.TE.min);
    expect(BARGE.KG.def).toBeGreaterThanOrEqual(BARGE.KG.min);
  });
});

// ---------------------------------------------------------------------------
// 2. Primitives — exactitude analytique
// ---------------------------------------------------------------------------

describe("BARGE — primitives analytiques exactes", () => {
  it("kb(TE) = TE/2 (exact)", () => {
    expect(kb(GOLD.TE)).toBe(GOLD.KB);
  });

  it("bm(B, TE, 1) = B²/(12·TE) (exact, Cb=1)", () => {
    // 64 / 18 ≈ 3.5555555…
    expect(bm(GOLD.B, GOLD.TE, GOLD.Cb)).toBeCloseTo(GOLD.BM, 12);
  });

  it("kmt = kb + bm (somme exacte)", () => {
    expect(kmt(GOLD.KB, GOLD.BM)).toBeCloseTo(GOLD.KMt, 12);
  });

  it("envAngle(B, D, TE) = atan((D−TE)/(B/2)) en degrés", () => {
    expect(envAngle(GOLD.B, GOLD.D, GOLD.TE)).toBeCloseTo(GOLD.envAngleDeg, 12);
    expect(GOLD.envAngleDeg).toBeCloseTo(20.556, 3);
  });

  it("freeSurfaceMoment ne s'applique pas à la barge (hasTanks=false), mais formule fermée si testée isolément", () => {
    // Formule i = L·B³/12 sans cloisons (n=0)
    expect(freeSurfaceMoment(GOLD.L, GOLD.B, 0)).toBeCloseTo(
      (GOLD.L * GOLD.B * GOLD.B * GOLD.B) / 12,
      9,
    );
  });
});

// ---------------------------------------------------------------------------
// 3. computeB0 — centre de carène à θ=0
// ---------------------------------------------------------------------------

describe("BARGE — computeB0 à θ=0 (centre géométrique exact)", () => {
  it("(bx, by) = (0, TE/2) à θ=0", () => {
    const b0 = computeB0(0, GOLD.B, GOLD.TE, GOLD.D);
    // Symétrie de l'intégration sur 500 bandes paires → bx exact = 0
    expect(b0.bx).toBeCloseTo(0, 12);
    expect(b0.by).toBeCloseTo(GOLD.KB, 6);
    // À θ=0, repère monde = repère navire
    expect(b0.wx).toBeCloseTo(0, 12);
    expect(b0.wy).toBeCloseTo(GOLD.KB, 6);
  });

  it("symétrie computeB0(θ) = mirror computeB0(−θ) sur bx", () => {
    for (const theta of [3, 5, 10, 15, 20]) {
      const pos = computeB0(theta, GOLD.B, GOLD.TE, GOLD.D);
      const neg = computeB0(-theta, GOLD.B, GOLD.TE, GOLD.D);
      expect(pos.bx).toBeCloseTo(-neg.bx, 6);
      expect(pos.by).toBeCloseTo(neg.by, 6);
    }
  });
});

// ---------------------------------------------------------------------------
// 4. computeHydrostatics — état d'équilibre par défaut
// ---------------------------------------------------------------------------

describe("BARGE — computeHydrostatics, inputs par défaut, eau de mer", () => {
  const inputs = defaultInputs(BARGE);
  const hydro = computeHydrostatics(inputs, BARGE);

  it("TEeff = TE (équilibre — masse base = ρ·V_base)", () => {
    expect(hydro.TEeff).toBeCloseTo(GOLD.TE, 9);
  });

  it("KB = TE/2 = 0.75 m", () => {
    expect(hydro.KB).toBeCloseTo(GOLD.KB, 9);
  });

  it("BM = B²/(12·TE) = 64/18 m", () => {
    expect(hydro.BM).toBeCloseTo(GOLD.BM, 9);
  });

  it("KMt = KB + BM ≈ 4.3056 m", () => {
    expect(hydro.KMt).toBeCloseTo(GOLD.KMt, 9);
  });

  it("eKG = KG = 1 m (pas de glace, pas de carène liquide)", () => {
    expect(hydro.eKG).toBe(GOLD.KG);
  });

  it("GMt = KMt − KG ≈ 3.3056 m (stable initial > 0)", () => {
    expect(hydro.GMt).toBeCloseTo(GOLD.GMt, 9);
    expect(hydro.GMt).toBeGreaterThan(0);
  });

  it("Δ = ρ·V = 307.5 t (eau de mer)", () => {
    expect(hydro.disp).toBeCloseTo(GOLD.disp, 9);
  });

  it("envAngle ≈ 20.5560°", () => {
    expect(hydro.envAngle).toBeCloseTo(GOLD.envAngleDeg, 9);
  });
});

// ---------------------------------------------------------------------------
// 5. Conservation Δ = ρ·V — invariance par changement de densité
// ---------------------------------------------------------------------------

describe("BARGE — conservation Δ = ρ·V (changement de milieu)", () => {
  it("eau douce : ρ=1.0 ⇒ TEeff augmente, Δ reste invariant (mass-base + ic)", () => {
    const seaInputs = defaultInputs(BARGE);
    const seaHydro = computeHydrostatics(seaInputs, BARGE);

    const freshInputs = { ...seaInputs, rho: RHO_FRESHWATER };
    const freshHydro = computeHydrostatics(freshInputs, BARGE);

    // La masse de référence est calculée à ρ_seawater (V1 legacy) ⇒ Δ identique
    expect(freshHydro.disp).toBeCloseTo(seaHydro.disp, 9);

    // En eau douce, la barge s'enfonce davantage : TEeff_eauDouce = TEeff_mer · (ρ_mer / ρ_douce)
    const expectedTEeff = (GOLD.TE * RHO_SEAWATER) / RHO_FRESHWATER; // 1.5375 m
    expect(freshHydro.TEeff).toBeCloseTo(expectedTEeff, 9);
  });

  it("avec glace ic=30 t : eKG monte, TEeff augmente, Δ = massBase + ic", () => {
    const inputs = { ...defaultInputs(BARGE), ic: 30 };
    const hydro = computeHydrostatics(inputs, BARGE);

    expect(hydro.disp).toBeCloseTo(GOLD.disp + 30, 9);

    // kgGlace = D + icingHeight = 3 + 1 = 4
    // eKG = (massBase·KG + ic·kgGlace) / massTotale = (307.5·1 + 30·4) / 337.5
    const expectedEkg = (GOLD.disp * GOLD.KG + 30 * 4) / (GOLD.disp + 30);
    expect(hydro.eKG).toBeCloseTo(expectedEkg, 9);
    expect(hydro.eKG).toBeGreaterThan(GOLD.KG); // glace remonte le centre de gravité
  });
});

// ---------------------------------------------------------------------------
// 6. GZ — formule wall-sided pour θ < envAngle (gold standard analytique)
// ---------------------------------------------------------------------------

describe("BARGE — GZ wall-sided (intégration numérique = formule fermée)", () => {
  const inputs = defaultInputs(BARGE);
  const hydro = computeHydrostatics(inputs, BARGE);
  const ctx = stabilityContext(inputs, hydro);

  it("GZ(0°) = 0 exact", () => {
    expect(gzAt(0, ctx)).toBeCloseTo(0, 12);
  });

  it("GZ(1°) ≈ GMt · sin(1°) — fige le SIGNE de la formule (non-régression)", () => {
    // Petit angle : la formule wall-sided dégénère vers GMt·sinθ. Ce test
    // détecterait toute inversion de signe future dans la définition de GZ.
    const numeric = gzAt(1, ctx);
    const linearized = GOLD.GMt * Math.sin((1 * Math.PI) / 180);
    expect(numeric).toBeCloseTo(linearized, 4);
    expect(numeric).toBeGreaterThan(0); // GMt > 0 ⇒ GZ > 0 à petit angle positif
  });

  it.each([
    [3, "petit angle quasi-linéaire"],
    [5, "angle modéré"],
    [10, "angle moyen, encore < envAngle"],
    [15, "proche envAngle (~5° de marge)"],
  ])("GZ(%d°) ≈ formule wall-sided (%s)", (theta) => {
    const numeric = gzAt(theta, ctx);
    const analytic = gzWallSided(theta, GOLD.GMt, GOLD.BM);
    // Tolérance 1 mm — l'intégration sur 500 bandes capture la box exactement
    expect(numeric).toBeCloseTo(analytic, 3);
  });

  it("GZmax à un angle proche de la position théorique de la box", () => {
    const analysis = gzAnalysis(ctx);
    expect(analysis.stableAtStart).toBe(true);
    expect(analysis.gzMax).toBeGreaterThan(0);
    // Pour une box symétrique de ce ratio, GZmax tombe au-delà de envAngle
    // (la formule wall-sided sous-estime, mais GZmax dépend du livet immergé)
    expect(analysis.gzMaxAngle).toBeGreaterThan(15);
    expect(analysis.gzMaxAngle).toBeLessThan(60);
    // Aire positive non triviale sous la courbe
    expect(analysis.area).toBeGreaterThan(0);
  });

  it("symétrie : GZ(θ) = −GZ(−θ) sur la barge (carène symétrique)", () => {
    for (const theta of [3, 5, 10, 15]) {
      expect(gzAt(theta, ctx)).toBeCloseTo(-gzAt(-theta, ctx), 6);
    }
  });
});

// ---------------------------------------------------------------------------
// 7. Sensibilité à B (formule cubique de la stabilité initiale)
// ---------------------------------------------------------------------------

describe("BARGE — sensibilité géométrique (BM ∝ B² / TE)", () => {
  it("doubler B quadruple BM (toutes choses égales par ailleurs)", () => {
    const bm1 = bm(GOLD.B, GOLD.TE, GOLD.Cb);
    const bm2 = bm(GOLD.B * 2, GOLD.TE, GOLD.Cb);
    expect(bm2).toBeCloseTo(bm1 * 4, 9);
  });

  it("doubler TE divise BM par 2", () => {
    const bm1 = bm(GOLD.B, GOLD.TE, GOLD.Cb);
    const bm2 = bm(GOLD.B, GOLD.TE * 2, GOLD.Cb);
    expect(bm2).toBeCloseTo(bm1 / 2, 9);
  });
});
