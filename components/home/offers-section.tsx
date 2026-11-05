"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Percent } from "lucide-react"

import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"

import { API_ROOT_URL } from "@/lib/api"
import type { Product } from "@/lib/products"

interface ApiProduct {
  _id: string
  name: string
  price: number
  originalPrice?: number | null
  category: string
  image?: string
  unit?: string
  stockQuantity?: number
  description?: string
  featured?: boolean
  offer?: boolean
  offerLabel?: string
  rating?: number
}

export function OffersSection() {
  const [offerProducts, setOfferProducts] =
    useState<Product[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    const fetchOfferProducts = async () => {
      try {
        setLoading(true)

        const response = await fetch(
          `${API_ROOT_URL}/products`,
          {
            method: "GET",
          }
        )

        const data =
          await response
            .json()
            .catch(() => null)

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to fetch products"
          )
        }

        const formattedProducts: Product[] =
          Array.isArray(data)
            ? (data as ApiProduct[])
                .filter(
                  (product) =>
                    product.offer === true
                )
                .map(
                  (product) => ({
                    id:
                      product._id,

                    name:
                      product.name,

                    price:
                      product.price,

                    originalPrice:
                      product.originalPrice ??
                      undefined,

                    category:
                      product.category,

                    image:
                      product.image ||
                      "",

                    unit:
                      product.unit ||
                      "1 unit",

                    inStock:
                      Number(
                        product.stockQuantity ??
                          0
                      ) > 0,

                    featured:
                      product.featured ??
                      false,

                    offer:
                      product.offer
                        ? product.offerLabel ||
                          "Offer"
                        : undefined,

                    rating:
                      product.rating ??
                      0,

                    description:
                      product.description ||
                      "",
                  })
                )
            : []

        setOfferProducts(
          formattedProducts
        )
      } catch (error) {
        console.error(
          "Failed to load offer products:",
          error
        )

        setOfferProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchOfferProducts()
  }, [])

  return (
    <section className="py-16 lg:py-24 bg-background">

      <div className="container mx-auto px-4">

        {/* Promo Banner */}

        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12 mb-12">

          <div className="absolute inset-0 opacity-10">

            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />

          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

            <div className="text-center md:text-left">

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm mb-4">

                <Percent className="w-4 h-4" />

                Limited Time Offer

              </div>

              <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">
                Get 20% Off on Your First Order!
              </h3>

              <p className="text-white/80 max-w-lg">
                Sign up now and enjoy exclusive discounts on fresh groceries.
                Use code: FIRST20
              </p>

            </div>

            <Link href="/auth">

              <Button
                size="lg"
                variant="secondary"
                className="whitespace-nowrap"
              >

                Sign Up Now

                <ArrowRight className="w-5 h-5 ml-2" />

              </Button>

            </Link>

          </div>

        </div>

        {/* Offers Header */}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">

          <div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Special Offers
            </h2>

            <p className="text-muted-foreground">
              Grab these deals before they&apos;re gone!
            </p>

          </div>

          <Link href="/shop">

            <Button
              variant="outline"
              className="group"
            >

              View All Offers

              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />

            </Button>

          </Link>

        </div>

        {/* Loading */}

        {loading && (

          <div className="py-12 text-center text-muted-foreground">
            Loading offers...
          </div>

        )}

        {/* Empty */}

        {!loading &&
          offerProducts.length === 0 && (

            <div className="py-12 text-center text-muted-foreground">
              No offers available.
            </div>

          )}

        {/* Products */}

        {!loading &&
          offerProducts.length > 0 && (

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

              {offerProducts.map(
                (product) => (

                  <ProductCard
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                  />

                )
              )}

            </div>

          )}

      </div>

    </section>
  )
}