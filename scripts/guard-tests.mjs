#!/usr/bin/env node
/**
 * حارس تنفيذ الاختبارات.
 *
 * لماذا هذا الملف موجود:
 * `node --test` يُرجع رمز خروج 0 حتى لو لم يُنفَّذ أي تأكيد (ملف بلا اختبارات، أو
 * اختبارات تتجاوز نفسها). لذلك فإن «الخطوة خضراء في CI» ليست دليلاً على أن شيئاً
 * فُحص فعلاً — وهذا بالضبط ما سمح لمشكلة قسم المراجعة الأصلية بالمرور.
 *
 * هذا الحارس يشغّل أمر الاختبار، يقرأ مخرجات TAP، ثم:
 *   - يفشل إذا وُجد أي اختبار متجاوَز (skipped) — التجاوز الصامت ممنوع.
 *   - يفشل إذا وُجد أي اختبار فاشل.
 *   - يفشل إذا كان عدد الناجحة أقل من الحد الأدنى المتوقّع (أي أن الاختبارات
 *     لم تُنفَّذ فعلاً).
 *
 * بهذا يصبح معنى «الخطوة خضراء»: العدد المتوقّع من التأكيدات نُفِّذ فعلاً ونجح.
 *
 * الاستخدام:
 *   node scripts/guard-tests.mjs --min 11 --label navigation -- <command...>
 */
import { spawn } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const argv = process.argv.slice(2);
let min = 1;
let label = "tests";
let i = 0;
for (; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--") break;
  if (a === "--min") min = Number(argv[++i]);
  else if (a === "--label") label = argv[++i];
  else if (a.startsWith("--min=")) min = Number(a.slice(6));
  else if (a.startsWith("--label=")) label = a.slice(8);
}
const cmd = argv.slice(i + 1);
if (cmd.length === 0) {
  console.error("guard-tests: لا يوجد أمر لتشغيله بعد --");
  process.exit(2);
}

const shellCommand = cmd.join(" ");
const child = spawn(shellCommand, { shell: true, stdio: ["ignore", "pipe", "pipe"] });

let out = "";
child.stdout.on("data", (d) => {
  const s = d.toString();
  out += s;
  process.stdout.write(s);
});
child.stderr.on("data", (d) => {
  const s = d.toString();
  out += s;
  process.stderr.write(s);
});

child.on("close", (code) => {
  // TAP: "# pass 11" / "# fail 0" / "# skipped 0" — قد تتكرّر لكل ملف اختبار.
  const sum = (key) => {
    const re = new RegExp(`^# ${key} (\\d+)$`, "gm");
    let total = 0;
    for (const m of out.matchAll(re)) total += Number(m[1]);
    return total;
  };
  const pass = sum("pass");
  const fail = sum("fail");
  const skipped = sum("skipped");
  const tests = sum("tests");

  const lines = [];
  const fail_ = (msg) => {
    lines.push(`### ❌ ${label}`);
    lines.push("");
    lines.push(msg);
    lines.push("");
    lines.push(`اختبارات: ${tests} · ناجحة: ${pass} · فاشلة: ${fail} · متجاوَزة: ${skipped}`);
    emit(lines);
    process.exit(1);
  };
  const emit = (arr) => {
    const text = arr.join("\n");
    console.log("\n" + text + "\n");
    if (process.env.GITHUB_STEP_SUMMARY) {
      try {
        appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + "\n\n");
      } catch {
        /* ليس في CI */
      }
    }
  };

  if (code !== 0) fail_(`فشل أمر الاختبار برمز خروج ${code}.`);
  if (fail > 0) fail_(`يوجد ${fail} اختباراً فاشلاً.`);
  // ممنوع التجاوز الصامت: أي skip يُفشل الخطوة.
  if (skipped > 0) fail_(`يوجد ${skipped} اختباراً متجاوَزاً — التجاوز الصامت ممنوع.`);
  // الحارس الأساسي: العدد المتوقّع نُفِّذ فعلاً.
  if (pass < min) {
    fail_(
      `عدد الاختبارات الناجحة (${pass}) أقل من الحد الأدنى المتوقّع (${min}) — ` +
        `الاختبارات لم تُنفَّذ فعلاً أو تم تجاوزها.`,
    );
  }

  // دليل قابل للتنزيل من صفحة التشغيل: عدد التأكيدات المنفَّذة فعلاً.
  if (process.env.GUARD_EVIDENCE_DIR) {
    try {
      mkdirSync(process.env.GUARD_EVIDENCE_DIR, { recursive: true });
      appendFileSync(
        join(process.env.GUARD_EVIDENCE_DIR, "executed-tests.txt"),
        `${label}\tنُفِّذ=${tests}\tناجح=${pass}\tفاشل=${fail}\tمتجاوَز=${skipped}\tالحد الأدنى=${min}\n`,
      );
    } catch {
      /* لا يوقف الحارس */
    }
  }

  lines.push(`### ✅ ${label}`);
  lines.push("");
  lines.push(
    `نُفِّذ فعلياً: **${tests}** اختباراً — ناجحة: **${pass}** · فاشلة: **0** · متجاوَزة: **0** ` +
      `(الحد الأدنى المتوقّع: ${min}).`,
  );
  emit(lines);
  process.exit(0);
});
