"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

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

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] =
    useState<Product[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
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
                    product.featured === true
                )
                .map(
                  (product) => ({
                    id: product._id,

                    name: product.name,

                    price: product.price,

                    originalPrice:
                      product.originalPrice ??
                      undefined,

                    category:
                      product.category,

                    image:
                      product.image || "",

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

        setFeaturedProducts(
          formattedProducts
        )
      } catch (error) {
        console.error(
          "Failed to load featured products:",
          error
        )

        setFeaturedProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">

        {/* Header */}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">

          <div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Featured Products
            </h2>

            <p className="text-muted-foreground">
              Handpicked products just for you
            </p>

          </div>

          <Link href="/shop">

            <Button
              variant="outline"
              className="group"
            >
              View All Products

              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

          </Link>

        </div>

        {/* Loading */}

        {loading && (
          <div className="py-12 text-center text-muted-foreground">
            Loading featured products...
          </div>
        )}

        {/* Empty */}

        {!loading &&
          featuredProducts.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No featured products available.
            </div>
          )}

        {/* Products */}

        {!loading &&
          featuredProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

              {featuredProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}

            </div>
          )}

      </div>
    </section>
  )
}