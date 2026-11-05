'use client'

import { useEffect, useState } from 'react'
import { Search, Mail, Phone, Users } from 'lucide-react'
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
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  API_ROOT_URL,
  getAuthToken,
} from '@/lib/api'

type Customer = {
  _id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
  orders: number
  spent: number
  status: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)

      const token = getAuthToken()

      const response = await fetch(
        `${API_ROOT_URL}/users/customers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to fetch customers'
        )
      }

      const data = await response.json()

      setCustomers(data)
    } catch (error) {
      console.error(
        'FETCH CUSTOMERS ERROR:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers =
    customers.filter((customer) => {
      const search =
        searchQuery.toLowerCase()

      return (
        customer.name
          .toLowerCase()
          .includes(search) ||
        customer.email
          .toLowerCase()
          .includes(search)
      )
    })

  const totalCustomers =
    customers.length

  const activeCustomers =
    customers.filter(
      (customer) =>
        customer.status === 'Active'
    ).length

  const totalOrders =
    customers.reduce(
      (sum, customer) =>
        sum + customer.orders,
      0
    )

  const totalRevenue =
    customers.reduce(
      (sum, customer) =>
        sum + customer.spent,
      0
    )

  const getInitials = (
    name: string
  ) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Customers
        </h1>

        <p className="text-muted-foreground">
          Manage and view your customers
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>

            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {totalCustomers}
            </div>

            <p className="text-xs text-muted-foreground">
              Registered customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>

            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {activeCustomers}
            </div>

            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Orders
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {totalOrders}
            </div>

            <p className="text-xs text-muted-foreground">
              Customer orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>

            <p className="text-xs text-muted-foreground">
              From customer orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>
              All Customers
            </CardTitle>

            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Customer
                </TableHead>

                <TableHead>
                  Contact
                </TableHead>

                <TableHead>
                  Orders
                </TableHead>

                <TableHead>
                  Total Spent
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Joined
                </TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8"
                  >
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8"
                  >
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map(
                  (customer) => (
                    <TableRow
                      key={customer._id}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(
                                customer.name
                              )}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="font-medium">
                              {customer.name}
                            </div>

                            <div className="text-sm text-muted-foreground">
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3.5 w-3.5" />
                            {customer.email}
                          </div>

                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {customer.orders}
                      </TableCell>

                      <TableCell>
                        ₹
                        {customer.spent.toLocaleString(
                          'en-IN'
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            customer.status ===
                            'Active'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {new Date(
                          customer.createdAt
                        ).toLocaleDateString(
                          'en-IN'
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}