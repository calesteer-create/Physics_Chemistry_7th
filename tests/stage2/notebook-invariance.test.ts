/** Baseline of the complete ordered notebook data and lesson title at b0557a3.
 * A change requires explicit approval; a newly published lesson must acquire its
 * own reviewed baseline without altering any of the existing ones. */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { listLessons } from "../../src/content/registry";

const baseline: Record<string, string> = {
  "platform-orientation": "ced181969a16d872527d69cc3b2c90f8cdd34a20c07694280c5e0b2188111530",
  "motion-and-rest": "3c6c15db863fcd452bfa693aea65cd8da8ba935ca496f04f3b2db2c2537608e4",
  "force-and-motion": "2e3afb768c31ac5a810cd8cd013928abd29244f929610c8701c34e42185dcc0f",
  "forces-on-one-support": "f706a2f841c299bd73707957661e37810849ab6f17b30002a0a79d80155577bf",
};

test("محتوى دفتر الطالب وبنيته وترتيبه مطابق لخط الأساس المعتمد", () => {
  const lessons = listLessons().filter((lesson) => lesson.status === "published");
  assert.deepEqual(lessons.map((lesson) => lesson.slug).sort(), Object.keys(baseline).sort(),
    "أضف خط أساس مُراجعاً لأي درس جديد دون تغيير خطوط الأساس السابقة");
  for (const lesson of lessons) {
    const data = JSON.stringify({ title: lesson.title, notebook: lesson.notebook });
    const hash = createHash("sha256").update(data, "utf8").digest("hex");
    assert.equal(hash, baseline[lesson.slug], lesson.slug);
  }
});
