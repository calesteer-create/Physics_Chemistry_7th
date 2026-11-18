import test from "node:test";
import assert from "node:assert/strict";
import { graphDistance, observerPositions, pathPoint, speedometerTip } from "../../src/lib/motion-model";

const near = (a: number, b: number, epsilon = 1e-8) => assert.ok(Math.abs(a - b) < epsilon, `${a} != ${b}`);

test("تغيير المرجع يحافظ على المسافات بين الأجسام", () => {
  for (const t of [0, 1, 4, 10, 20]) {
    const road = observerPositions(t, "road"), driver = observerPositions(t, "driver"), moon = observerPositions(t, "moon");
    near(road.bus - road.tree, driver.bus - driver.tree);
    near(road.bus - road.tree, moon.bus - moon.tree);
    near(road.walker - road.bus, driver.walker - driver.bus);
    near(road.walker - road.bus, moon.walker - moon.bus);
    near(driver.bus, 230);
  }
  assert.notEqual(observerPositions(1, "moon").tree, observerPositions(4, "moon").tree);
});

test("المسارات متصلة والدائرة نصف قطرها ثابت", () => {
  for (let i = 0; i <= 100; i++) {
    const p = pathPoint("circle", i / 100);
    near(Math.hypot(p.x - 320, p.y - 150), 90);
  }
  near(pathPoint("circle", 0).x, pathPoint("circle", 1).x);
  near(pathPoint("circle", 0).y, pathPoint("circle", 1).y);
  near((pathPoint("straight", 1).x - pathPoint("straight", 0).x) / 10, 52);
});

test("بيانات الرسم لا تتوقف عند الحد السابق", () => {
  near(graphDistance("accelerating", 8), 179.2);
  assert.ok(graphDistance("accelerating", 8) > graphDistance("accelerating", 7.9));
  near(graphDistance("uniform", 8), 144);
  near(graphDistance("stationary", 8), 0);
  near(graphDistance("decelerating", 8), 128);
  near(graphDistance("changing", 4), 48);
  near(graphDistance("changing", 8), 144);
});

test("مؤشر عداد السرعة يطابق التدريج في الطرفين والوسط", () => {
  const zero = speedometerTip(0), middle = speedometerTip(70), max = speedometerTip(140);
  near(zero.x, 40); near(zero.y, 120);
  near(middle.x, 110); near(middle.y, 50);
  near(max.x, 180); near(max.y, 120);
});
