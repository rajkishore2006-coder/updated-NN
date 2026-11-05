'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Eye,
  Package,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

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

type BackendOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

type Order = {
  id: string
  customer: string
  email: string
  items: number
  total: number
  status: string
  date: string
  backendStatus: BackendOrderStatus
}

type BackendOrder = {
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
  status: BackendOrderStatus
  createdAt: string
}

export default function OrdersPage() {
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] =
    useState('all')
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  // ============================================
  // DISPLAY STATUS
  // ============================================

  const getDisplayStatus = (
    status: BackendOrderStatus
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
  // FETCH ORDERS
  // ============================================

  const fetchOrders = async () => {
    try {
      setLoading(true)

      const token = getAuthToken()

      if (!token) {
        throw new Error(
          'Admin authentication required'
        )
      }

      const response = await fetch(
        `${API_ROOT_URL}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to fetch orders'
        )
      }

      const data: BackendOrder[] =
        await response.json()

      const formattedOrders: Order[] =
        data.map((order) => ({
          id: order._id,
          customer:
            order.customerName,
          email:
            order.customerEmail,

          items:
            order.items.reduce(
              (total, item) =>
                total +
                item.quantity,
              0
            ),

          total: order.total,

          status:
            getDisplayStatus(
              order.status
            ),

          date:
            new Date(
              order.createdAt
            )
              .toISOString()
              .split('T')[0],

          backendStatus:
            order.status,
        }))

      setOrders(formattedOrders)
    } catch (error) {
      console.error(
        'FETCH ORDERS ERROR:',
        error
      )

      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // UPDATE ORDER STATUS
  // ============================================

  const handleStatusUpdate = async (
    orderId: string,
    currentStatus: BackendOrderStatus
  ) => {
    const newStatus =
      window.prompt(
        `Current status: ${getDisplayStatus(
          currentStatus
        )}

Enter new status:

pending
confirmed
packed
out_for_delivery
delivered
cancelled`,
        currentStatus
      )

    if (!newStatus) {
      return
    }

    const validStatuses: BackendOrderStatus[] =
      [
        'pending',
        'confirmed',
        'packed',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ]

    if (
      !validStatuses.includes(
        newStatus as BackendOrderStatus
      )
    ) {
      alert(
        'Invalid status. Please enter a valid status.'
      )
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
          `${API_ROOT_URL}/orders/${orderId}/status`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              status:
                newStatus,
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

      alert(
        'Order status updated successfully.'
      )

      await fetchOrders()
    } catch (error) {
      console.error(
        'UPDATE ORDER STATUS ERROR:',
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to update order status.'
      )
    }
  }

  // ============================================
  // FILTER ORDERS
  // ============================================

  const filteredOrders =
    orders.filter((order) => {
      const search =
        searchQuery.toLowerCase()

      const matchesSearch =
        order.customer
          .toLowerCase()
          .includes(search) ||
        order.id
          .toLowerCase()
          .includes(search)

      const matchesStatus =
        statusFilter === 'all' ||
        order.status
          .toLowerCase() ===
          statusFilter

      return (
        matchesSearch &&
        matchesStatus
      )
    })

  // ============================================
  // STATUS COLOR
  // ============================================

  const getStatusColor = (
    status: string
  ) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700 hover:bg-green-100'

      case 'Processing':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100'

      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'

      case 'Shipped':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-100'

      case 'Cancelled':
        return 'bg-red-100 text-red-700 hover:bg-red-100'

      default:
        return ''
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Orders
        </h1>

        <p className="text-muted-foreground mt-1">
          Manage and track all customer orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label:
              'Total Orders',
            value:
              orders.length,
            color:
              'text-blue-500',
          },
          {
            label:
              'Delivered',
            value:
              orders.filter(
                (o) =>
                  o.status ===
                  'Delivered'
              ).length,
            color:
              'text-green-500',
          },
          {
            label:
              'Processing',
            value:
              orders.filter(
                (o) =>
                  o.status ===
                  'Processing'
              ).length,
            color:
              'text-orange-500',
          },
          {
            label:
              'Pending',
            value:
              orders.filter(
                (o) =>
                  o.status ===
                  'Pending'
              ).length,
            color:
              'text-yellow-500',
          },
        ].map((stat) => (
          <Card
            key={stat.label}
          >
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {stat.label}
              </p>

              <p
                className={`text-2xl font-bold ${stat.color}`}
              >
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                placeholder="Search by order ID or customer..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={
                setStatusFilter
              }
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Status
                </SelectItem>

                <SelectItem value="pending">
                  Pending
                </SelectItem>

                <SelectItem value="processing">
                  Processing
                </SelectItem>

                <SelectItem value="shipped">
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
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Orders
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Order ID
                  </TableHead>

                  <TableHead>
                    Customer
                  </TableHead>

                  <TableHead>
                    Items
                  </TableHead>

                  <TableHead>
                    Total
                  </TableHead>

                  <TableHead>
                    Date
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
                {filteredOrders.map(
                  (order) => (
                    <TableRow
                      key={order.id}
                    >
                      <TableCell className="font-medium">
                        {order.id}
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {
                              order.customer
                            }
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {order.email}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        {order.items}{' '}
                        items
                      </TableCell>

                      <TableCell className="font-semibold">
                        ₹
                        {order.total.toLocaleString(
                          'en-IN'
                        )}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {order.date}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`${getStatusColor(
                            order.status
                          )} cursor-pointer`}
                          onClick={() =>
                            handleStatusUpdate(
                              order.id,
                              order.backendStatus
                            )
                          }
                        >
                          {
                            order.status
                          }
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/admin/orders/${order.id}`
                            )
                          }
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>

          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Loading orders...
              </p>
            </div>
          )}

          {!loading &&
            filteredOrders.length ===
              0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />

                <p className="text-muted-foreground">
                  No orders found
                </p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}