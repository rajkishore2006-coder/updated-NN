/**
 * API Utility Functions for NN Supermarket
 *
 * Shared API and authentication utilities for the frontend.
 * Backend: Node.js + Express + MongoDB
 */

// ============================================
// Types & Interfaces
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  name: string
  email: string
  phone: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    phone: string
    role?: 'customer' | 'admin'
  }
  token: string
  isAdmin?: boolean
}

// ============================================
// Authentication Storage
// ============================================

// Same token key used by the real backend login.
const TOKEN_KEY = 'nn_supermarket_token'

// Admin status flag
const ADMIN_TOKEN = 'nn_admin_authenticated'

// Logged-in user information
const USER_KEY = 'nn-user'

// ============================================
// JWT Token Management
// ============================================

/**
 * Store JWT authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/**
 * Get stored JWT authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }

  return null
}

/**
 * Remove authentication information
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_TOKEN)
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Check whether a JWT token exists
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

// ============================================
// Admin Authentication
// ============================================

/**
 * Set admin authentication status
 *
 * Backend authorization is handled by JWT middleware.
 * This flag is only used for frontend state compatibility.
 */
export function setAdminAuth(value: boolean): void {
  if (typeof window !== 'undefined') {
    if (value) {
      localStorage.setItem(ADMIN_TOKEN, 'true')
    } else {
      localStorage.removeItem(ADMIN_TOKEN)
    }
  }
}

/**
 * Check whether admin authentication flag exists
 */
export function isAdminAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ADMIN_TOKEN) === 'true'
  }

  return false
}

// ============================================
// User Storage
// ============================================

export interface StoredUser {
  id: string
  name: string
  email: string
  phone: string
  role?: 'customer' | 'admin'
}

/**
 * Store logged-in user information
 */
export function setStoredUser(
  user: StoredUser
): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    )
  }
}

/**
 * Get logged-in user information
 */
export function getStoredUser(): StoredUser | null {
  if (typeof window !== 'undefined') {
    const user =
      localStorage.getItem(USER_KEY)

    if (!user) {
      return null
    }

    try {
      return JSON.parse(user) as StoredUser
    } catch {
      return null
    }
  }

  return null
}

/**
 * Remove logged-in user information
 */
export function removeStoredUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY)
  }
}

// ============================================
// Logout
// ============================================

/**
 * Clear all authentication information
 */
export function logout(): void {
  removeAuthToken()
  removeStoredUser()
}

// ============================================
// API Configuration
// ============================================

/**
 * Backend API URL
 *
 * Development:
 * NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
 *
 * The /api suffix is added here so all callers
 * can use endpoints like:
 *
 * /products
 * /orders
 * /users/login
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:5000'

/**
 * Full API root
 */
export const API_ROOT_URL =
  `${API_BASE_URL}/api`

// ============================================
// Generic Authenticated Fetch
// ============================================

/**
 * Generic fetch wrapper.
 *
 * Automatically adds:
 * Authorization: Bearer <JWT>
 */
export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  }

  try {
    const response = await fetch(
      `${API_ROOT_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message:
          data?.message ||
          'Request failed',
        error: data?.error,
      }
    }

    return data
  } catch (error) {
    return {
      success: false,
      message:
        'Network error. Please try again.',
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error',
    }
  }
}

// ============================================
// Auth API
// ============================================

/**
 * Login
 *
 * Backend:
 * POST /api/users/login
 */
export async function apiLogin(
  payload: LoginPayload
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(
      `${API_ROOT_URL}/users/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data =
      await response.json()

    if (!response.ok) {
      return {
        success: false,
        message:
          data?.message ||
          'Login failed',
      }
    }

    if (data.token) {
      setAuthToken(data.token)
    }

    if (data.user) {
      setStoredUser(data.user)
    }

    if (
      data.user?.role === 'admin'
    ) {
      setAdminAuth(true)
    } else {
      setAdminAuth(false)
    }

    return {
      success: true,
      message:
        data.message ||
        'Login successful',
      data: {
        token: data.token,
        user: data.user,
        isAdmin:
          data.user?.role ===
          'admin',
      },
    }
  } catch (error) {
    return {
      success: false,
      message:
        'Network error. Please try again.',
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error',
    }
  }
}

