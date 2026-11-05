// ============================================
// NN SUPERMARKET PRODUCT TYPES
// ============================================

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  category: string
  image: string
  unit: string
  inStock: boolean
  featured?: boolean
  offer?: string
  rating?: number
  description?: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  productCount?: number
}

// ============================================
// CATEGORY DEFINITIONS
// ============================================

export const categories: Category[] = [
  {
    id: 'fruits',
    name: 'Fruits',
    icon: '🍎',
    color: 'bg-red-50 hover:bg-red-100',
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    icon: '🥬',
    color: 'bg-green-50 hover:bg-green-100',
  },
  {
    id: 'dairy',
    name: 'Dairy',
    icon: '🥛',
    color: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    id: 'snacks',
    name: 'Snacks',
    icon: '🍿',
    color: 'bg-yellow-50 hover:bg-yellow-100',
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: '🧃',
    color: 'bg-orange-50 hover:bg-orange-100',
  },
  {
    id: 'household',
    name: 'Household',
    icon: '🧹',
    color: 'bg-purple-50 hover:bg-purple-100',
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: '🧴',
    color: 'bg-pink-50 hover:bg-pink-100',
  },
]

// ============================================
// STATIC PRODUCT DATA REMOVED
// ============================================
//
// Products now come from:
// MongoDB -> Express API -> Next.js
//
// Keep this export temporarily so older files
// importing "products" do not immediately break.
// It will remain empty until those files are
// converted to use the backend API.
//

export const products: Product[] = []

// ============================================
// HELPER FUNCTIONS
// ============================================
//
// These helpers are kept for compatibility with
// existing files. Once every consumer is converted
// to backend/API data, these can be removed.
//

export function getProductsByCategory(
  categoryId: string
): Product[] {
  return products.filter(
    (product) =>
      product.category === categoryId
  )
}

export function getFeaturedProducts(): Product[] {
  return products.filter(
    (product) =>
      product.featured
  )
}

export function getProductsWithOffers(): Product[] {
  return products.filter(
    (product) =>
      product.offer
  )
}

export function searchProducts(
  query: string
): Product[] {
  const lowerQuery =
    query.toLowerCase().trim()

  if (!lowerQuery) {
    return products
  }

  return products.filter(
    (product) =>
      product.name
        .toLowerCase()
        .includes(lowerQuery) ||
      product.category
        .toLowerCase()
        .includes(lowerQuery)
  )
}

export function getProductById(
  id: string
): Product | undefined {
  return products.find(
    (product) =>
      product.id === id
  )
}

export function getCategoriesWithCounts(): Category[] {
  return categories.map(
    (category) => ({
      ...category,
      productCount:
        products.filter(
          (product) =>
            product.category ===
            category.id
        ).length,
    })
  )
}