import { computeB0 } from "./hydrostatics";
import type { GzAnalysis, GzPoint, Hydrostatics, SimInputs } from "./types";

/**
 * Contexte géométrique et masse minimal pour calculer GZ à un angle arbitraire.
 * Déduit de `Hydrostatics` + `SimInputs`, évite de traîner tout le SimState.
 */
export interface StabilityContext {
  /** Largeur au maître (m). */
  readonly B: number;
  /** Hauteur de pont (m). */
  readonly D: number;
  /** TE effectif (m). */
  readonly TEeff: number;
  /** KG effectif, incluant corrections givrage + carène liquide (m). */
  readonly eKG: number;
}

/** Construit un StabilityContext à partir d'un état hydrostatique + inputs. */
export function stabilityContext(inputs: SimInputs, hydro: Hydrostatics): StabilityContext {
  return {
    B: inputs.B,
    D: inputs.D,
    TEeff: hydro.TEeff,
    eKG: hydro.eKG,
  };
}

/**
 * Bras de levier de redressement GZ (m) pour un angle de gîte donné.
 * GZ = B'.wx − (eKG − TEeff) · sin(θ).
 *
 * Ref: CMP référentiel §«Moment de redressement» — GZ diminue aux grands
 * angles car le métacentre Mt descend vers h−a.
 */
export function gzAt(theta: number, ctx: StabilityContext): number {
  const b0 = computeB0(theta, ctx.B, ctx.TEeff, ctx.D);
  const rad = (theta * Math.PI) / 180;
  return b0.wx - (ctx.eKG - ctx.TEeff) * Math.sin(rad);
}

/**
 * Échantillonne la courbe GZ sur [−range, +range] au pas de 1°.
 * @param range Borne symétrique (deg). Défaut 180 comme V1.
 */
export function gzPoints(ctx: StabilityContext, range = 180): readonly GzPoint[] {
  const pts: GzPoint[] = [];
  for (let a = -range; a <= range; a++) {
    pts.push({ a, g: gzAt(a, ctx) });
  }
  return pts;
}

/**
 * Analyse la courbe GZ sur [0°, 180°] pour en extraire les critères de stabilité.
 *
 * Ref: CMP référentiel §«Moment de redressement» + §«Bilan des situations de
 * stabilité liés à la position des centres» (les 4 cas a/b/c/d).
 *
 * Règle V1 (navire instable) : si GZ(1°), GZ(2°) ou GZ(3°) est ≤ 0, le navire
 * chavire immédiatement — GZmax = 0, vanAngle = 0.
 *
 * Sinon :
 * - gzMax = max(GZ) sur 0..180°
 * - vanAngle = premier zéro de GZ (interpolation linéaire entre les deux échantillons encadrants)
 * - area = intégrale trapèze de GZ positive sur [0, vanAngle] (stabilité dynamique, rad·m)
 */
export function gzAnalysis(ctx: StabilityContext): GzAnalysis {
  const gz: number[] = [];
  for (let a = 0; a <= 180; a++) gz.push(gzAt(a, ctx));

  const g1 = gz[1] ?? 0;
  const g2 = gz[2] ?? 0;
  const g3 = gz[3] ?? 0;
  const stableAtStart = g1 > 0 && g2 > 0 && g3 > 0;

  if (!stableAtStart) {
    return { stableAtStart: false, gzMax: 0, gzMaxAngle: 0, vanAngle: 0, area: 0 };
  }

  let gzMax = 0;
  let gzMaxAngle = 0;
  for (let a = 0; a <= 180; a++) {
    const g = gz[a] ?? 0;
    if (g > gzMax) {
      gzMax = g;
      gzMaxAngle = a;
    }
  }

  let vanAngle = 0;
  for (let a = 1; a <= 180; a++) {
    const prev = gz[a - 1] ?? 0;
    const curr = gz[a] ?? 0;
    if (prev > 0 && curr <= 0) {
      const frac = prev / (prev - curr);
      vanAngle = a - 1 + frac;
      break;
    }
  }

  const upper = vanAngle > 0 ? vanAngle : 90;
  let area = 0;
  for (let a = 0; a < upper && a < 180; a++) {
    const g = gz[a] ?? 0;
    const gNext = gz[a + 1] ?? 0;
    if (g > 0 && gNext > 0) {
      area += ((g + gNext) / 2) * (Math.PI / 180);
    }
  }

  return { stableAtStart: true, gzMax, gzMaxAngle, vanAngle, area };
}
