import { NavBar } from "@/components/landing/ui/navbar"
import { Hero } from "@/components/landing/ui/hero"
import Features from "@/components/landing/ui/features"
import Testimonial from "@/components/landing/ui/testimonial"
import FeatureDivider from "@/components/landing/ui/feature-divider"
import { Map } from "@/components/landing/ui/Map/Map"
import { SolarAnalytics } from "@/components/landing/ui/solar-analytics"
import { CallToAction } from "@/components/landing/ui/call-to-action"
import Footer from "@/components/landing/ui/footer"

export default function Home() {
  return (
    <div className="bg-gray-50 selection:bg-orange-100">
    <NavBar />
    <main className="relative mx-auto flex flex-col">
      <div className="pt-56">
        <Hero />
      </div>

      <div className="mt-52 px-4 xl:px-0">
        <Features />
      </div>

      <div className="mt-32 px-4 xl:px-0">
        <Testimonial />
      </div>

      <FeatureDivider className="my-16 max-w-6xl" />

      <div className="px-4 xl:px-0">
        <Map />
      </div>

      <FeatureDivider className="my-16 max-w-6xl" />

      <div className="mt-12 mb-40 px-4 xl:px-0">
        <SolarAnalytics />
      </div>

      <div className="mt-10 mb-40 px-4 xl:px-0">
        <CallToAction />
      </div>
    </main>
    <Footer />
    </div>
  )
}
