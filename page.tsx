"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  API_ROOT_URL,
  getAuthToken,
} from "@/lib/api"

const categories = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Snacks",
  "Beverages",
  "Household",
  "Personal Care",
  "Groceries",
]

export default function AddProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const editId = searchParams.get("id")
  const isEditMode = Boolean(editId)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [unit, setUnit] = useState("")
  const [price, setPrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [offerLabel, setOfferLabel] = useState("")
  const [image, setImage] = useState("")
  const [stock, setStock] = useState("0")

  const [isOnSale, setIsOnSale] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isInStock, setIsInStock] = useState(true)

  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // ============================================
  // Load existing product when editing
  // ============================================

  useEffect(() => {
    if (!editId) return

    const loadProduct = async () => {
      try {
        setLoadingProduct(true)
        setError("")

        const token = getAuthToken()

        if (!token) {
          throw new Error(
            "Admin authentication required. Please login again."
          )
        }

        const response = await fetch(
          `${API_ROOT_URL}/products/${editId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response
          .json()
          .catch(() => null)

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load product"
          )
        }

        const product = data

        setName(product.name || "")
        setDescription(product.description || "")
        setCategory(product.category || "")
        setUnit(product.unit || "")
        setPrice(
          product.price?.toString() || ""
        )
        setOriginalPrice(
          product.originalPrice?.toString() || ""
        )
        setOfferLabel(
          product.offerLabel || ""
        )
        setImage(product.image || "")
        setStock(
          product.stockQuantity?.toString() || "0"
        )

        setIsOnSale(
          Boolean(product.offer)
        )

        setIsFeatured(
          Boolean(product.featured)
        )

        setIsInStock(
          Number(product.stockQuantity) > 0
        )
      } catch (err) {
        console.error(
          "LOAD PRODUCT ERROR:",
          err
        )

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load product details."
        )
      } finally {
        setLoadingProduct(false)
      }
    }

    loadProduct()
  }, [editId])

  // ============================================
  // Submit
  // ============================================

  const handleSubmit = async () => {
    setMessage("")
    setError("")

    if (!name.trim()) {
      setError(
        "Product name is required."
      )
      return
    }

    if (!category) {
      setError(
        "Please select a category."
      )
      return
    }

    if (!unit.trim()) {
      setError("Unit is required.")
      return
    }

    if (
      !price ||
      Number(price) < 0
    ) {
      setError(
        "Please enter a valid price."
      )
      return
    }

    if (isOnSale) {
      if (
        !originalPrice ||
        Number(originalPrice) <
          Number(price)
      ) {
        setError(
          "Original price should be greater than or equal to the sale price."
        )
        return
      }
    }

    if (
      isInStock &&
      (!stock || Number(stock) < 0)
    ) {
      setError(
        "Please enter a valid stock quantity."
      )
      return
    }

    try {
      setLoading(true)

      const token = getAuthToken()

      if (!token) {
        setError(
          "Admin authentication required. Please login again."
        )
        setLoading(false)
        return
      }

      const productData = {
        name: name.trim(),
        price: Number(price),

        originalPrice:
          isOnSale && originalPrice
            ? Number(originalPrice)
            : null,

        category,

        image: image.trim(),

        unit: unit.trim(),

        stockQuantity: isInStock
          ? Number(stock)
          : 0,

        description:
          description.trim(),

        featured: isFeatured,

        offer: isOnSale,

        rating: 0,

        offerLabel: isOnSale
          ? offerLabel.trim()
          : "",
      }

      const url = isEditMode
        ? `${API_ROOT_URL}/products/${editId}`
        : `${API_ROOT_URL}/products`

      const method = isEditMode
        ? "PUT"
        : "POST"

      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            productData
          ),
        }
      )

      const result =
        await response
          .json()
          .catch(() => null)

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Failed to ${
              isEditMode
                ? "update"
                : "create"
            } product`
        )
      }

      setMessage(
        isEditMode
          ? "Product updated successfully!"
          : "Product added successfully!"
      )

      // Clear form after adding
      if (!isEditMode) {
        setName("")
        setDescription("")
        setCategory("")
        setUnit("")
        setPrice("")
        setOriginalPrice("")
        setOfferLabel("")
        setImage("")
        setStock("0")

        setIsOnSale(false)
        setIsFeatured(false)
        setIsInStock(true)
      }

      setTimeout(() => {
        router.push(
          "/admin/products"
        )
      }, 1000)
    } catch (err) {
      console.error(
        "PRODUCT SUBMIT ERROR:",
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      )
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // Loading Existing Product
  // ============================================

  if (loadingProduct) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          Loading product details...
        </p>
      </div>
    )
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          {isEditMode
            ? "Edit Product"
            : "Add Product"}
        </h1>

        <p className="text-sm text-muted-foreground">
          {isEditMode
            ? "Update the product information below."
            : "Add a new product to your supermarket."}
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Product Form */}
      <div className="rounded-xl border bg-card p-6 space-y-6">

        {/* Product Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Product Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Enter product name"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Enter product description"
            rows={4}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
          />
        </div>

        {/* Category + Unit */}
        <div className="grid gap-4 md:grid-cols-2">

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Unit
            </label>

            <input
              type="text"
              value={unit}
              onChange={(e) =>
                setUnit(
                  e.target.value
                )
              }
              placeholder="Example: 1 kg"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

        </div>

        {/* Price */}
        <div className="grid gap-4 md:grid-cols-2">

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Price
            </label>

            <input
              type="number"
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value
                )
              }
              placeholder="0"
              min="0"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Original Price
            </label>

            <input
              type="number"
              value={originalPrice}
              onChange={(e) =>
                setOriginalPrice(
                  e.target.value
                )
              }
              placeholder="0"
              min="0"
              disabled={!isOnSale}
              className="w-full rounded-lg border px-3 py-2 disabled:opacity-50"
            />
          </div>

        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Product Image URL
          </label>

          <input
            type="text"
            value={image}
            onChange={(e) =>
              setImage(
                e.target.value
              )
            }
            placeholder="Paste product image URL"
            className="w-full rounded-lg border px-3 py-2"
          />

          {image && (
            <div className="mt-3">
              <img
                src={image}
                alt="Product preview"
                className="h-32 w-32 rounded-lg border object-cover"
              />
            </div>
          )}
        </div>

        {/* Stock */}
        <div className="space-y-3">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                In Stock
              </p>

              <p className="text-xs text-muted-foreground">
                Enable if the product is available.
              </p>
            </div>

            <input
              type="checkbox"
              checked={isInStock}
              onChange={(e) =>
                setIsInStock(
                  e.target.checked
                )
              }
              className="h-5 w-5"
            />
          </div>

          {isInStock && (
            <input
              type="number"
              value={stock}
              onChange={(e) =>
                setStock(
                  e.target.value
                )
              }
              min="0"
              placeholder="Stock quantity"
              className="w-full rounded-lg border px-3 py-2"
            />
          )}

        </div>

        {/* Sale */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              On Sale
            </p>

            <p className="text-xs text-muted-foreground">
              Mark this product as an offer.
            </p>
          </div>

          <input
            type="checkbox"
            checked={isOnSale}
            onChange={(e) =>
              setIsOnSale(
                e.target.checked
              )
            }
            className="h-5 w-5"
          />
        </div>

        {isOnSale && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Offer Label
            </label>

            <input
              type="text"
              value={offerLabel}
              onChange={(e) =>
                setOfferLabel(
                  e.target.value
                )
              }
              placeholder="Example: 20% OFF"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        )}

        {/* Featured */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              Featured Product
            </p>

            <p className="text-xs text-muted-foreground">
              Show this product in featured sections.
            </p>
          </div>

          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) =>
              setIsFeatured(
                e.target.checked
              )
            }
            className="h-5 w-5"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/products"
              )
            }
            className="rounded-lg border px-5 py-2"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-primary px-5 py-2 text-primary-foreground disabled:opacity-50"
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Adding..."
              : isEditMode
                ? "Update Product"
                : "Add Product"}
          </button>

        </div>

      </div>
    </div>
  )
}