'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Leaf,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { setAdminAuth, setAuthToken } from '@/lib/api'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:5000'
export default function AuthPage() {
  const router = useRouter()

  // UI State
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form state
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [signupTerms, setSignupTerms] = useState(false)

  // ============================================
  // Validation Helpers
  // ============================================

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateGmail = (email: string): boolean => {
    return email.toLowerCase().endsWith('@gmail.com')
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[\d\s-]{10,}$/
    return phoneRegex.test(phone)
  }

  // ============================================
  // Login Handler
  // ============================================

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (!validateEmail(loginEmail)) {
      toast.error('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error('Login failed', {
          description:
            data.message || 'Invalid email or password',
        })
        setIsLoading(false)
        return
      }

      // Store real JWT token
      setAuthToken(data.token)

      // Store real user data
      localStorage.setItem(
        'nn-user',
        JSON.stringify(data.user)
      )

      // Admin login
      if (data.user.role === 'admin') {
        setAdminAuth(true)

        toast.success('Admin login successful', {
          description: 'Redirecting to dashboard...',
          icon: (
            <ShieldCheck className="w-5 h-5 text-primary" />
          ),
        })

        setTimeout(() => {
          router.push('/admin')
        }, 1000)
      } else {
        // Customer login
        setAdminAuth(false)

        toast.success('Welcome back!', {
          description:
            'Login successful. Redirecting...',
        })

        setTimeout(() => {
          router.push('/')
        }, 1000)
      }
    } catch (error) {
      console.error('LOGIN ERROR:', error)

      toast.error('Connection error', {
        description:
          'Unable to connect to the server. Make sure the backend is running.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // Signup Handler
  // ============================================

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (
      !signupName ||
      !signupEmail ||
      !signupPhone ||
      !signupPassword ||
      !signupConfirmPassword
    ) {
      toast.error('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (signupName.trim().length < 2) {
      toast.error(
        'Please enter a valid name (at least 2 characters)'
      )
      setIsLoading(false)
      return
    }

    if (!validateGmail(signupEmail)) {
      toast.error('Only Gmail addresses are allowed', {
        description:
          'Please use an @gmail.com email address',
      })
      setIsLoading(false)
      return
    }

    if (!validatePhone(signupPhone)) {
      toast.error('Please enter a valid phone number')
      setIsLoading(false)
      return
    }

    if (signupPassword.length < 6) {
      toast.error('Password too short', {
        description:
          'Password must be at least 6 characters',
      })
      setIsLoading(false)
      return
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (!signupTerms) {
      toast.error('Please accept the Terms of Service')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/users/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: signupName.trim(),
            email: signupEmail.toLowerCase().trim(),
            phone: signupPhone.trim(),
            password: signupPassword,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        toast.error('Signup failed', {
          description:
            data.message || 'Unable to create account',
        })
        setIsLoading(false)
        return
      }

      // Store real JWT token
      setAuthToken(data.token)

      // Store real user data
      localStorage.setItem(
        'nn-user',
        JSON.stringify(data.user)
      )

      setAdminAuth(false)

      toast.success('Account created!', {
        description:
          'Welcome to NN Supermarket. Redirecting...',
      })

      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (error) {
      console.error('SIGNUP ERROR:', error)

      toast.error('Connection error', {
        description:
          'Unable to connect to the server. Make sure the backend is running.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // Render
  // ============================================

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />

        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft"
          style={{ animationDelay: '1s' }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-8 group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-primary/25">
            <Leaf className="w-7 h-7 text-primary-foreground" />
          </div>

          <span className="text-2xl font-bold text-foreground">
            NN<span className="text-primary">Supermarket</span>
          </span>
        </Link>

        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-0">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger
                  value="login"
                  className="text-sm font-medium"
                >
                  Login
                </TabsTrigger>

                <TabsTrigger
                  value="signup"
                  className="text-sm font-medium"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* ============================================
                Login Tab
                ============================================ */}
            <TabsContent value="login">
              <CardHeader className="pt-6 pb-2">
                <CardTitle className="text-2xl">
                  Welcome back!
                </CardTitle>

                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="login-email">
                      Email
                    </Label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 h-11"
                        value={loginEmail}
                        onChange={(e) =>
                          setLoginEmail(e.target.value)
                        }
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">
                        Password
                      </Label>

                      <Link
                        href="#"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                      <Input
                        id="login-password"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="Enter your password"
                        className="pl-10 pr-10 h-11"
                        value={loginPassword}
                        onChange={(e) =>
                          setLoginPassword(e.target.value)
                        }
                        disabled={isLoading}
                        autoComplete="current-password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />

                    <Label
                      htmlFor="remember"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Remember me for 30 days
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        Login
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>

                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full h-11"
                    type="button"
                    disabled={isLoading}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />

                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />

                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />

                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>

                    Google
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-11"
                    type="button"
                    disabled={isLoading}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                    </svg>

                    Apple
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            {/* ============================================
                Signup Tab
                ============================================ */}
            <TabsContent value="signup">
              <CardHeader className="pt-6 pb-2">
                <CardTitle className="text-2xl">
                  Create an account
                </CardTitle>

                <CardDescription>
                  Enter your details to get started (Gmail only)
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form
                  onSubmit={handleSignup}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">
                      Full Name
                    </Label>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10 h-11"
                        value={signupName}
                        onChange={(e) =>
                          setSignupName(e.target.value)
                        }
                        disabled={isLoading}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">
                      Email (Gmail only)
                    </Label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="yourname@gmail.com"
                        className="pl-10 h-11"
                        value={signupEmail}
                        onChange={(e) =>
                          setSignupEmail(e.target.value)
                        }
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Only @gmail.com addresses are accepted
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">
                      Phone Number
                    </Label>

                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="pl-10 h-11"
                        value={signupPhone}
                        onChange={(e) =>
                          setSignupPhone(e.target.value)
                        }
                        disabled={isLoading}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">
                      Password
                    </Label>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                      <Input
                        id="signup-password"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="Min. 6 characters"
                        className="pl-10 pr-10 h-11"
                        value={signupPassword}
                        onChange={(e) =>
                          setSignupPassword(e.target.value)
                        }
                        disabled={isLoading}
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">
                      Confirm Password
                    </Label>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                      <Input
                        id="signup-confirm-password"
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="Confirm your password"
                        className="pl-10 pr-10 h-11"
                        value={signupConfirmPassword}
                        onChange={(e) =>
                          setSignupConfirmPassword(
                            e.target.value
                          )
                        }
                        disabled={isLoading}
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      className="mt-0.5"
                      checked={signupTerms}
                      onCheckedChange={(checked) =>
                        setSignupTerms(
                          checked === true
                        )
                      }
                    />

                    <Label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                    >
                      I agree to the{' '}
                      <Link
                        href="#"
                        className="text-primary hover:underline"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="#"
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Back to Home */}
        <p className="text-center mt-6 text-muted-foreground">
          <Link
            href="/"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
        </p>
      </div>
    </main>
  )
}