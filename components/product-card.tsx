'use client'

import Image from 'next/image'
import { toast } from 'sonner'
import {
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Star,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { useCartStore } from '@/lib/cart-store'
import type { Product } from '@/lib/products'

import { useState, useEffect } from 'react'

interface ProductCardProps {
  product?: Product | null
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const {
    items,
    addItem,
    updateQuantity,
  } = useCartStore()

  const [isAdded, setIsAdded] = useState(false)
  const [mounted, setMounted] = useState(false)

  // ============================================
  // HYDRATION FIX
  // ============================================

  useEffect(() => {
    setMounted(true)
  }, [])

  // ============================================
  // SAFETY CHECK
  // ============================================

  if (!product) {
    return null
  }

  // ============================================
  // CART ITEM
  // ============================================

  const cartItem = mounted
    ? items.find(
        (item) =>
          item?.product?.id === product.id
      )
    : null

  const quantity = cartItem?.quantity || 0

  // ============================================
  // HANDLERS
  // ============================================

  const handleAddToCart = () => {
    addItem(product)

    setIsAdded(true)

    toast.success(
      `${product.name} added to cart`,
      {
        description:
          `Rs.${product.price} per ${product.unit}`,

        action: {
          label: 'View Cart',

          onClick: () => {
            window.location.href = '/cart'
          },
        },
      }
    )

    setTimeout(() => {
      setIsAdded(false)
    }, 1500)
  }

  const handleIncreaseQuantity = () => {
    updateQuantity(
      product.id,
      quantity + 1
    )
  }

  const handleDecreaseQuantity = () => {
    if (quantity <= 1) {
      updateQuantity(
        product.id,
        0
      )

      toast.info(
        `${product.name} removed from cart`
      )
    } else {
      updateQuantity(
        product.id,
        quantity - 1
      )
    }
  }

  // ============================================
  // CALCULATE DISCOUNT
  // ============================================

  const originalPrice =
    typeof product.originalPrice === 'number'
      ? product.originalPrice
      : null

  const discountPercent =
    originalPrice !== null &&
    originalPrice > 0 &&
    originalPrice > product.price
      ? Math.round(
          ((originalPrice - product.price) /
            originalPrice) *
            100
        )
      : 0

  // ============================================
  // RENDER
  // ============================================

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-card card-hover">

      {/* ====================================== */}
      {/* PRODUCT IMAGE */}
      {/* ====================================== */}

      <div className="relative aspect-square overflow-hidden bg-muted">

        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">

            <div className="text-5xl mb-2">
              🛒
            </div>

            <span className="text-sm text-muted-foreground">
              {product.category || 'Product'}
            </span>

          </div>
        )}

        {/* ====================================== */}
        {/* BADGES */}
        {/* ====================================== */}

        <div className="absolute top-3 left-3 flex flex-col gap-2">

          {product.offer && (
            <Badge className="bg-destructive text-destructive-foreground shadow-md">
              {product.offer}
            </Badge>
          )}

          {discountPercent > 0 &&
            !product.offer && (
              <Badge className="bg-primary text-primary-foreground shadow-md">
                {discountPercent}% OFF
              </Badge>
            )}

        </div>

        {/* ====================================== */}
        {/* RATING */}
        {/* ====================================== */}

        {product.rating && product.rating > 0 && (
          <div className="absolute top-3 right-3">

            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-sm shadow-md"
            >
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />

              {product.rating}
            </Badge>

          </div>
        )}

        {/* ====================================== */}
        {/* OUT OF STOCK */}
        {/* ====================================== */}

        {!product.inStock && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">

            <Badge
              variant="secondary"
              className="text-base px-4 py-2"
            >
              Out of Stock
            </Badge>

          </div>
        )}

        {/* ====================================== */}
        {/* QUICK ADD */}
        {/* ====================================== */}

        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-background/95 via-background/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">

          {quantity === 0 ? (
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg btn-hover-lift"
              size="sm"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-3 bg-primary rounded-lg p-1 shadow-lg">

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={handleDecreaseQuantity}
              >
                <Minus className="w-4 h-4" />
              </Button>

              <span className="text-primary-foreground font-bold min-w-[28px] text-center text-lg">
                {quantity}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={handleIncreaseQuantity}
              >
                <Plus className="w-4 h-4" />
              </Button>

            </div>
          )}

        </div>

      </div>

      {/* ====================================== */}
      {/* PRODUCT DETAILS */}
      {/* ====================================== */}

      <CardContent className="p-4">

        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 font-medium">
          {(product.category || 'product').replace(
            '-',
            ' '
          )}
        </p>

        <h3 className="font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">

          <div className="flex items-baseline gap-2">

            <span className="text-lg font-bold text-primary">
              Rs.{product.price}
            </span>

            {originalPrice !== null && (
              <span className="text-sm text-muted-foreground line-through">
                Rs.{originalPrice}
              </span>
            )}

          </div>

          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {product.unit}
          </span>

        </div>

        {/* ====================================== */}
        {/* MOBILE ADD TO CART */}
        {/* ====================================== */}

        <div className="mt-3 lg:hidden">

          {quantity === 0 ? (
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full"
              size="sm"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-muted rounded-lg p-1">

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDecreaseQuantity}
              >
                <Minus className="w-4 h-4" />
              </Button>

              <span className="font-bold min-w-[28px] text-center">
                {quantity}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleIncreaseQuantity}
              >
                <Plus className="w-4 h-4" />
              </Button>

            </div>
          )}

        </div>

      </CardContent>

    </Card>
  )
}