import { Header } from "./components/home/Header";
import { HeroSection } from "./components/home/HeroSection";
import { CategoriesSection } from "./components/home/CategoriesSection";
import { PlatformHighlightsSection } from "./components/home/PlatformHighlightsSection";
import { HowItWorksSection } from "./components/home/HowItWorksSection";
import { FeaturedFreelancersSection } from "./components/home/FeaturedFreelancersSection";
import { PopularServicesSection } from "./components/home/PopularServicesSection";
import { TestimonialsSection } from "./components/home/TestimonialsSection";
import { RoleCtaSection } from "./components/home/RoleCtaSection";
import { Footer } from "./components/home/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#111d31] font-sans">
      <Header />
      <HeroSection />
      <CategoriesSection />
      <PlatformHighlightsSection />
      <HowItWorksSection />
      <FeaturedFreelancersSection />
      <PopularServicesSection />
      <TestimonialsSection />
      <RoleCtaSection />
      <Footer />
    </main>
  );
}
