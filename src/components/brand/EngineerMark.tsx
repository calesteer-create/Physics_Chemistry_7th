/**
 * العلامة البصرية للمهندس سومر شاهين:
 * سداسيّ كيميائي يحتضن مدارًا ذريًا، وداخلهما الحرف «س» (أول حروف الاسم).
 * التدرّج الذهبي يميّز الهوية في الرأس والتذييل وداخل الدروس.
 */
export function EngineerMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="علامة المهندس سومر شاهين"
    >
      <defs>
        <linearGradient id="eng-gold" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0" stopColor="#F4DDAB" />
          <stop offset="0.55" stopColor="#E6C07A" />
          <stop offset="1" stopColor="#B98A37" />
        </linearGradient>
      </defs>
      {/* السداسي */}
      <path
        d="M32 3.5 57 17.75v28.5L32 60.5 7 46.25v-28.5L32 3.5Z"
        stroke="url(#eng-gold)"
        strokeWidth="2.6"
        fill="rgba(230,192,122,0.06)"
      />
      {/* المدار الذري */}
      <ellipse
        cx="32"
        cy="32"
        rx="21"
        ry="8.5"
        stroke="url(#eng-gold)"
        strokeWidth="1.6"
        opacity="0.75"
        transform="rotate(-24 32 32)"
      />
      {/* الإلكترون */}
      <circle cx="49.5" cy="23" r="3" fill="url(#eng-gold)" />
      {/* حرف س */}
      <text
        x="32"
        y="41.5"
        textAnchor="middle"
        fontFamily="'Cairo Variable', sans-serif"
        fontWeight="900"
        fontSize="24"
        fill="url(#eng-gold)"
      >
        س
      </text>
    </svg>
  );
}

/** كتلة «الاسم + الصفة» المرافقة للعلامة */
export function EngineerName({ compact = false }: { compact?: boolean }) {
  return (
    <span className="leading-tight">
      <span className="block text-[10.5px] font-bold text-[var(--color-gold)] opacity-90">
        {compact ? "تصميم وتطوير" : "تصميم وتطوير المهندس"}
      </span>
      <span className="block text-[15px] font-black text-[#f4ddab]">سومر شاهين</span>
    </span>
  );
}
