function positive(n: number) {
  if (!Number.isFinite(n) || n <= 0)
    throw new RangeError("Expected positive finite value");
  return n;
}
export const advantage = (resistance: number, effort: number) =>
  positive(resistance) / positive(effort);
export function leverState(f1: number, d1: number, f2: number, d2: number) {
  const left = positive(f1) * positive(d1),
    right = positive(f2) * positive(d2);
  return {
    left,
    right,
    balanced: Math.abs(left - right) < 1e-8,
    angle:
      Math.abs(left - right) < 1e-8
        ? 0
        : Math.sign(right - left) *
          Math.min(16, (Math.abs(right - left) / Math.max(left, right)) * 16),
  };
}
export function pulleyState(
  load: number,
  pull: number,
  mode: "fixed" | "moving" | "combined",
) {
  positive(load);
  if (!Number.isFinite(pull) || pull < 0) throw new RangeError("pull");
  const strands = mode === "fixed" ? 1 : 2;
  return {
    strands,
    effort: load / strands,
    rise: pull / strands,
    advantage: strands,
  };
}
export function inclineState(load: number, height: number, length: number) {
  positive(load);
  positive(height);
  positive(length);
  if (length <= height) throw new RangeError("length must exceed height");
  return {
    effort: (load * height) / length,
    run: Math.sqrt(length * length - height * height),
    work: load * height,
    advantage: length / height,
  };
}
export function wheelState(radius: number, axle: number, effort: number) {
  positive(radius);
  positive(axle);
  positive(effort);
  if (radius <= axle) throw new RangeError("wheel > axle");
  return { advantage: radius / axle, output: (effort * radius) / axle };
}
export function screwAdvance(pitch: number, turns: number) {
  positive(pitch);
  if (!Number.isFinite(turns) || turns < 0) throw new RangeError("turns");
  return pitch * turns;
}
