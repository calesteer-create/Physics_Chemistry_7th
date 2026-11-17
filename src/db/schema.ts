import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * ملف تعريف الطالب — يُنشأ عند تسجيل الاسم من منطقة الطالب.
 */
export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * تقدّم الطالب داخل درس معيّن: آخر مرحلة وصل إليها، المراحل المكتملة،
 * وهل طالع «دفتر الطالب» (المرحلة الأخيرة).
 */
export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug").notNull(),
    stageIndex: integer("stage_index").notNull().default(0),
    completedStages: jsonb("completed_stages").$type<number[]>().notNull().default([]),
    notebookViewed: boolean("notebook_viewed").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("lesson_progress_student_lesson").on(t.studentId, t.lessonSlug)],
);

/**
 * محاولات الاختبارات — تُسجَّل النتيجة بعد التصحيح في جهة الخادم فقط.
 */
export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  quizId: text("quiz_id").notNull(),
  lessonSlug: text("lesson_slug"),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  answers: jsonb("answers").$type<Record<string, string | string[] | number | null>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * قواعد التأليف العالمية للمشروع — تُحفظ هنا كي تُطبَّق على كل درس مستقبلي.
 * تحفظ الملاحظات التي يثبتها المستخدم أثناء تطوير الدرس الأول.
 */
export const projectAuthoringRules = pgTable("project_authoring_rules", {
  code: text("code").primaryKey(),
  scope: text("scope").notNull(),
  title: text("title").notNull(),
  details: text("details").notNull(),
  mandatory: boolean("mandatory").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
