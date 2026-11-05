'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Tag,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Truck,
  Shield,
  Clock,
} from 'lucide-react'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

import { useCartStore } from '@/lib/cart-store'
import { useAuthStore } from '@/lib/auth-store'
import {
  API_ROOT_URL,
  openWhatsAppOrder,
  type WhatsAppOrderData,
} from '@/lib/api'

// ============================================
// CONSTANTS
// ============================================

const MINIMUM_ORDER_AMOUNT = 1000
const FREE_DELIVERY_THRESHOLD = 500
const DELIVERY_FEE = 40

const WHATSAPP_NUMBER = '919842114320'

// ============================================
// COUPON CODES
// ============================================

const COUPON_CODES: Record<
  string,
  {
    discount: number
    type: 'percent' | 'fixed'
    description: string
  }
> = {
  FIRST20: {
    discount: 20,
    type: 'percent',
    description: '20% off on your first order',
  },

  SAVE10: {
    discount: 10,
    type: 'percent',
    description: '10% off on all orders',
  },

  FLAT100: {
    discount: 100,
    type: 'fixed',
    description: 'Flat Rs.100 off',
  },
}

// ============================================
// COMPONENT
// ============================================

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
  } = useCartStore()

  const {
    user,
    isAuthenticated,
  } = useAuthStore()

  // ============================================
  // STATE
  // ============================================

  const [mounted, setMounted] = useState(false)

  const [couponCode, setCouponCode] = useState('')

  const [appliedCoupon, setAppliedCoupon] =
    useState<string | null>(null)

  const [discount, setDiscount] = useState(0)

  const [isOrdering, setIsOrdering] =
    useState(false)

  // Customer details

  const [customerName, setCustomerName] =
    useState('')

  const [customerEmail, setCustomerEmail] =
    useState('')

  const [customerPhone, setCustomerPhone] =
    useState('')

  const [deliveryAddress, setDeliveryAddress] =
    useState('')

  // ============================================
  // HYDRATION
  // ============================================

  useEffect(() => {
    setMounted(true)
  }, [])

  // ============================================
  // LOAD USER DETAILS
  // ============================================

  useEffect(() => {
    if (!mounted) return

    if (user) {
      setCustomerName(user.name || '')
      setCustomerEmail(user.email || '')
      setCustomerPhone(user.phone || '')
    }
  }, [mounted, user])

  // ============================================
  // CALCULATIONS
  // ============================================

  const subtotal =
    mounted ? getTotalPrice() : 0

  const deliveryFee =
    subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : DELIVERY_FEE

  const total =
    Math.max(
      0,
      subtotal - discount + deliveryFee
    )

  const canOrder =
    total >= MINIMUM_ORDER_AMOUNT

  const amountNeededForMinOrder =
    Math.max(
      0,
      MINIMUM_ORDER_AMOUNT - total
    )

  const amountNeededForFreeDelivery =
    Math.max(
      0,
      FREE_DELIVERY_THRESHOLD - subtotal
    )

  // ============================================
  // APPLY COUPON
  // ============================================

  const handleApplyCoupon = () => {
    const code =
      couponCode.toUpperCase().trim()

    if (!code) {
      toast.error(
        'Please enter a coupon code'
      )

      return
    }

    if (appliedCoupon === code) {
      toast.info(
        'This coupon is already applied'
      )

      return
    }

    const coupon =
      COUPON_CODES[code]

    if (!coupon) {
      toast.error(
        'Invalid coupon code'
      )

      setDiscount(0)
      setAppliedCoupon(null)

      return
    }

    const discountAmount =
      coupon.type === 'percent'
        ? Math.round(
            subtotal *
            (coupon.discount / 100)
          )
        : coupon.discount

    setDiscount(discountAmount)

    setAppliedCoupon(code)

    toast.success(
      `Coupon applied! You save Rs.${discountAmount}`
    )
  }

  // ============================================
  // REMOVE COUPON
  // ============================================

  const handleRemoveCoupon = () => {
    setDiscount(0)

    setAppliedCoupon(null)

    setCouponCode('')

    toast.info(
      'Coupon removed'
    )
  }

  // ============================================
  // UPDATE QUANTITY
  // ============================================

  const handleUpdateQuantity = (
    productId: string,
    productName: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      updateQuantity(
        productId,
        0
      )

      toast.info(
        `${productName} removed from cart`
      )
    } else {
      updateQuantity(
        productId,
        newQuantity
      )
    }
  }

  // ============================================
  // REMOVE ITEM
  // ============================================

  const handleRemoveItem = (
    productId: string,
    productName: string
  ) => {
    removeItem(productId)

    toast.info(
      `${productName} removed from cart`
    )
  }

  // ============================================
  // CLEAR CART
  // ============================================

  const handleClearCart = () => {
    clearCart()

    setDiscount(0)

    setAppliedCoupon(null)

    toast.success(
      'Cart cleared'
    )
  }

  // ============================================
  // PLACE ORDER
  // ============================================

  const handlePlaceOrder = async () => {
    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!canOrder) {
      toast.error(
        `Minimum order amount is Rs.${MINIMUM_ORDER_AMOUNT}`
      )

      return
    }

    if (!customerName.trim()) {
      toast.error(
        'Please enter your name'
      )

      return
    }

    if (!customerEmail.trim()) {
      toast.error(
        'Please enter your email'
      )

      return
    }

    if (!customerPhone.trim()) {
      toast.error(
        'Please enter your phone number'
      )

      return
    }

    if (!deliveryAddress.trim()) {
      toast.error(
        'Please enter your delivery address'
      )

      return
    }

    if (items.length === 0) {
      toast.error(
        'Your cart is empty'
      )

      return
    }

    setIsOrdering(true)

    try {
      // ----------------------------------------
      // CREATE ORDER DATA
      // ----------------------------------------

      const orderPayload = {
        customerName:
          customerName.trim(),

        customerEmail:
          customerEmail.trim().toLowerCase(),

        customerPhone:
          customerPhone.trim(),

        deliveryAddress:
          deliveryAddress.trim(),

        items: items.map((item) => ({
          productId:
            item.product.id,

          quantity:
            item.quantity,
        })),

        discount:
          discount,

        deliveryFee:
          deliveryFee,
      }

      // ----------------------------------------
      // SEND TO MONGODB BACKEND
      // ----------------------------------------

      const response =
        await fetch(
          `${API_ROOT_URL}/orders`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                orderPayload
              ),
          }
        )

      const data =
        await response.json()

      // ----------------------------------------
      // HANDLE BACKEND ERROR
      // ----------------------------------------

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Failed to create order'
        )
      }

      // ----------------------------------------
      // PREPARE WHATSAPP DATA
      // ----------------------------------------

      const whatsappOrderData:
        WhatsAppOrderData = {
        items: items.map(
          (item) => ({
            name:
              item.product.name,

            price:
              item.product.price,

            quantity:
              item.quantity,

            unit:
              item.product.unit,
          })
        ),

        subtotal:
          subtotal,

        discount:
          discount,

        deliveryFee:
          deliveryFee,

        total:
          total,

        customerName:
          customerName.trim(),

        customerPhone:
          customerPhone.trim(),
      }

      // ----------------------------------------
      // OPEN WHATSAPP
      // ----------------------------------------

      openWhatsAppOrder(
        WHATSAPP_NUMBER,
        whatsappOrderData
      )

      // ----------------------------------------
      // CLEAR CART
      // ----------------------------------------

      clearCart()

      setDiscount(0)

      setAppliedCoupon(null)

      setCouponCode('')

      setDeliveryAddress('')

      // ----------------------------------------
      // SUCCESS MESSAGE
      // ----------------------------------------

      toast.success(
        `Order placed successfully! Order ID: ${
          data.order?._id || 'Created'
        }`
      )
    } catch (error) {
      console.error(
        'PLACE ORDER ERROR:',
        error
      )

      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to place order'
      )
    } finally {
      setIsOrdering(false)
    }
  }

  // ============================================
  // LOADING STATE
  // ============================================

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-muted rounded-lg w-48" />

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-muted rounded-xl"
                    />
                  ))}
                </div>

                <div className="h-96 bg-muted rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    )
  }

  // ============================================
  // EMPTY CART
  // ============================================

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-24 pb-16 min-h-[80vh] flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center animate-fade-in">
              <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-muted-foreground" />
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-4">
                Your cart is empty
              </h1>

              <p className="text-muted-foreground mb-8 leading-relaxed">
                Looks like you haven&apos;t added any items to your cart yet.
                Start shopping and discover amazing products!
              </p>

              <Link href="/shop">
                <Button
                  size="lg"
                  className="px-8 btn-hover-lift"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    )
  }

  // ============================================
  // MAIN CART
  // ============================================

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">

          {/* HEADER */}

          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Shopping Cart
              </h1>

              <p className="text-muted-foreground mt-1">
                {items.reduce(
                  (acc, item) =>
                    acc + item.quantity,
                  0
                )}
                {' '}
                items in your cart
              </p>
            </div>

            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleClearCart}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* ================================= */}
            {/* CART ITEMS */}
            {/* ================================= */}

            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <Card
                  key={item.product.id}
                  className="overflow-hidden animate-fade-in-up card-hover"
                  style={{
                    animationDelay:
                      `${index * 0.1}s`,
                  }}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex gap-4">

                      {/* IMAGE */}

                      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🛒
                          </div>
                        )}

                        {item.product.offer && (
                          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs">
                            {item.product.offer}
                          </Badge>
                        )}
                      </div>

                      {/* DETAILS */}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              {item.product.category.replace(
                                '-',
                                ' '
                              )}
                            </p>

                            <h3 className="font-semibold text-foreground text-lg line-clamp-1">
                              {item.product.name}
                            </h3>

                            <p className="text-sm text-muted-foreground">
                              Rs.{item.product.price} per {item.product.unit}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                            onClick={() =>
                              handleRemoveItem(
                                item.product.id,
                                item.product.name
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-4">

                          {/* QUANTITY */}

                          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-background"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product.id,
                                  item.product.name,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="w-4 h-4" />
                            </Button>

                            <span className="font-semibold min-w-[40px] text-center">
                              {item.quantity}
                            </span>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-background"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product.id,
                                  item.product.name,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* ITEM TOTAL */}

                          <p className="text-xl font-bold text-primary">
                            Rs.
                            {item.product.price *
                              item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* CONTINUE SHOPPING */}

              <Link
                href="/shop"
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full mt-4"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* ================================= */}
            {/* ORDER SUMMARY */}
            {/* ================================= */}

            <div className="lg:col-span-1">
              <Card className="sticky top-24 animate-slide-in-right shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">
                    Order Summary
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                  {/* ================================= */}
                  {/* CUSTOMER DETAILS */}
                  {/* ================================= */}

                  <div className="space-y-3">
                    <h3 className="font-semibold text-base">
                      Delivery Details
                    </h3>

                    <Input
                      placeholder="Full Name"
                      value={customerName}
                      onChange={(e) =>
                        setCustomerName(
                          e.target.value
                        )
                      }
                    />

                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={customerEmail}
                      onChange={(e) =>
                        setCustomerEmail(
                          e.target.value
                        )
                      }
                    />

                    <Input
                      type="tel"
                      placeholder="Phone Number"
                      value={customerPhone}
                      onChange={(e) =>
                        setCustomerPhone(
                          e.target.value
                        )
                      }
                    />

                    <textarea
                      placeholder="Delivery Address"
                      value={deliveryAddress}
                      onChange={(e) =>
                        setDeliveryAddress(
                          e.target.value
                        )
                      }
                      rows={4}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <Separator />

                  {/* ================================= */}
                  {/* COUPON */}
                  {/* ================================= */}

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(
                              e.target.value
                            )
                          }
                          className="pl-10"
                          disabled={
                            !!appliedCoupon
                          }
                        />
                      </div>

                      {appliedCoupon ? (
                        <Button
                          variant="outline"
                          onClick={
                            handleRemoveCoupon
                          }
                          className="px-4"
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={
                            handleApplyCoupon
                          }
                          className="px-4"
                        >
                          Apply
                        </Button>
                      )}
                    </div>

                    {appliedCoupon && (
                      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <CheckCircle className="w-4 h-4 text-primary" />

                        <span className="text-sm text-primary font-medium">
                          {appliedCoupon} applied -
                          You save Rs.{discount}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Try: FIRST20, SAVE10, or FLAT100
                    </p>
                  </div>

                  <Separator />

                  {/* ================================= */}
                  {/* PRICE BREAKDOWN */}
                  {/* ================================= */}

                  <div className="space-y-3">
                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        Subtotal (
                        {items.reduce(
                          (acc, item) =>
                            acc + item.quantity,
                          0
                        )}
                        {' '}
                        items)
                      </span>

                      <span>
                        Rs.{subtotal}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-primary font-medium">
                        <span>
                          Discount
                        </span>

                        <span>
                          -Rs.{discount}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        Delivery Fee
                      </span>

                      <span>
                        {deliveryFee === 0 ? (
                          <span className="text-primary font-medium">
                            FREE
                          </span>
                        ) : (
                          `Rs.${deliveryFee}`
                        )}
                      </span>
                    </div>

                    {/* FREE DELIVERY */}

                    {deliveryFee > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Truck className="w-4 h-4" />

                          <span>
                            Add Rs.
                            {amountNeededForFreeDelivery}
                            {' '}
                            more for FREE delivery
                          </span>
                        </div>

                        <div className="h-2 bg-background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{
                              width:
                                `${Math.min(
                                  (subtotal /
                                    FREE_DELIVERY_THRESHOLD) *
                                    100,
                                  100
                                )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* ================================= */}
                  {/* TOTAL */}
                  {/* ================================= */}

                  <div className="flex justify-between text-xl font-bold">
                    <span>
                      Total
                    </span>

                    <span className="text-primary">
                      Rs.{total}
                    </span>
                  </div>

                  {/* ================================= */}
                  {/* MINIMUM ORDER */}
                  {/* ================================= */}

                  {!canOrder && (
                    <Alert className="bg-destructive/10 border-destructive/30 text-destructive">
                      <AlertCircle className="h-4 w-4" />

                      <AlertDescription className="font-medium">
                        Minimum order is Rs.
                        {MINIMUM_ORDER_AMOUNT}.
                        {' '}
                        Add Rs.
                        {amountNeededForMinOrder}
                        {' '}
                        more to proceed.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* ================================= */}
                  {/* ORDER BUTTON */}
                  {/* ================================= */}

                  <Button
                    className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                      canOrder
                        ? 'bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg hover:shadow-xl'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                    size="lg"
                    onClick={
                      handlePlaceOrder
                    }
                    disabled={
                      !canOrder ||
                      isOrdering
                    }
                  >
                    {isOrdering ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Order via WhatsApp
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {canOrder && (
                    <p className="text-xs text-center text-muted-foreground">
                      Your order will be saved securely and
                      sent directly to our WhatsApp.
                    </p>
                  )}

                  {/* ================================= */}
                  {/* TRUST BADGES */}
                  {/* ================================= */}

                  <div className="pt-4 border-t border-border">
                    <div className="grid grid-cols-3 gap-2 text-center">

                      <div className="p-2">
                        <Shield className="w-5 h-5 mx-auto text-primary mb-1" />

                        <p className="text-xs text-muted-foreground">
                          Secure
                        </p>
                      </div>

                      <div className="p-2">
                        <Truck className="w-5 h-5 mx-auto text-primary mb-1" />

                        <p className="text-xs text-muted-foreground">
                          Fast Delivery
                        </p>
                      </div>

                      <div className="p-2">
                        <Clock className="w-5 h-5 mx-auto text-primary mb-1" />

                        <p className="text-xs text-muted-foreground">
                          24/7 Support
                        </p>
                      </div>

                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}