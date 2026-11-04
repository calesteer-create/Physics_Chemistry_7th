// Prototype-only structure. This is not curriculum content.
// Lessons form ONE ordered path. Subject is only a small tag, never a section.
// Real lesson numbers and titles are added later, in the book's order.

export const SUBJECT_LABELS = { physics: 'فيزياء', chemistry: 'كيمياء', demo: 'تجريبي' };

export const lessons = [
  { id: 'demo', title: 'رحلة في عالم الاكتشاف', tag: 'demo', number: null, demo: true },
];

// The ten stages, in the order required by the lesson structure.
// kind drives the rendering; placeholder text is shown until approved content exists.
export const stages = [
  { id: 'discover', label: 'اكتشف', title: 'اكتشاف وتمهيد', badge: 'تمهيد', kind: 'placeholder',
    intro: 'محطة لبدء الدرس بسؤال يثير الملاحظة والفضول.',
    placeholder: 'ستُضاف مقدمة الدرس وسؤال التمهيد بعد اعتماد المحتوى.' },
  { id: 'book', label: 'الكتاب', title: 'محتوى الكتاب', badge: 'من الكتاب', kind: 'placeholder',
    intro: 'هنا يظهر نص الكتاب كما هو، بترتيبه وعناوينه.',
    placeholder: 'سيُضاف نص الكتاب بعد استلام صور صفحاته.' },
  { id: 'explain', label: 'شرح', title: 'شرح مبسط وموسع', badge: 'شرح إضافي', kind: 'placeholder',
    intro: 'شرح إضافي مبسط يساعد على فهم ما ورد في الكتاب، ويبقى متميزاً عن نص الكتاب.',
    placeholder: 'سيُضاف الشرح المبسط بعد اعتماد محتوى الكتاب.' },
  { id: 'examples', label: 'أمثلة', title: 'أمثلة مفصلة', badge: 'شرح إضافي', kind: 'placeholder',
    intro: 'أمثلة مفصلة تطبّق الفكرة خطوة بخطوة.',
    placeholder: 'ستُضاف الأمثلة المفصلة بعد اعتماد المحتوى.' },
  { id: 'activity', label: 'نشاط', title: 'نشاط أو محاكاة', badge: 'نشاط تفاعلي', kind: 'activity',
    intro: 'نشاط أو محاكاة تفاعلية عند ملاءمتها للدرس.',
    placeholder: 'المحاكاة الفعلية ستُضاف لاحقاً. الاختيار أدناه لتجربة الواجهة فقط.' },
  { id: 'questions', label: 'أسئلة', title: 'أسئلة لفهم الطالب', badge: 'أسئلة وتغذية راجعة', kind: 'placeholder',
    intro: 'أسئلة لفهم الطالب، مع تغذية راجعة على كل إجابة.',
    placeholder: 'ستُضاف الأسئلة مع التغذية الراجعة بعد اعتماد المحتوى.' },
  { id: 'practice', label: 'تدريب', title: 'تدريب متدرج', badge: 'تدريب', kind: 'placeholder',
    intro: 'تدريب متدرج من السهل إلى الأصعب.',
    placeholder: 'سيُضاف التدريب المتدرج بعد اعتماد المحتوى.' },
  { id: 'test', label: 'اختبار', title: 'اختبار الدرس', badge: 'اختبار', kind: 'placeholder',
    intro: 'اختبار الدرس يُضاف بعد اعتماد محتوى الدرس.',
    placeholder: 'سيُضاف اختبار الدرس بعد اعتماد محتواه.' },
  { id: 'summary', label: 'ملخص', title: 'ملخص الدرس', badge: 'ملخص', kind: 'placeholder',
    intro: 'ملخص يجمع أهم أفكار الدرس.',
    placeholder: 'سيُضاف ملخص الدرس بعد اعتماد محتواه.' },
  { id: 'notebook', label: 'دفتري', title: 'دفتر الطالب', badge: 'دفتر الطالب', kind: 'notebook',
    intro: 'أقسام منظمة لأهم ما في الدرس. تُملأ عند توفر محتوى الدرس.' },
];

// Sections of the student notebook (the last stage). No teacher answers.
export const notebookSections = [
  { id: 'idea', title: 'الفكرة الأساسية' },
  { id: 'definitions', title: 'التعريفات' },
  { id: 'laws', title: 'القوانين والوحدات' },
  { id: 'diagrams', title: 'الرسوم والمخططات' },
  { id: 'procedures', title: 'خطوات التجارب والإجراءات' },
  { id: 'comparisons', title: 'المقارنات' },
  { id: 'mistakes', title: 'الأخطاء الشائعة' },
  { id: 'exam', title: 'النقاط المهمة للامتحان' },
  { id: 'checklist', title: 'قائمة المراجعة' },
];
