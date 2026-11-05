'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Leaf,
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Shield,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  API_ROOT_URL,
  getAuthToken,
  setAdminAuth,
} from '@/lib/api'

const sidebarLinks = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/products',
    label: 'Manage Products',
    icon: Package,
  },
  {
    href: '/admin/add-product',
    label: 'Add Product',
    icon: PlusCircle,
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: ShoppingCart,
  },
  {
    href: '/admin/customers',
    label: 'Customers',
    icon: Users,
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // ============================================
  // REAL ADMIN AUTH CHECK
  // ============================================

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = getAuthToken()

        if (!token) {
          setAdminAuth(false)
          router.replace('/auth')
          return
        }

        const response = await fetch(
          `${API_ROOT_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          setAdminAuth(false)
          localStorage.removeItem('nn_supermarket_token')
          localStorage.removeItem('nn-user')
          router.replace('/auth')
          return
        }

        const user = await response.json()

        if (user.role !== 'admin') {
          setAdminAuth(false)
          localStorage.removeItem('nn_supermarket_token')
          localStorage.removeItem('nn-user')
          router.replace('/auth')
          return
        }

        setAdminAuth(true)
        setIsAuthorized(true)
      } catch (error) {
        console.error(
          'ADMIN AUTH VERIFICATION ERROR:',
          error
        )

        setAdminAuth(false)
        localStorage.removeItem('nn_supermarket_token')
        localStorage.removeItem('nn-user')
        router.replace('/auth')
      } finally {
        setIsLoading(false)
      }
    }

    verifyAdmin()
  }, [router])

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = () => {
    localStorage.removeItem('nn_supermarket_token')
    localStorage.removeItem('nn-user')

    setAdminAuth(false)

    router.push('/auth')
  }

  // ============================================
  // LOADING
  // ============================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />

          <p className="text-muted-foreground">
            Verifying access...
          </p>
        </div>
      </div>
    )
  }

  // ============================================
  // ACCESS DENIED
  // ============================================

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-destructive" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>

          <p className="text-muted-foreground mb-6">
            You don&apos;t have permission to access the admin dashboard. Please login with admin credentials.
          </p>

          <Link href="/auth">
            <Button>
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ============================================
  // SIDEBAR
  // ============================================

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>

          <div>
            <span className="text-lg font-bold text-sidebar-foreground">
              NN Admin
            </span>

            <p className="text-xs text-sidebar-foreground/60">
              Management Panel
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() =>
                setIsMobileOpen(false)
              }
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5" />

              {link.label}

              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <Leaf className="w-5 h-5 mr-3" />
            View Store
          </Button>
        </Link>

        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )

  // ============================================
  // MAIN LAYOUT
  // ============================================

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border hidden lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-b border-border z-50 flex items-center px-4">
        <Sheet
          open={isMobileOpen}
          onOpenChange={setIsMobileOpen}
        >
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-64 p-0 bg-sidebar"
          >
            <SheetTitle className="sr-only">
              Admin Navigation
            </SheetTitle>

            <SheetDescription className="sr-only">
              Navigate through admin dashboard sections
            </SheetDescription>

            <SidebarContent />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 ml-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>

          <span className="font-bold text-foreground">
            NN Admin
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}