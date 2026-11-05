import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/home/hero-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { OffersSection } from '@/components/home/offers-section'
import { WhyChooseUs } from '@/components/home/why-choose-us'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <OffersSection />
      <WhyChooseUs />
      <Footer />
    </main>
  )
}
