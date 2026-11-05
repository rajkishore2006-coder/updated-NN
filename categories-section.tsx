'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Apple,
  Carrot,
  Milk,
  Cookie,
  Coffee,
  Home,
  Sparkles,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { API_ROOT_URL } from '@/lib/api'

// ============================================
// TYPES
// ============================================

interface ApiProduct {
  _id: string
  name: string
  category: string
  price: number
  stockQuantity?: number
}

// ============================================
// CATEGORY DEFINITIONS
// ============================================

const categoryDefinitions = [
  {
    id: 'fruits',
    name: 'Fruits',
    icon: Apple,
    color:
      'bg-red-50 text-red-500 hover:bg-red-100',
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    icon: Carrot,
    color:
      'bg-green-50 text-green-600 hover:bg-green-100',
  },
  {
    id: 'dairy',
    name: 'Dairy',
    icon: Milk,
    color:
      'bg-blue-50 text-blue-500 hover:bg-blue-100',
  },
  {
    id: 'snacks',
    name: 'Snacks',
    icon: Cookie,
    color:
      'bg-amber-50 text-amber-500 hover:bg-amber-100',
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: Coffee,
    color:
      'bg-orange-50 text-orange-500 hover:bg-orange-100',
  },
  {
    id: 'household',
    name: 'Household',
    icon: Home,
    color:
      'bg-purple-50 text-purple-500 hover:bg-purple-100',
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: Sparkles,
    color:
      'bg-pink-50 text-pink-500 hover:bg-pink-100',
  },
]

// ============================================
// CATEGORY TYPE
// ============================================

interface Category {
  id: string
  name: string
  icon: typeof Apple
  color: string
  count: number
  linkCategory: string
}

// ============================================
// COMPONENT
// ============================================

export function CategoriesSection() {
  const [categories, setCategories] =
    useState<Category[]>(
      categoryDefinitions.map(
        (category) => ({
          ...category,
          count: 0,
          linkCategory:
            category.id,
        })
      )
    )

  const [loading, setLoading] =
    useState(true)

  // ============================================
  // FETCH CATEGORY COUNTS
  // ============================================

  useEffect(() => {
    const fetchCategoryCounts =
      async () => {
        try {
          setLoading(true)

          const response =
            await fetch(
              `${API_ROOT_URL}/products`,
              {
                method: 'GET',
              }
            )

          const data =
            await response
              .json()
              .catch(() => null)

          if (!response.ok) {
            throw new Error(
              data?.message ||
                'Failed to fetch products'
            )
          }

          const products: ApiProduct[] =
            Array.isArray(data)
              ? data
              : []

          const updatedCategories =
            categoryDefinitions.map(
              (category) => {
                const matchingProducts =
                  products.filter(
                    (product) =>
                      product.category
                        ?.trim()
                        .toLowerCase() ===
                      category.name
                        .trim()
                        .toLowerCase()
                  )

                // Use the actual database
                // category value for the link
                // when available.
                const actualCategory =
                  matchingProducts.length >
                  0
                    ? matchingProducts[0]
                        .category
                    : category.id

                return {
                  ...category,
                  count:
                    matchingProducts.length,
                  linkCategory:
                    actualCategory,
                }
              }
            )

          setCategories(
            updatedCategories
          )
        } catch (error) {
          console.error(
            'FAILED TO LOAD CATEGORY COUNTS:',
            error
          )

          // Keep categories visible even
          // if backend is unavailable.
          setCategories(
            categoryDefinitions.map(
              (category) => ({
                ...category,
                count: 0,
                linkCategory:
                  category.id,
              })
            )
          )
        } finally {
          setLoading(false)
        }
      }

    fetchCategoryCounts()
  }, [])

  // ============================================
  // RENDER
  // ============================================

  return (
    <section className="py-16 lg:py-24 bg-background">

      <div className="container mx-auto px-4">

        {/* HEADER */}

        <div className="text-center mb-12">

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Shop by Category
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse through our wide range of categories and find exactly what you need
          </p>

        </div>

        {/* CATEGORIES */}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">

          {categories.map(
            (category) => {
              const Icon =
                category.icon

              return (
                <Link
                  key={
                    category.id
                  }
                  href={`/shop?category=${encodeURIComponent(
                    category.linkCategory
                  )}`}
                >

                  <Card
                    className={`group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 ${category.color}`}
                  >

                    <CardContent className="p-6 text-center">

                      <div className="w-14 h-14 mx-auto rounded-2xl bg-white/80 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">

                        <Icon className="w-7 h-7" />

                      </div>

                      <h3 className="font-semibold text-foreground mb-1">
                        {category.name}
                      </h3>

                      <p className="text-xs text-muted-foreground">

                        {loading
                          ? '...'
                          : category.count}

                        {' '}
                        items

                      </p>

                    </CardContent>

                  </Card>

                </Link>
              )
            }
          )}

        </div>

      </div>

    </section>
  )
}