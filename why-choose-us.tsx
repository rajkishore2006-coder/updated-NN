import { Truck, Clock, Leaf, CreditCard, HeadphonesIcon, Award } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Free delivery on orders above ₹500. Same day delivery available.',
  },
  {
    icon: Leaf,
    title: 'Fresh Products',
    description: 'We source directly from farms to ensure freshness and quality.',
  },
  {
    icon: Clock,
    title: 'Fast Service',
    description: 'Quick order processing and delivery within 2-4 hours.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Multiple payment options with 100% secure transactions.',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Our customer support team is always ready to help you.',
  },
  {
    icon: Award,
    title: 'Best Quality',
    description: 'We guarantee the best quality products at competitive prices.',
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose NN Supermarket?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We&apos;re committed to providing the best shopping experience with quality products and excellent service
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/20"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
