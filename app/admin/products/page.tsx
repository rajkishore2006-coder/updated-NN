'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  API_ROOT_URL,
  getAuthToken,
} from '@/lib/api'

/* =========================================================
   TYPES
========================================================= */

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
  rating?: number
}

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  category: string
  image: string
  unit: string
  inStock: boolean
  stockQuantity: number
}

/* =========================================================
   PAGE
========================================================= */

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  /* =========================================================
     FETCH PRODUCTS
  ========================================================== */

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')

      const token = getAuthToken()

      if (!token) {
        throw new Error(
          'Admin authentication required. Please login again.'
        )
      }

      const response = await fetch(
        `${API_ROOT_URL}/products`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json().catch(
        () => null
      )

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to fetch products'
        )
      }

      const formattedProducts: Product[] =
        (data as ApiProduct[]).map(
          (product) => ({
            id: product._id,
            name: product.name,
            price: product.price,
            originalPrice:
              product.originalPrice ??
              undefined,
            category: product.category,
            image: product.image || '',
            unit:
              product.unit ||
              '1 unit',
            inStock:
              (product.stockQuantity ??
                0) > 0,
            stockQuantity:
              product.stockQuantity ??
              0,
          })
        )

      setProducts(formattedProducts)
    } catch (err) {
      console.error(
        'FETCH ADMIN PRODUCTS ERROR:',
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load products. Please make sure the backend server is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  /* =========================================================
     CATEGORIES FROM DATABASE
  ========================================================== */

  const categories = useMemo(() => {
    const uniqueCategories =
      Array.from(
        new Set(
          products
            .map(
              (product) =>
                product.category
            )
            .filter(Boolean)
        )
      )

    return uniqueCategories.map(
      (category) => ({
        id: category,
        name: category,
      })
    )
  }, [products])

  /* =========================================================
     FILTER PRODUCTS
  ========================================================== */

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) => {
        const matchesSearch =
          product.name
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )

        const matchesCategory =
          categoryFilter === 'all' ||
          product.category ===
            categoryFilter

        return (
          matchesSearch &&
          matchesCategory
        )
      }
    )
  }, [
    products,
    searchQuery,
    categoryFilter,
  ])

  /* =========================================================
     DELETE PRODUCT
  ========================================================== */

  const handleDelete = async (
    product: Product
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      )

    if (!confirmed) {
      return
    }

    try {
      const token = getAuthToken()

      if (!token) {
        alert(
          'Admin authentication required. Please login again.'
        )
        return
      }

      const response =
        await fetch(
          `${API_ROOT_URL}/products/${product.id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        )

      const data =
        await response
          .json()
          .catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to delete product'
        )
      }

      // Remove deleted product
      // from current UI
      setProducts((prev) =>
        prev.filter(
          (item) =>
            item.id !== product.id
        )
      )

      alert(
        `${product.name} deleted successfully`
      )
    } catch (err) {
      console.error(
        'DELETE PRODUCT ERROR:',
        err
      )

      alert(
        err instanceof Error
          ? err.message
          : 'Failed to delete product. Please try again.'
      )
    }
  }

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Manage Products
          </h1>

          <p className="text-muted-foreground mt-1">
            View and manage all products in your store
          </p>
        </div>

        <Link href="/admin/add-product">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>

      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">

          <div className="flex flex-col sm:flex-row gap-4">

            {/* Search */}
            <div className="relative flex-1">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="pl-10"
              />

            </div>

            {/* Category */}
            <Select
              value={categoryFilter}
              onValueChange={
                setCategoryFilter
              }
            >

              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="all">
                  All Categories
                </SelectItem>

                {categories.map(
                  (cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                    >
                      {cat.name}
                    </SelectItem>
                  )
                )}

              </SelectContent>

            </Select>

          </div>

        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="py-16">

            <div className="text-center">

              <div className="w-10 h-10 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />

              <p className="text-muted-foreground">
                Loading products...
              </p>

            </div>

          </CardContent>
        </Card>
      )}

      {/* Error */}
      {!loading && error && (
        <Card>
          <CardContent className="py-16">

            <div className="text-center">

              <h3 className="text-xl font-semibold mb-2">
                Unable to load products
              </h3>

              <p className="text-muted-foreground mb-4">
                {error}
              </p>

              <Button
                onClick={fetchProducts}
              >
                Try Again
              </Button>

            </div>

          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      {!loading && !error && (
        <Card>

          <CardHeader>
            <CardTitle>
              Products (
              {filteredProducts.length}
              )
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>
                      Product
                    </TableHead>

                    <TableHead>
                      Category
                    </TableHead>

                    <TableHead>
                      Price
                    </TableHead>

                    <TableHead>
                      Stock
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead className="text-right">
                      Actions
                    </TableHead>

                  </TableRow>

                </TableHeader>

                <TableBody>

                  {filteredProducts.map(
                    (product) => (

                      <TableRow
                        key={
                          product.id
                        }
                      >

                        {/* Product */}
                        <TableCell>

                          <div className="flex items-center gap-3">

                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">

                              {product.image ? (
                                <Image
                                  src={
                                    product.image
                                  }
                                  alt={
                                    product.name
                                  }
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-xl">
                                  🛒
                                </div>
                              )}

                            </div>

                            <div>

                              <p className="font-medium text-foreground">
                                {
                                  product.name
                                }
                              </p>

                              <p className="text-sm text-muted-foreground">
                                per{' '}
                                {
                                  product.unit
                                }
                              </p>

                            </div>

                          </div>

                        </TableCell>

                        {/* Category */}
                        <TableCell>

                          <Badge
                            variant="secondary"
                            className="capitalize"
                          >
                            {product.category.replace(
                              '-',
                              ' '
                            )}
                          </Badge>

                        </TableCell>

                        {/* Price */}
                        <TableCell>

                          <div>

                            <p className="font-semibold text-foreground">
                              ₹
                              {
                                product.price
                              }
                            </p>

                            {product.originalPrice && (
                              <p className="text-sm text-muted-foreground line-through">
                                ₹
                                {
                                  product.originalPrice
                                }
                              </p>
                            )}

                          </div>

                        </TableCell>

                        {/* Stock Quantity */}
                        <TableCell>

                          <span className="font-medium">
                            {
                              product.stockQuantity
                            }
                          </span>

                          <span className="text-sm text-muted-foreground ml-1">
                            units
                          </span>

                        </TableCell>

                        {/* Status */}
                        <TableCell>

                          <Badge
                            variant={
                              product.inStock
                                ? 'default'
                                : 'destructive'
                            }
                            className={
                              product.inStock
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : ''
                            }
                          >
                            {product.inStock
                              ? 'In Stock'
                              : 'Out of Stock'}
                          </Badge>

                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">

                          <DropdownMenu>

                            <DropdownMenuTrigger
                              asChild
                            >

                              <Button
                                variant="ghost"
                                size="icon"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>

                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">

                              {/* Edit */}
                              <DropdownMenuItem
                                asChild
                              >

                                <Link
                                  href={`/admin/add-product?id=${product.id}`}
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </Link>

                              </DropdownMenuItem>

                              {/* Delete */}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  handleDelete(
                                    product
                                  )
                                }
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>

                            </DropdownMenuContent>

                          </DropdownMenu>

                        </TableCell>

                      </TableRow>

                    )
                  )}

                </TableBody>

              </Table>

            </div>

            {/* No Products */}
            {filteredProducts.length ===
              0 && (
              <div className="text-center py-12">

                <p className="text-muted-foreground">
                  No products found
                </p>

              </div>
            )}

          </CardContent>

        </Card>
      )}

    </div>
  )
}