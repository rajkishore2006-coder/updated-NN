'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Package } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

type Order = {
  _id: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  deliveryAddress: string
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
    unit: string
  }>
  subtotal: number
  discount: number
  deliveryFee: number
  total: number
  status: OrderStatus
  createdAt: string
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()

  const [order, setOrder] =
    useState<Order | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [updating, setUpdating] =
    useState(false)

  // ============================================
  // FETCH ORDER
  // ============================================

  useEffect(() => {
    if (params.id) {
      fetchOrder()
    }
  }, [params.id])

  const fetchOrder = async () => {
    try {
      setLoading(true)

      const token = getAuthToken()

      if (!token) {
        throw new Error(
          'Admin authentication required'
        )
      }

      const response = await fetch(
        `${API_ROOT_URL}/orders/${params.id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to fetch order'
        )
      }

      const data: Order =
        await response.json()

      setOrder(data)
    } catch (error) {
      console.error(
        'FETCH ORDER ERROR:',
        error
      )

      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // DISPLAY STATUS
  // ============================================

  const getDisplayStatus = (
    status: OrderStatus
  ) => {
    switch (status) {
      case 'pending':
        return 'Pending'

      case 'confirmed':
      case 'packed':
        return 'Processing'

      case 'out_for_delivery':
        return 'Shipped'

      case 'delivered':
        return 'Delivered'

      case 'cancelled':
        return 'Cancelled'

      default:
        return 'Pending'
    }
  }

  // ============================================
  // STATUS COLOR
  // ============================================

  const getStatusColor = (
    status: OrderStatus
  ) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700'

      case 'confirmed':
      case 'packed':
        return 'bg-blue-100 text-blue-700'

      case 'pending':
        return 'bg-yellow-100 text-yellow-700'

      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-700'

      case 'cancelled':
        return 'bg-red-100 text-red-700'

      default:
        return ''
    }
  }

  // ============================================
  // UPDATE STATUS
  // ============================================

  const handleStatusChange = async (
    newStatus: OrderStatus
  ) => {
    if (
      !order ||
      newStatus === order.status
    ) {
      return
    }

    try {
      setUpdating(true)

      const token = getAuthToken()

      if (!token) {
        alert(
          'Admin authentication required. Please login again.'
        )
        return
      }

      const response =
        await fetch(
          `${API_ROOT_URL}/orders/${order._id}/status`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              status: newStatus,
            }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to update order status'
        )
      }

      setOrder(
        data.order || data
      )

      alert(
        'Order status updated successfully.'
      )
    } catch (error) {
      console.error(
        'UPDATE STATUS ERROR:',
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to update order status.'
      )
    } finally {
      setUpdating(false)
    }
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-muted-foreground">
          Loading order details...
        </p>
      </div>
    )
  }

  // ============================================
  // ORDER NOT FOUND
  // ============================================

  if (!order) {
    return (
      <div className="p-6 lg:p-8">
        <Button
          variant="ghost"
          onClick={() =>
            router.push(
              '/admin/orders'
            )
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>

        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />

          <p className="text-muted-foreground">
            Order not found
          </p>
        </div>
      </div>
    )
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() =>
            router.push(
              '/admin/orders'
            )
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Order Details
            </h1>

            <p className="text-muted-foreground mt-1">
              Order ID: {order._id}
            </p>
          </div>

          {/* Status */}
          <Select
            value={order.status}
            onValueChange={(value) =>
              handleStatusChange(
                value as OrderStatus
              )
            }
            disabled={updating}
          >
            <SelectTrigger
              className={`w-[150px] border-0 ${getStatusColor(
                order.status
              )}`}
            >
              <SelectValue>
                {getDisplayStatus(
                  order.status
                )}
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="pending">
                Pending
              </SelectItem>

              <SelectItem value="confirmed">
                Processing
              </SelectItem>

              <SelectItem value="packed">
                Packed
              </SelectItem>

              <SelectItem value="out_for_delivery">
                Shipped
              </SelectItem>

              <SelectItem value="delivered">
                Delivered
              </SelectItem>

              <SelectItem value="cancelled">
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customer Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Customer Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <p className="text-sm text-muted-foreground">
                Name
              </p>

              <p className="font-medium">
                {order.customerName}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Email
              </p>

              <p className="font-medium">
                {order.customerEmail}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Phone
              </p>

              <p className="font-medium">
                {order.customerPhone ||
                  'Not provided'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Order Date
              </p>

              <p className="font-medium">
                {new Date(
                  order.createdAt
                ).toLocaleString(
                  'en-IN'
                )}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">
                Delivery Address
              </p>

              <p className="font-medium">
                {order.deliveryAddress}
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Ordered Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Ordered Items
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">

            {order.items.map(
              (item) => (
                <div
                  key={
                    item.productId
                  }
                  className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {item.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {item.quantity} ×{' '}
                      {item.unit}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ₹
                      {(
                        item.price *
                        item.quantity
                      ).toLocaleString(
                        'en-IN'
                      )}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      ₹
                      {item.price.toLocaleString(
                        'en-IN'
                      )}{' '}
                      each
                    </p>
                  </div>
                </div>
              )
            )}

          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            Order Summary
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Subtotal
              </span>

              <span>
                ₹
                {order.subtotal.toLocaleString(
                  'en-IN'
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Discount
              </span>

              <span>
                -₹
                {order.discount.toLocaleString(
                  'en-IN'
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Delivery Fee
              </span>

              <span>
                ₹
                {order.deliveryFee.toLocaleString(
                  'en-IN'
                )}
              </span>
            </div>

            <div className="border-t pt-4 flex justify-between">
              <span className="font-semibold">
                Total
              </span>

              <span className="text-xl font-bold">
                ₹
                {order.total.toLocaleString(
                  'en-IN'
                )}
              </span>
            </div>

          </div>
        </CardContent>
      </Card>

    </div>
  )
}