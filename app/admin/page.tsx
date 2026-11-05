'use client'

import { useEffect, useState } from 'react'
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'

import {
  API_ROOT_URL,
  getAuthToken,
} from '@/lib/api'

type DashboardStats = {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  revenue: number
}

type RecentOrder = {
  id: string
  customer: string
  items: number
  total: number
  status: string
}

type TopProduct = {
  name: string
  category?: string
  sold: number
  revenue: number
}

type DashboardData = {
  stats: DashboardStats
  recentOrders: RecentOrder[]
  topProducts: TopProduct[]
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)

      const token = getAuthToken()

      const response = await fetch(
        `${API_ROOT_URL}/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to fetch dashboard data'
        )
      }

      const data =
        await response.json()

      setDashboard(data)
    } catch (error) {
      console.error(
        'FETCH DASHBOARD ERROR:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: 'Total Products',
      value:
        dashboard?.stats.totalProducts ?? 0,
      change: '',
      trend: 'up',
      icon: Package,
      color:
        'text-blue-500 bg-blue-50',
    },
    {
      title: 'Total Orders',
      value:
        dashboard?.stats.totalOrders ?? 0,
      change: '',
      trend: 'up',
      icon: ShoppingCart,
      color:
        'text-green-500 bg-green-50',
    },
    {
      title: 'Total Customers',
      value:
        dashboard?.stats.totalCustomers ?? 0,
      change: '',
      trend: 'up',
      icon: Users,
      color:
        'text-purple-500 bg-purple-50',
    },
    {
      title: 'Revenue',
      value: `₹${(
        dashboard?.stats.revenue ?? 0
      ).toLocaleString('en-IN')}`,
      change: '',
      trend: 'up',
      icon: TrendingUp,
      color:
        'text-orange-500 bg-orange-50',
    },
  ]

  const recentOrders =
    dashboard?.recentOrders ?? []

  const topProducts =
    dashboard?.topProducts ?? []

  const getStatusLabel = (
    status: string
  ) => {
    switch (status) {
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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard
        </h1>

        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <Card
              key={stat.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>

                    <p className="text-3xl font-bold text-foreground mt-1">
                      {loading
                        ? '...'
                        : stat.value}
                    </p>

                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}

                      <span
                        className={`text-sm font-medium ${
                          stat.trend === 'up'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {stat.change ||
                          'Live'}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        from database
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>
              Recent Orders
            </CardTitle>

            <CardDescription>
              Latest orders from your customers
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Loading orders...
                </p>
              ) : recentOrders.length ===
                0 ? (
                <p className="text-sm text-muted-foreground">
                  No orders yet
                </p>
              ) : (
                recentOrders.map(
                  (order) => {
                    const status =
                      getStatusLabel(
                        order.status
                      )

                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {order.customer}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            #
                            {order.id
                              .slice(-6)
                              .toUpperCase()}{' '}
                            - {order.items}{' '}
                            items
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            ₹
                            {order.total.toLocaleString(
                              'en-IN'
                            )}
                          </p>

                          <Badge
                            variant={
                              status ===
                              'Delivered'
                                ? 'default'
                                : status ===
                                    'Processing'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className={
                              status ===
                              'Delivered'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : status ===
                                    'Processing'
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                                  : status ===
                                      'Shipped'
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                            }
                          >
                            {status}
                          </Badge>
                        </div>
                      </div>
                    )
                  }
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>
              Top Products
            </CardTitle>

            <CardDescription>
              Best selling products this month
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Loading products...
                </p>
              ) : topProducts.length ===
                0 ? (
                <p className="text-sm text-muted-foreground">
                  No product sales yet
                </p>
              ) : (
                topProducts.map(
                  (product, index) => (
                    <div
                      key={product.name}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {product.name}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {product.category ||
                            'Product'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ₹
                          {product.revenue.toLocaleString(
                            'en-IN'
                          )}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {product.sold} sold
                        </p>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}