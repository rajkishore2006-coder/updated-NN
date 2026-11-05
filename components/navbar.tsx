'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ShoppingCart,
  User,
  Menu,
  Search,
  Leaf,
  LogOut,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

import { useCartStore } from '@/lib/cart-store'
import { useAuthStore } from '@/lib/auth-store'

// ============================================
// NAV LINKS
// ============================================

const navLinks = [
  {
    href: '/',
    label: 'Home',
  },
  {
    href: '/shop',
    label: 'Shop',
  },
  {
    href: '/cart',
    label: 'Cart',
  },
]

// ============================================
// NAVBAR
// ============================================

export function Navbar() {
  const router = useRouter()

  const [isScrolled, setIsScrolled] =
    useState(false)

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false)

  const [searchQuery, setSearchQuery] =
    useState('')

  const getTotalItems =
    useCartStore(
      (state) => state.getTotalItems
    )

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuthStore()

  const [mounted, setMounted] =
    useState(false)

  // ============================================
  // HYDRATION + SCROLL
  // ============================================

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setIsScrolled(
        window.scrollY > 10
      )
    }

    window.addEventListener(
      'scroll',
      handleScroll
    )

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      )
    }
  }, [])

  const cartCount = mounted
    ? getTotalItems()
    : 0

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = () => {
    logout()

    setIsMobileMenuOpen(false)

    toast.success(
      'Logged out successfully'
    )

    router.push('/')
  }

  // ============================================
  // SEARCH
  // ============================================

  const handleSearch = (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    const query =
      searchQuery.trim()

    if (!query) {
      return
    }

    router.push(
      `/shop?search=${encodeURIComponent(
        query
      )}`
    )

    setIsMobileMenuOpen(false)
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-transparent'
      }`}
    >

      <div className="container mx-auto px-4">

        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* ================================= */}
          {/* LOGO */}
          {/* ================================= */}

          <Link
            href="/"
            className="flex items-center gap-2 group"
          >

            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25">

              <Leaf className="w-6 h-6 text-primary-foreground" />

            </div>

            <span className="text-xl font-bold text-foreground">

              NN
              <span className="text-primary">
                Supermarket
              </span>

            </span>

          </Link>

          {/* ================================= */}
          {/* DESKTOP NAVIGATION */}
          {/* ================================= */}

          <nav className="hidden lg:flex items-center gap-8">

            {navLinks.map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                >
                  {link.label}
                </Link>
              )
            )}

          </nav>

          {/* ================================= */}
          {/* DESKTOP SEARCH */}
          {/* ================================= */}

          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center gap-2 flex-1 max-w-md mx-8"
          >

            <div className="relative w-full">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-primary h-10"
              />

            </div>

          </form>

          {/* ================================= */}
          {/* ACTIONS */}
          {/* ================================= */}

          <div className="flex items-center gap-2">

            {/* CART */}

            <Link href="/cart">

              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >

                <ShoppingCart className="w-5 h-5" />

                {mounted &&
                  cartCount > 0 && (

                    <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground animate-scale-in">

                      {cartCount > 99
                        ? '99+'
                        : cartCount}

                    </Badge>

                  )}

              </Button>

            </Link>

            {/* ================================= */}
            {/* DESKTOP USER */}
            {/* ================================= */}

            {mounted &&
            isAuthenticated ? (

              <div className="hidden sm:flex items-center gap-2">

                <span className="text-sm text-muted-foreground max-w-[100px] truncate">

                  Hi,{' '}

                  {user?.name?.split(
                    ' '
                  )[0]}

                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={
                    handleLogout
                  }
                  title="Logout"
                  className="hover:bg-destructive/10 hover:text-destructive"
                >

                  <LogOut className="w-5 h-5" />

                </Button>

              </div>

            ) : (

              <Link
                href="/auth"
                className="hidden sm:block"
              >

                <Button
                  variant="ghost"
                  size="icon"
                >

                  <User className="w-5 h-5" />

                </Button>

              </Link>

            )}

            {/* ================================= */}
            {/* MOBILE MENU */}
            {/* ================================= */}

            <Sheet
              open={
                isMobileMenuOpen
              }
              onOpenChange={
                setIsMobileMenuOpen
              }
            >

              <SheetTrigger
                asChild
                className="lg:hidden"
              >

                <Button
                  variant="ghost"
                  size="icon"
                >

                  <Menu className="w-5 h-5" />

                </Button>

              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-80 p-0"
              >

                <SheetTitle className="sr-only">
                  Navigation Menu
                </SheetTitle>

                <SheetDescription className="sr-only">
                  Mobile navigation menu with links and search
                </SheetDescription>

                <div className="flex flex-col h-full">

                  {/* MOBILE HEADER */}

                  <div className="p-4 border-b border-border flex items-center justify-between">

                    <Link
                      href="/"
                      className="flex items-center gap-2"
                      onClick={() =>
                        setIsMobileMenuOpen(
                          false
                        )
                      }
                    >

                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">

                        <Leaf className="w-5 h-5 text-primary-foreground" />

                      </div>

                      <span className="font-bold">
                        NN Supermarket
                      </span>

                    </Link>

                  </div>

                  <div className="flex-1 overflow-y-auto p-4">

                    {/* MOBILE SEARCH */}

                    <form
                      onSubmit={
                        handleSearch
                      }
                      className="mb-6"
                    >

                      <div className="relative">

                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                        <Input
                          type="search"
                          placeholder="Search products..."
                          value={
                            searchQuery
                          }
                          onChange={(e) =>
                            setSearchQuery(
                              e.target.value
                            )
                          }
                          className="pl-10"
                        />

                      </div>

                    </form>

                    {/* ================================= */}
                    {/* USER INFO */}
                    {/* ================================= */}

                    {mounted &&
                      isAuthenticated && (

                        <div className="p-4 bg-muted rounded-xl mb-6">

                          <p className="text-xs text-muted-foreground mb-1">
                            Logged in as
                          </p>

                          <p className="font-semibold text-foreground">
                            {user?.name}
                          </p>

                          <p className="text-sm text-muted-foreground truncate">
                            {user?.email}
                          </p>

                        </div>

                      )}

                    {/* ================================= */}
                    {/* MOBILE NAV */}
                    {/* ================================= */}

                    <nav className="space-y-1">

                      {navLinks.map(
                        (link) => (

                          <Link
                            key={
                              link.href
                            }
                            href={
                              link.href
                            }
                            onClick={() =>
                              setIsMobileMenuOpen(
                                false
                              )
                            }
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors font-medium"
                          >

                            {link.label}

                          </Link>

                        )
                      )}

                      {/* ================================= */}
                      {/* MOBILE AUTH */}
                      {/* ================================= */}

                      {mounted &&
                      isAuthenticated ? (

                        <button
                          onClick={
                            handleLogout
                          }
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors font-medium w-full text-left"
                        >

                          <LogOut className="w-5 h-5" />

                          Logout

                        </button>

                      ) : (

                        <Link
                          href="/auth"
                          onClick={() =>
                            setIsMobileMenuOpen(
                              false
                            )
                          }
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors font-medium"
                        >

                          <User className="w-5 h-5" />

                          Login / Signup

                        </Link>

                      )}

                    </nav>

                  </div>

                  {/* MOBILE FOOTER */}

                  <div className="p-4 border-t border-border">

                    <p className="text-xs text-muted-foreground text-center">
                      Fresh groceries delivered to your doorstep
                    </p>

                  </div>

                </div>

              </SheetContent>

            </Sheet>

          </div>

        </div>

      </div>

    </header>
  )
}