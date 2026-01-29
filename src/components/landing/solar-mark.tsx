import type { SVGProps } from "react"

export const SolarMark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 42 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Popup window icon */}
    <rect x="6" y="8" width="30" height="24" rx="4" fill="#F97316" />
    <rect x="10" y="12" width="22" height="3" rx="1.5" fill="white" />
    <rect x="10" y="18" width="16" height="2" rx="1" fill="white" fillOpacity="0.7" />
    <rect x="10" y="22" width="12" height="2" rx="1" fill="white" fillOpacity="0.5" />
    {/* Cursor/click indicator */}
    <circle cx="32" cy="28" r="6" fill="#0F172A" />
    <path
      d="M30 28L32 26L34 28"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