// ============================================
// Signup API
// ============================================

/**
 * Register new customer
 *
 * Backend:
 * POST /api/users/register
 */
export async function apiSignup(
  payload: SignupPayload
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(
      `${API_ROOT_URL}/users/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data =
      await response.json()

    if (!response.ok) {
      return {
        success: false,
        message:
          data?.message ||
          'Registration failed',
      }
    }

    if (data.token) {
      setAuthToken(data.token)
    }

    if (data.user) {
      setStoredUser(data.user)
    }

    setAdminAuth(false)

    return {
      success: true,
      message:
        data.message ||
        'Registration successful',
      data: {
        token: data.token,
        user: data.user,
        isAdmin:
          data.user?.role ===
          'admin',
      },
    }
  } catch (error) {
    return {
      success: false,
      message:
        'Network error. Please try again.',
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error',
    }
  }
}

// ============================================
// Products API
// ============================================

/**
 * Get all products
 *
 * Backend:
 * GET /api/products
 */
export async function apiGetProducts(): Promise<
  ApiResponse<unknown>
> {
  return fetchWithAuth<unknown>(
    '/products',
    {
      method: 'GET',
    }
  )
}

// ============================================
// Orders API
// ============================================

/**
 * Create order
 *
 * Backend:
 * POST /api/orders
 */
export async function apiCreateOrder(
  orderData: unknown
): Promise<ApiResponse<unknown>> {
  return fetchWithAuth<unknown>(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify(orderData),
    }
  )
}

// ============================================
// WhatsApp Integration
// ============================================

export interface OrderItem {
  name: string
  price: number
  quantity: number
  unit: string
}

export interface WhatsAppOrderData {
  items: OrderItem[]
  subtotal: number
  discount: number
  deliveryFee: number
  total: number
  customerName?: string
  customerPhone?: string
}

/**
 * Generate WhatsApp order message
 */
export function generateWhatsAppMessage(
  orderData: WhatsAppOrderData
): string {
  const {
    items,
    subtotal,
    discount,
    deliveryFee,
    total,
    customerName,
  } = orderData

  let message =
    `*NN Supermarket Order*\n`

  message +=
    `================================\n\n`

  if (customerName) {
    message +=
      `Customer: ${customerName}\n\n`
  }

  message +=
    `*Order Items:*\n`

  message +=
    `--------------------------------\n`

  items.forEach(
    (item, index) => {
      message +=
        `${index + 1}. ${item.name}\n`

      message +=
        `   ₹${item.price} × ${item.quantity} = ₹${
          item.price *
          item.quantity
        }\n`
    }
  )

  message +=
    `\n--------------------------------\n`

  message +=
    `Subtotal: ₹${subtotal}\n`

  if (discount > 0) {
    message +=
      `Discount: -₹${discount}\n`
  }

  message +=
    `Delivery: ${
      deliveryFee === 0
        ? 'FREE'
        : `₹${deliveryFee}`
    }\n`

  message +=
    `--------------------------------\n`

  message +=
    `*TOTAL: ₹${total}*\n`

  message +=
    `================================\n\n`

  message +=
    `Please confirm my order. Thank you!`

  return encodeURIComponent(
    message
  )
}

/**
 * Open WhatsApp with order
 */
export function openWhatsAppOrder(
  phoneNumber: string,
  orderData: WhatsAppOrderData
): void {
  const message =
    generateWhatsAppMessage(
      orderData
    )

  const whatsappUrl =
    `https://wa.me/${phoneNumber}?text=${message}`

  window.open(
    whatsappUrl,
    '_blank'
  )
}