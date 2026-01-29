import {
  RiTwitterXFill,
  RiLinkedinFill,
  RiMailLine,
} from "@remixicon/react"
import Link from "next/link"
import { SolarLogo } from "@/components/landing/solar-logo"

const CURRENT_YEAR = new Date().getFullYear()

const Footer = () => {
  const sections = {
    product: {
      title: "Product",
      items: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Analytics", href: "#analytics" },
        { label: "Integrations", href: "#" },
        { label: "WhatsApp Popups", href: "#" },
      ],
    },
    resources: {
      title: "Resources",
      items: [
        { label: "Documentation", href: "#" },
        { label: "Help Center", href: "#" },
        { label: "Blog", href: "#" },
        { label: "API Reference", href: "#" },
      ],
    },
    company: {
      title: "Company",
      items: [
        { label: "About", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
      ],
    },
  }

  return (
    <div className="px-4 xl:px-0">
      <footer
        id="footer"
        className="relative mx-auto flex max-w-6xl flex-wrap pt-4"
      >
        {/* Vertical Lines */}
        <div className="pointer-events-none inset-0">
          <div
            className="absolute inset-y-0 -my-20 w-px"
            style={{
              maskImage: "linear-gradient(transparent, white 5rem)",
            }}
          >
            <svg className="h-full w-full" preserveAspectRatio="none">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                className="stroke-gray-300"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </svg>
          </div>
          <div
            className="absolute inset-y-0 right-0 -my-20 w-px"
            style={{
              maskImage: "linear-gradient(transparent, white 5rem)",
            }}
          >
            <svg className="h-full w-full" preserveAspectRatio="none">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                className="stroke-gray-300"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </svg>
          </div>
        </div>

        <svg
          className="mb-10 h-20 w-full border-y border-dashed border-gray-300 stroke-gray-300"
        >
          <defs>
            <pattern
              id="diagonal-footer-pattern"
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              {Array.from({ length: 17 }, (_, i) => {
                const offset = i * 8
                return (
                  <path
                    key={i}
                    d={`M${-106 + offset} 110L${22 + offset} -18`}
                    stroke=""
                    strokeWidth="1"
                  />
                )
              })}
            </pattern>
          </defs>
          <rect
            stroke="none"
            width="100%"
            height="100%"
            fill="url(#diagonal-footer-pattern)"
          />
        </svg>

        <div className="mr-auto flex w-full justify-between lg:w-fit lg:flex-col">
          <Link
            href="/"
            className="flex items-center font-medium text-gray-700 select-none sm:text-sm"
          >
            <SolarLogo className="ml-2 w-28" />
            <span className="sr-only">PopupGo Logo (go home)</span>
          </Link>

          <div>
            <div className="mt-4 flex items-center">
              <Link
                href="https://twitter.com/popupgo"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900"
              >
                <RiTwitterXFill className="size-5" />
              </Link>
              <Link
                href="https://linkedin.com/company/popupgo"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900"
              >
                <RiLinkedinFill className="size-5" />
              </Link>
              <Link
                href="mailto:hello@popupgo.in"
                className="rounded-sm p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900"
              >
                <RiMailLine className="size-5" />
              </Link>
            </div>
            <div className="ml-2 hidden text-sm text-gray-700 lg:inline">
              &copy; {CURRENT_YEAR} PopupGo. Made in India.
            </div>
          </div>
        </div>

        {/* Footer Sections */}
        {Object.entries(sections).map(([key, section]) => (
          <div key={key} className="mt-10 min-w-44 pl-2 lg:mt-0 lg:pl-0">
            <h3 className="mb-4 font-medium text-gray-900 sm:text-sm">
              {section.title}
            </h3>
            <ul className="space-y-4">
              {section.items.map((item) => (
                <li key={item.label} className="text-sm">
                  <Link
                    href={item.href}
                    className="text-gray-600 transition-colors duration-200 hover:text-gray-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Bottom copyright for mobile */}
        <div className="mt-10 w-full border-t border-gray-200 pt-6 pb-8 lg:hidden">
          <p className="text-center text-sm text-gray-500">
            &copy; {CURRENT_YEAR} PopupGo. Made in India.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Footer
