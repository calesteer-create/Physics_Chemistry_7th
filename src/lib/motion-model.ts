/** نماذج مبسطة للتجارب، بوحدات الرسم ما لم يذكر خلاف ذلك. */
export type MotionPath = "straight" | "curved" | "circle";
export type MotionGraphMode = "uniform" | "accelerating" | "decelerating" | "changing" | "stationary";
export type MotionReference = "road" | "driver" | "moon";

export function observerPositions(t: number, reference: MotionReference) {
  // The Moon view adds a deliberately simplified translation to the ground.
  const ground = reference === "moon" ? 45 * Math.sin(t * 0.15) : 0;
  const bus = ground + 180 + 60 * Math.sin(t * 0.4);
  const camera = reference === "driver" ? bus - 230 : 0;
  return { ground: ground - camera, bus: bus - camera,
    walker: bus - camera + 68 + 15 * Math.sin(t * 0.9), tree: 480 + ground - camera };
}

/** p runs once from zero to one; 10 drawing units represent one metre. */
export function pathPoint(path: MotionPath, p: number) {
  if (path === "straight") return { x: 60 + 520 * p, y: 150 };
  if (path === "curved") return { x: 60 + 520 * p, y: 150 - Math.sin(p * 2 * Math.PI) * 90 };
  return { x: 320 + 90 * Math.cos(p * 2 * Math.PI), y: 150 + 90 * Math.sin(p * 2 * Math.PI) };
}

export function graphDistance(mode: MotionGraphMode, seconds: number) {
  if (mode === "uniform") return 18 * seconds;
  if (mode === "accelerating") return 2.8 * seconds * seconds;
  if (mode === "decelerating") return 32 * seconds - 2 * seconds * seconds;
  if (mode === "changing") return seconds <= 4 ? 12 * seconds : 48 + 24 * (seconds - 4);
  return 0;
}

export function speedometerTip(value: number) {
  const angle = (value / 140 * 180 - 180) * Math.PI / 180;
  return { x: 110 + 70 * Math.cos(angle), y: 120 + 70 * Math.sin(angle) };
}
