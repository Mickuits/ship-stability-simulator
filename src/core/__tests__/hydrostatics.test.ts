import { describe, expect, it } from "vitest";
import { freeSurfaceMoment } from "../freeSurface";
import { bm, computeB0, computeHydrostatics, envAngle, gmt, kb, kmt } from "../hydrostatics";
import { SAILBOAT, TANKER, defaultInputs } from "../profiles";

describe("hydrostatics — primitives (kb / bm / kmt / gmt)", () => {
  it("kb(TE) = TE/2 pour TE > 0", () => {
    expect(kb(12.8)).toBe(6.4);
    expect(kb(1.8)).toBe(0.9);
  });

  it("kb retourne 0 pour TE ≤ 0 ou non fini", () => {
    expect(kb(0)).toBe(0);
    expect(kb(-5)).toBe(0);
    expect(kb(Number.NaN)).toBe(0);
    expect(kb(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("bm(B, TE, Cb) = B² / (12·TE·Cb) — tanker MR2", () => {
    // 32.2² / (12·12.8·0.85) = 1036.84 / 130.56 ≈ 7.9415
    expect(bm(32.2, 12.8, 0.85)).toBeCloseTo(7.9415, 3);
  });

  it("bm — voilier 12 m", () => {
    // 3.6² / (12·1.8·0.48) = 12.96 / 10.368 = 1.25 exact
    expect(bm(3.6, 1.8, 0.48)).toBeCloseTo(1.25, 6);
  });

  it("bm = 0 si TE ≤ 0.01 (garde-fou V1 « BM = Infinity »)", () => {
    expect(bm(32.2, 0, 0.85)).toBe(0);
    expect(bm(32.2, 0.005, 0.85)).toBe(0);
    expect(bm(32.2, 0.01, 0.85)).toBe(0);
  });

  it("bm = 0 si Cb ≤ 0 ou B ≤ 0 ou inputs non finis", () => {
    expect(bm(32.2, 12.8, 0)).toBe(0);
    expect(bm(32.2, 12.8, -0.5)).toBe(0);
    expect(bm(0, 12.8, 0.85)).toBe(0);
    expect(bm(Number.NaN, 12.8, 0.85)).toBe(0);
    expect(bm(32.2, Number.POSITIVE_INFINITY, 0.85)).toBe(0);
  });

  it("kmt(KB, BM) est une simple somme", () => {
    expect(kmt(6.4, 7.9415)).toBeCloseTo(14.3415, 4);
    expect(kmt(0, 0)).toBe(0);
  });

  it("gmt(KMt, eKG) — GMt positif = stable initialement", () => {
    expect(gmt(14.3415, 11.5)).toBeCloseTo(2.8415, 4);
    expect(gmt(2.15, 0.9)).toBeCloseTo(1.25, 6);
    expect(gmt(10, 15)).toBe(-5); // GMt négatif = navire instable
  });
});

describe("hydrostatics — envAngle", () => {
  it("angle d'envahissement tanker : atan((D−TE)/(B/2)) ≈ 21.05°", () => {
    // tan⁻¹(6.2 / 16.1) × 180/π
    expect(envAngle(32.2, 19, 12.8)).toBeCloseTo(21.05, 1);
  });

  it("angle d'envahissement voilier : ≈ 23.96°", () => {
    expect(envAngle(3.6, 2.6, 1.8)).toBeCloseTo(23.96, 1);
  });

  it("retourne 0 si le pont est sous l'eau (franc-bord négatif)", () => {
    expect(envAngle(32.2, 12.8, 19)).toBe(0);
    expect(envAngle(32.2, 12.8, 12.8)).toBe(0);
  });
});

describe("hydrostatics — freeSurfaceMoment (formule l³L/12 + cloisonnement)", () => {
  it("n=0 (citerne unique) : i = L·B³/12", () => {
    expect(freeSurfaceMoment(174, 32.2, 0)).toBeCloseTo((174 * 32.2 ** 3) / 12, 1);
  });

  it("n=1 (double) : i = L·B³/48 = V1 formula 2·L·(B/2)³/12", () => {
    const i = freeSurfaceMoment(174, 32.2, 1);
    const v1Formula = (2 * 174 * (32.2 / 2) ** 3) / 12;
    expect(i).toBeCloseTo(v1Formula, 3);
  });

  it("cloisonnement double l'efficacité d'amortissement : i(n=1) = i(n=0) / 4", () => {
    const iZero = freeSurfaceMoment(174, 32.2, 0);
    const iOne = freeSurfaceMoment(174, 32.2, 1);
    expect(iOne / iZero).toBeCloseTo(0.25, 3);
  });

  it("retourne 0 pour inputs invalides", () => {
    expect(freeSurfaceMoment(0, 10, 1)).toBe(0);
    expect(freeSurfaceMoment(10, 0, 1)).toBe(0);
    expect(freeSurfaceMoment(Number.NaN, 10, 1)).toBe(0);
  });
});

describe("hydrostatics — computeB0 (numérique, 500 bandes)", () => {
  it("θ=0° : B' centré sous la flottaison, bx=0, by≈TE/2", () => {
    const b0 = computeB0(0, 32.2, 12.8, 19);
    expect(b0.bx).toBeCloseTo(0, 3);
    expect(b0.by).toBeCloseTo(6.4, 3);
    expect(b0.wx).toBeCloseTo(0, 3);
    expect(b0.wy).toBeCloseTo(6.4, 3);
  });

  it("θ=30° tribord : bx > 0 (B' se décale tribord), GZ potentiel positif", () => {
    const b0 = computeB0(30, 32.2, 12.8, 19);
    expect(b0.bx).toBeGreaterThan(0);
    expect(b0.wx).toBeGreaterThan(0);
  });

  it("θ=−30° bâbord : bx < 0 (symétrie)", () => {
    const b0 = computeB0(-30, 32.2, 12.8, 19);
    expect(b0.bx).toBeLessThan(0);
  });

  it("symétrie gîte : bx(θ) ≈ −bx(−θ), by(θ) ≈ by(−θ)", () => {
    const pos = computeB0(25, 32.2, 12.8, 19);
    const neg = computeB0(-25, 32.2, 12.8, 19);
    expect(pos.bx).toBeCloseTo(-neg.bx, 3);
    expect(pos.by).toBeCloseTo(neg.by, 3);
  });

  it("θ=90° : branche cos≈0, B' côté tribord uniquement", () => {
    const b0 = computeB0(90, 32.2, 12.8, 19);
    // Seule la moitié tribord (x > 0) est immergée, colonne pleine (yDeck → yKeel)
    // → bx = B/4 (centroïde en x d'un demi-rectangle)
    expect(b0.bx).toBeCloseTo(32.2 / 4, 2);
    // by = ymid = (yDeck + yKeel) / 2 = (-(D-TE) + TE) / 2 = (2·TE - D) / 2
    const expectedBy = (2 * 12.8 - 19) / 2;
    expect(b0.by).toBeCloseTo(expectedBy, 2);
  });

  it("inputs non finis (NaN, Infinity) → fallback {bx:0, by:0.05} (garde-fou V1)", () => {
    expect(computeB0(Number.NaN, 32.2, 12.8, 19)).toEqual({
      bx: 0,
      by: 0.05,
      wx: 0,
      wy: 0.05,
    });
    expect(computeB0(30, Number.POSITIVE_INFINITY, 12.8, 19)).toEqual({
      bx: 0,
      by: 0.05,
      wx: 0,
      wy: 0.05,
    });
    expect(computeB0(30, 32.2, Number.NaN, 19)).toEqual({
      bx: 0,
      by: 0.05,
      wx: 0,
      wy: 0.05,
    });
  });

  it("dimensions nulles ou négatives → fallback", () => {
    expect(computeB0(0, 0, 12.8, 19).by).toBe(0.05);
    expect(computeB0(0, 32.2, 0, 19).by).toBe(0.05);
    expect(computeB0(0, 32.2, 12.8, 0).by).toBe(0.05);
    expect(computeB0(0, -5, 12.8, 19).by).toBe(0.05);
  });
});

describe("hydrostatics — computeHydrostatics (tanker MR2 default)", () => {
  const inputs = defaultInputs(TANKER);
  const hydro = computeHydrostatics(inputs, TANKER);

  it("TEeff = TE slider quand rho = rho_ref (cas trivial)", () => {
    expect(hydro.TEeff).toBeCloseTo(12.8, 6);
  });

  it("KB = 6.4, BM ≈ 7.94, KMt ≈ 14.34, GMt ≈ 2.84", () => {
    expect(hydro.KB).toBeCloseTo(6.4, 6);
    expect(hydro.BM).toBeCloseTo(7.9415, 3);
    expect(hydro.KMt).toBeCloseTo(14.3415, 3);
    expect(hydro.GMt).toBeCloseTo(2.8415, 3);
  });

  it("eKG = KG structural quand pas de givrage ni carène liquide", () => {
    expect(hydro.eKG).toBe(11.5);
  });

  it("envAngle ≈ 21.05°", () => {
    expect(hydro.envAngle).toBeCloseTo(21.05, 1);
  });

  it("déplacement ≈ 62 482 t (V = L·B·TE·Cb × ρ_seawater)", () => {
    expect(hydro.disp).toBeCloseTo(62482.43, 1);
  });

  it("mom = 0 (rempli par computeSimState, pas par computeHydrostatics)", () => {
    expect(hydro.mom).toBe(0);
  });
});

describe("hydrostatics — computeHydrostatics (voilier 12 m default)", () => {
  const inputs = defaultInputs(SAILBOAT);
  const hydro = computeHydrostatics(inputs, SAILBOAT);

  it("KB = 0.9, BM = 1.25 exact, GMt = 1.25", () => {
    expect(hydro.KB).toBeCloseTo(0.9, 6);
    expect(hydro.BM).toBeCloseTo(1.25, 6);
    expect(hydro.KMt).toBeCloseTo(2.15, 6);
    expect(hydro.GMt).toBeCloseTo(1.25, 6);
  });

  it("envAngle ≈ 23.96°", () => {
    expect(hydro.envAngle).toBeCloseTo(23.96, 1);
  });

  it("déplacement ≈ 38.26 t", () => {
    expect(hydro.disp).toBeCloseTo(38.26, 2);
  });
});

describe("hydrostatics — givrage (ice embarquée en hauteur)", () => {
  it("ic > 0 → eKG > KG structural (centre de masse remonte)", () => {
    const inputs = { ...defaultInputs(TANKER), ic: 500 };
    const hydro = computeHydrostatics(inputs, TANKER);
    expect(hydro.eKG).toBeGreaterThan(11.5);
    // Le TE effectif doit aussi augmenter (masse totale plus grande)
    expect(hydro.TEeff).toBeGreaterThan(12.8);
  });

  it("ic = 0 → eKG = KG inchangé", () => {
    const inputs = defaultInputs(TANKER);
    const hydro = computeHydrostatics(inputs, TANKER);
    expect(hydro.eKG).toBe(11.5);
  });
});

describe("hydrostatics — carène liquide (tankLayout double)", () => {
  it("fsRatio > 0 sur tanker → eKG augmente, GMt diminue", () => {
    const dry = computeHydrostatics(defaultInputs(TANKER), TANKER);
    const wet = computeHydrostatics({ ...defaultInputs(TANKER), fsRatio: 1 }, TANKER);
    expect(wet.eKG).toBeGreaterThan(dry.eKG);
    expect(wet.GMt).toBeLessThan(dry.GMt);
  });

  it("fsRatio = 0 → aucune correction", () => {
    const a = computeHydrostatics(defaultInputs(TANKER), TANKER);
    const b = computeHydrostatics({ ...defaultInputs(TANKER), fsRatio: 0 }, TANKER);
    expect(b.eKG).toBe(a.eKG);
  });

  it("voilier (tankLayout none) : fsRatio ignoré, pas de correction", () => {
    const inputs = { ...defaultInputs(SAILBOAT), fsRatio: 1 };
    const hydro = computeHydrostatics(inputs, SAILBOAT);
    expect(hydro.eKG).toBe(0.9);
  });

  it("clamp défensif fsRatio : 1.5 traité comme 1", () => {
    const ratio1 = computeHydrostatics({ ...defaultInputs(TANKER), fsRatio: 1 }, TANKER);
    const ratioOverflow = computeHydrostatics({ ...defaultInputs(TANKER), fsRatio: 1.5 }, TANKER);
    expect(ratioOverflow.eKG).toBe(ratio1.eKG);
  });

  it("clamp défensif fsRatio : −0.3 traité comme 0 (pas de correction négative)", () => {
    const dry = computeHydrostatics(defaultInputs(TANKER), TANKER);
    const negative = computeHydrostatics({ ...defaultInputs(TANKER), fsRatio: -0.3 }, TANKER);
    expect(negative.eKG).toBe(dry.eKG);
  });

  it("cargoDensity pétrole (0.85) donne une correction inférieure à ρ=1.0", () => {
    // À fsRatio=1, correction = ρ_cargo · i · 1 / (ρ_eau · V). Tanker cargoDensity=0.85
    const tanker085 = computeHydrostatics({ ...defaultInputs(TANKER), fsRatio: 1 }, TANKER);
    const tanker10 = computeHydrostatics(
      { ...defaultInputs(TANKER), fsRatio: 1 },
      { ...TANKER, cargoDensity: 1.0 },
    );
    // Le tanker à 0.85 a une correction plus faible → eKG plus bas
    expect(tanker085.eKG).toBeLessThan(tanker10.eKG);
    // Ratio ≈ 0.85 sur la correction
    const dry = computeHydrostatics(defaultInputs(TANKER), TANKER);
    const corr085 = tanker085.eKG - dry.eKG;
    const corr10 = tanker10.eKG - dry.eKG;
    expect(corr085 / corr10).toBeCloseTo(0.85, 2);
  });
});

describe("hydrostatics — densité eau ambiante (rho)", () => {
  it("eau douce (ρ=1.0) → TEeff > TE slider (navire s'enfonce davantage)", () => {
    const inputs = { ...defaultInputs(TANKER), rho: 1.0 };
    const hydro = computeHydrostatics(inputs, TANKER);
    expect(hydro.TEeff).toBeGreaterThan(12.8);
  });

  it("eau très salée (ρ=1.030) → TEeff < TE slider (navire remonte)", () => {
    const inputs = { ...defaultInputs(TANKER), rho: 1.03 };
    const hydro = computeHydrostatics(inputs, TANKER);
    expect(hydro.TEeff).toBeLessThan(12.8);
  });

  it("conservation de masse : Δ ≈ ρ · V sur le TEeff", () => {
    const inputs = { ...defaultInputs(TANKER), rho: 1.015 };
    const hydro = computeHydrostatics(inputs, TANKER);
    const V = TANKER.L * inputs.B * hydro.TEeff * TANKER.Cb;
    expect(hydro.disp).toBeCloseTo(inputs.rho * V, 1);
  });

  it("ρ = 0 → fallback TEeff = TE slider (division évitée)", () => {
    const inputs = { ...defaultInputs(TANKER), rho: 0 };
    const hydro = computeHydrostatics(inputs, TANKER);
    expect(hydro.TEeff).toBe(inputs.TE);
  });

  it("ρ < 0 → fallback TEeff = TE slider (robustesse, pas de valeur physique)", () => {
    const inputs = { ...defaultInputs(TANKER), rho: -1 };
    const hydro = computeHydrostatics(inputs, TANKER);
    expect(hydro.TEeff).toBe(inputs.TE);
  });
});

describe("hydrostatics — robustesse ic (masse glace)", () => {
  it("ic < 0 (valeur aberrante) → fallback gracieux, pas de NaN", () => {
    // ic négatif peut rendre massTotale négative → TEeff négatif → KB=0 par guard
    const inputs = { ...defaultInputs(TANKER), ic: -100 };
    const hydro = computeHydrostatics(inputs, TANKER);
    expect(Number.isFinite(hydro.KB)).toBe(true);
    expect(Number.isFinite(hydro.BM)).toBe(true);
    expect(Number.isFinite(hydro.GMt)).toBe(true);
    expect(Number.isFinite(hydro.disp)).toBe(true);
  });

  it("ic = 0 → eKG inchangé, pas de pondération", () => {
    const a = computeHydrostatics(defaultInputs(TANKER), TANKER);
    const b = computeHydrostatics({ ...defaultInputs(TANKER), ic: 0 }, TANKER);
    expect(a.eKG).toBe(b.eKG);
  });
});
