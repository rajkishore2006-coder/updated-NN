'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  X,
  Loader2,
} from 'lucide-react'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import ProductCard from '@/components/product-card'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

import { API_ROOT_URL } from '@/lib/api'
import { categories, type Product } from '@/lib/products'

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

function ShopContent() {
  const searchParams = useSearchParams()

  const initialCategory =
    searchParams.get('category') || ''

  const initialSearch =
    searchParams.get('search') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] =
    useState(initialSearch)

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(
      initialCategory
        ? [initialCategory.toLowerCase()]
        : []
    )

  const [priceRange, setPriceRange] =
    useState([0, 500])

  const [viewMode, setViewMode] =
    useState<'grid' | 'list'>('grid')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  // FETCH PRODUCTS FROM BACKEND

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_ROOT_URL}/products`,
          {
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(
            'Failed to fetch products'
          )
        }

        const data: ApiProduct[] =
          await response.json()

        const formattedProducts: Product[] =
          data.map((product) => ({
            id: product._id,
            name: product.name,
            price: Number(product.price),
            originalPrice:
              product.originalPrice !== null &&
              product.originalPrice !== undefined
                ? Number(product.originalPrice)
                : undefined,

            category: product.category || 'Other',

            image: product.image || '',

            unit:
              product.unit || '1 unit',

            inStock:
              Number(product.stockQuantity ?? 0) > 0,

            featured:
              Boolean(product.featured),

            offer:
              product.offer
                ? product.offerLabel?.trim() ||
                  'Offer'
                : undefined,

            rating:
              Number(product.rating ?? 0),

            description:
              product.description || '',
          }))

        setProducts(formattedProducts)
      } catch (err) {
        console.error(
          'FETCH SHOP PRODUCTS ERROR:',
          err
        )

        setError(
          'Unable to load products. Please make sure the backend server is running.'
        )

        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // CATEGORY NORMALIZER

  const normalizeCategory = (
    category: string
  ) => {
    return category
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
  }

  // FILTER PRODUCTS

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )

      const productCategory =
        normalizeCategory(
          product.category
        )

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some(
          (category) =>
            normalizeCategory(category) ===
            productCategory
        )

      const matchesPrice =
        product.price >= priceRange[0] &&
        product.price <= priceRange[1]

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice
      )
    })
  }, [
    products,
    searchQuery,
    selectedCategories,
    priceRange,
  ])

  // CATEGORY TOGGLE

  const toggleCategory = (
    categoryId: string
  ) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter(
            (c) => c !== categoryId
          )
        : [...prev, categoryId]
    )
  }

  // CLEAR FILTERS

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setPriceRange([0, 500])
  }

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 500

  // LOADING STATE

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />

        <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Our Products
              </h1>

              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our wide range of fresh groceries, dairy products, snacks, and more.
                Quality products at the best prices.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />

              <p className="text-muted-foreground">
                Loading products...
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    )
  }

  // MAIN RENDER

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Products
            </h1>

            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of fresh groceries, dairy products, snacks, and more.
              Quality products at the best prices.
            </p>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-destructive">
              {error}
            </div>
          </div>
        </section>
      )}

      <section className="py-8">
        <div className="container mx-auto px-4">

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="pl-10 h-12"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-4">

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">

                <Button
                  variant={
                    viewMode === 'grid'
                      ? 'default'
                      : 'ghost'
                  }
                  size="icon"
                  className="h-9 w-9"
                  onClick={() =>
                    setViewMode('grid')
                  }
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>

                <Button
                  variant={
                    viewMode === 'list'
                      ? 'default'
                      : 'ghost'
                  }
                  size="icon"
                  className="h-9 w-9"
                  onClick={() =>
                    setViewMode('list')
                  }
                >
                  <LayoutList className="w-4 h-4" />
                </Button>

              </div>
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger
                asChild
                className="lg:hidden"
              >
                <Button
                  variant="outline"
                  className="h-12"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />

                  Filters

                  {hasActiveFilters && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">
                      {
                        selectedCategories.length +
                        (priceRange[0] > 0 ||
                        priceRange[1] < 500
                          ? 1
                          : 0)
                      }
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-80"
              >
                <SheetHeader>
                  <SheetTitle>
                    Filters
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6">
                  <FilterContent
                    categories={categories}
                    selectedCategories={
                      selectedCategories
                    }
                    toggleCategory={
                      toggleCategory
                    }
                    priceRange={priceRange}
                    setPriceRange={
                      setPriceRange
                    }
                    clearFilters={
                      clearFilters
                    }
                    hasActiveFilters={
                      hasActiveFilters
                    }
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">

              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>

              {selectedCategories.map(
                (cat) => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() =>
                      toggleCategory(cat)
                    }
                  >
                    {
                      categories.find(
                        (c) =>
                          normalizeCategory(
                            c.id
                          ) ===
                          normalizeCategory(
                            cat
                          )
                      )?.name
                    }

                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )
              )}

              {(priceRange[0] > 0 ||
                priceRange[1] < 500) && (
                <Badge variant="secondary">
                  ₹{priceRange[0]} - ₹
                  {priceRange[1]}
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={
                  clearFilters
                }
                className="text-destructive hover:text-destructive"
              >
                Clear all
              </Button>
            </div>
          )}

          <div className="flex gap-8">

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">

              <div className="sticky top-24 bg-card rounded-xl border p-6">

                <FilterContent
                  categories={categories}
                  selectedCategories={
                    selectedCategories
                  }
                  toggleCategory={
                    toggleCategory
                  }
                  priceRange={priceRange}
                  setPriceRange={
                    setPriceRange
                  }
                  clearFilters={
                    clearFilters
                  }
                  hasActiveFilters={
                    hasActiveFilters
                  }
                />

              </div>

            </aside>

            {/* Products Grid */}
            <div className="flex-1">

              <div className="flex items-center justify-between mb-6">

                <p className="text-muted-foreground">
                  Showing{' '}
                  <span className="font-semibold text-foreground">
                    {filteredProducts.length}
                  </span>{' '}
                  products
                </p>

              </div>

              {filteredProducts.length === 0 ? (

                <div className="text-center py-16">

                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No products found
                  </h3>

                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>

                  <Button
                    onClick={clearFilters}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>

                </div>

              ) : (

                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
                      : 'flex flex-col gap-4'
                  }
                >
                  {filteredProducts.map(
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
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

// FILTER CONTENT

interface FilterContentProps {
  categories: typeof import('@/lib/products').categories
  selectedCategories: string[]
  toggleCategory: (id: string) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

function FilterContent({
  categories,
  selectedCategories,
  toggleCategory,
  priceRange,
  setPriceRange,
  clearFilters,
  hasActiveFilters,
}: FilterContentProps) {
  return (
    <div className="space-y-6">

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">
          Categories
        </h3>

        <div className="space-y-3">
          {categories.map(
            (category) => (
              <div
                key={category.id}
                className="flex items-center gap-3"
              >
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(
                    category.id
                  )}
                  onCheckedChange={() =>
                    toggleCategory(
                      category.id
                    )
                  }
                />

                <Label
                  htmlFor={category.id}
                  className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {category.name}
                </Label>
              </div>
            )
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">
          Price Range
        </h3>

        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={
              setPriceRange
            }
            min={0}
            max={500}
            step={10}
            className="mb-4"
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              ₹{priceRange[0]}
            </span>

            <span>
              ₹{priceRange[1]}
            </span>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
        >
          Clear All Filters
        </Button>
      )}

    </div>
  )
}

// SUSPENSE WRAPPER FOR useSearchParams

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          Loading products...
        </main>
      }
    >
      <ShopContent />
    </Suspense>
  )
}