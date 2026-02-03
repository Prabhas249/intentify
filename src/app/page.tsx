import { LazyDither } from "@/components/landing/animations/lazy-dither";
import { CompanyShowcase } from "@/components/landing/section/company-showcase";
import { ConnectSection } from "@/components/landing/section/connection-section";
import { CTASection } from "@/components/landing/section/cta-section";
import { DemoSection } from "@/components/landing/section/demo-section";
import { FAQSection } from "@/components/landing/section/faq-section";
import { FeatureSection } from "@/components/landing/section/feature-section";
import { Footer } from "@/components/landing/section/footer";
import { HeroSection } from "@/components/landing/section/hero-section";
import { Navbar } from "@/components/landing/section/navbar";
import { PricingSection } from "@/components/landing/section/pricing-section";
import { TestimonialSection } from "@/components/landing/section/testimonial-section";
import { WorkflowConnectSection } from "@/components/landing/section/workflow-connect-section";
import { WorkflowSection } from "@/components/landing/section/workflow-section";

export default function Home() {
  return (
    <div className="px-4 lg:px-0 overflow-x-hidden">
      <div className="max-w-7xl mx-auto border-x border-border">
        <Navbar />
        <main className="flex flex-col divide-y divide-border pt-16">
          <HeroSection />
          <DemoSection />
          <CompanyShowcase />
          <WorkflowSection />
          <WorkflowConnectSection />
          <FeatureSection />
          <ConnectSection />
          {/* <TestimonialSection /> */}
          <PricingSection />
          <FAQSection />
          <CTASection />
          <Footer />
          <LazyDither />
        </main>
      </div>
    </div>
  );
}
