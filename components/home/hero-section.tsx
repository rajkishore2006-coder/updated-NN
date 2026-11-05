'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Truck, Shield, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-background" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              Fresh & Organic Products
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Fresh Groceries
              <br />
              <span className="text-primary">Delivered Daily</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8">
              Experience the convenience of online grocery shopping with NN Supermarket. 
              Quality products at the best prices, delivered right to your doorstep.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Shop Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/shop?category=vegetables">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                  Explore Categories
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-border">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Free Delivery</p>
                <p className="text-xs text-muted-foreground">Orders above ₹500</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% Protected</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Fresh Quality</p>
                <p className="text-xs text-muted-foreground">Farm to Table</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Decorative circles */}
              <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
              <div className="absolute inset-8 rounded-full bg-primary/10" />
              
              {/* Main image container */}
              <div className="absolute inset-16 rounded-full overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop"
                  alt="Fresh groceries"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating product cards */}
              <div className="absolute -left-4 top-1/4 bg-card rounded-xl shadow-lg p-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100&h=100&fit=crop"
                      alt="Apple"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Fresh Apple</p>
                    <p className="text-sm text-primary font-bold">₹120/kg</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 bg-card rounded-xl shadow-lg p-3 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&h=100&fit=crop"
                      alt="Milk"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Fresh Milk</p>
                    <p className="text-sm text-primary font-bold">₹50/ltr</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
