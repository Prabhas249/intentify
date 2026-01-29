import type { SVGProps } from "react"

export const SolarLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 140 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Popup Icon */}
    <rect x="2" y="6" width="24" height="20" rx="3" fill="#F97316" />
    <rect x="5" y="9" width="18" height="2" rx="1" fill="white" />
    <rect x="5" y="13" width="14" height="2" rx="1" fill="white" fillOpacity="0.7" />
    <rect x="5" y="17" width="10" height="2" rx="1" fill="white" fillOpacity="0.5" />
    <circle cx="22" cy="22" r="4" fill="#0F172A" />
    <path d="M21 22L22.5 20.5L24 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* PopupGo Text */}
    <text x="32" y="22" fontFamily="system-ui, sans-serif" fontSize="18" fontWeight="600" fill="#0F172A">
      Popup<tspan fill="#F97316">Go</tspan>
    </text>
  </svg>
)
