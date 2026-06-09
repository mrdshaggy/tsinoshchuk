export default function Logo({ size = 44 }) {
  return (
    <svg
      width={size}
      viewBox="0 0 248 340"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M124 0 C55 0 0 55 0 124 C0 196 124 320 124 320 C124 320 248 196 248 124 C248 55 193 0 124 0 Z" fill="#2563EB" />
      <circle cx="124" cy="120" r="72" fill="white" opacity="0.97" />

      <path d="M88 104 Q88 84 108 84" fill="none" stroke="#2563EB" strokeWidth="7" strokeLinecap="round" />
      <path d="M140 84 Q160 84 160 104" fill="none" stroke="#2563EB" strokeWidth="7" strokeLinecap="round" />

      <rect x="74" y="106" width="100" height="60" rx="10" fill="#2563EB" />

      <line x1="100" y1="108" x2="100" y2="164" stroke="white" strokeWidth="2" opacity="0.35" />
      <line x1="124" y1="108" x2="124" y2="164" stroke="white" strokeWidth="2" opacity="0.35" />
      <line x1="148" y1="108" x2="148" y2="164" stroke="white" strokeWidth="2" opacity="0.35" />
      <line x1="75" y1="134" x2="173" y2="134" stroke="white" strokeWidth="2" opacity="0.35" />

      <circle cx="166" cy="156" r="22" fill="#16A34A" />
      <line x1="166" y1="142" x2="166" y2="160" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <polyline points="156,153 166,164 176,153" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
