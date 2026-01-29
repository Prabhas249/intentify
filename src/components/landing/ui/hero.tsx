import { RiArrowRightLine } from "@remixicon/react"
import { FadeContainer, FadeDiv, FadeSpan } from "@/components/landing/fade"
import GameOfLife from "@/components/landing/ui/hero-background"
import Link from "next/link"

export function Hero() {
  return (
    <section aria-label="hero">
      <FadeContainer className="relative flex flex-col items-center justify-center">
        <FadeDiv className="mx-auto">
          <Link
            aria-label="View what's new"
            href="#features"
            className="mx-auto w-full"
          >
            <div className="inline-flex max-w-full items-center gap-3 rounded-full bg-white/5 px-2.5 py-0.5 pr-3 pl-0.5 font-medium text-gray-900 ring-1 shadow-lg shadow-orange-400/20 ring-black/10 filter backdrop-blur-[1px] transition-colors hover:bg-orange-500/5 focus:outline-hidden sm:text-sm">
              <span className="shrink-0 truncate rounded-full border bg-orange-50 px-2.5 py-1 text-sm text-orange-600 sm:text-xs">
                New
              </span>
              <span className="flex items-center gap-1 truncate">
                <span className="w-full truncate">
                  WhatsApp Popups + Intent Scoring
                </span>
                <RiArrowRightLine className="size-4 shrink-0 text-gray-700" />
              </span>
            </div>
          </Link>
        </FadeDiv>
        <h1 className="mt-8 text-center text-5xl font-semibold tracking-tighter text-gray-900 sm:text-8xl sm:leading-[1.1]">
          <FadeSpan>Smart Popups</FadeSpan> <FadeSpan>for</FadeSpan>
          <br />
          <FadeSpan>Indian</FadeSpan> <FadeSpan className="text-orange-500">D2C Brands</FadeSpan>
        </h1>
        <p className="mt-5 max-w-xl text-center text-base text-balance text-gray-600 sm:mt-8 sm:text-xl">
          <FadeSpan>Know your visitors. Show personalized popups.</FadeSpan>{" "}
          <FadeSpan>Convert more with visitor memory,</FadeSpan>{" "}
          <FadeSpan>intent scoring, and WhatsApp integration.</FadeSpan>
        </p>
        <FadeDiv className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            className="inline-flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg border-b-[1.5px] border-orange-700 bg-gradient-to-b from-orange-400 to-orange-500 px-6 py-3.5 text-base font-semibold tracking-wide text-white shadow-[0_0_0_2px_rgba(0,0,0,0.04),0_0_14px_0_rgba(255,255,255,0.19)] transition-all duration-200 ease-in-out hover:shadow-orange-300 hover:scale-[1.02]"
            href="/login"
          >
            Start Free
            <RiArrowRightLine className="size-5" />
          </Link>
          <Link
            className="inline-flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3.5 text-base font-semibold text-gray-900 shadow-sm transition-all duration-200 ease-in-out hover:bg-gray-50 hover:shadow-md"
            href="#features"
          >
            See How It Works
          </Link>
        </FadeDiv>

        {/* Stats Row */}
        <FadeDiv className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900">500+</div>
            <div className="text-sm text-gray-500 mt-1">Brands Trust Us</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900">2.4M+</div>
            <div className="text-sm text-gray-500 mt-1">Visitors Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-orange-500">147%</div>
            <div className="text-sm text-gray-500 mt-1">Avg Conversion Lift</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900">₹12Cr+</div>
            <div className="text-sm text-gray-500 mt-1">Revenue Generated</div>
          </div>
        </FadeDiv>

        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-50">
          <GameOfLife />
        </div>
      </FadeContainer>
    </section>
  )
}
