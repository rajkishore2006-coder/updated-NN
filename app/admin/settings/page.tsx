'use client'

import { Store, Bell, Lock, CreditCard, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your store settings and preferences
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Store Information</CardTitle>
                  <CardDescription>Update your store details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" defaultValue="NN Supermarket" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-email">Email</Label>
                  <Input id="store-email" type="email" defaultValue="hello@nnsupermarket.com" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-phone">Phone</Label>
                  <Input id="store-phone" defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-currency">Currency</Label>
                  <Input id="store-currency" defaultValue="INR (₹)" disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-address">Address</Label>
                <Textarea
                  id="store-address"
                  defaultValue="123 Market Street, Mumbai, India"
                  rows={3}
                />
              </div>

              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: 'New Orders', description: 'Get notified when a new order is placed' },
                { title: 'Order Updates', description: 'Receive updates on order status changes' },
                { title: 'Low Stock Alerts', description: 'Get alerts when product stock is low' },
                { title: 'Customer Reviews', description: 'Notifications for new customer reviews' },
                { title: 'Weekly Reports', description: 'Receive weekly sales and performance reports' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Settings */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Delivery Settings</CardTitle>
                  <CardDescription>Configure delivery options and charges</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery-fee">Standard Delivery Fee</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input id="delivery-fee" defaultValue="40" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free-delivery">Free Delivery Above</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input id="free-delivery" defaultValue="500" className="pl-8" />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-order">Minimum Order Value</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input id="min-order" defaultValue="100" className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-time">Estimated Delivery Time</Label>
                  <Input id="delivery-time" defaultValue="2-4 hours" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Same Day Delivery</p>
                  <p className="text-sm text-muted-foreground">Enable same day delivery option</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
