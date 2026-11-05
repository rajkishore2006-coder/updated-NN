'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
  apiLogin,
  apiSignup,
  logout as apiLogout,
  type StoredUser,
} from '@/lib/api'

// ============================================
// USER TYPE
// ============================================

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role?: 'customer' | 'admin'
}

// ============================================
// AUTH RESPONSE
// ============================================

export interface AuthActionResult {
  success: boolean
  message: string
  isAdmin?: boolean
}

// ============================================
// AUTH STORE
// ============================================

interface AuthStore {
  user: User | null

  // Kept for compatibility with older components.
  // Authentication is no longer based on this array.
  users: {
    email: string
    password: string
    name: string
    phone: string
  }[]

  isAuthenticated: boolean

  login: (
    email: string,
    password: string
  ) => Promise<AuthActionResult>

  signup: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<AuthActionResult>

  logout: () => void
}

// ============================================
// CONVERT API USER -> STORE USER
// ============================================

function mapUser(
  user: StoredUser
): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  }
}

// ============================================
// STORE
// ============================================

export const useAuthStore =
  create<AuthStore>()(
    persist(
      (set) => ({
        // ========================================
        // INITIAL STATE
        // ========================================

        user: null,

        users: [],

        isAuthenticated: false,

        // ========================================
        // LOGIN
        // ========================================

        login: async (
          email,
          password
        ) => {
          const result =
            await apiLogin({
              email:
                email.trim().toLowerCase(),

              password,
            })

          if (
            !result.success ||
            !result.data?.user
          ) {
            return {
              success: false,
              message:
                result.message ||
                'Login failed',
            }
          }

          const user =
            mapUser(
              result.data.user
            )

          set({
            user,
            isAuthenticated: true,
          })

          return {
            success: true,
            message:
              result.message ||
              'Login successful',

            isAdmin:
              user.role ===
              'admin',
          }
        },

        // ========================================
        // SIGNUP
        // ========================================

        signup: async (
          name,
          email,
          phone,
          password
        ) => {
          const cleanName =
            name.trim()

          const cleanEmail =
            email.trim().toLowerCase()

          const cleanPhone =
            phone.trim()

          // Client-side validation
          // Backend also validates the request.

          if (
            !cleanEmail.endsWith(
              '@gmail.com'
            )
          ) {
            return {
              success: false,
              message:
                'Only Gmail addresses (@gmail.com) are allowed',
            }
          }

          if (
            password.length < 6
          ) {
            return {
              success: false,
              message:
                'Password must be at least 6 characters',
            }
          }

          if (
            cleanName.length < 2
          ) {
            return {
              success: false,
              message:
                'Please enter a valid name',
            }
          }

          if (
            cleanPhone.length < 10
          ) {
            return {
              success: false,
              message:
                'Please enter a valid phone number',
            }
          }

          const result =
            await apiSignup({
              name: cleanName,

              email:
                cleanEmail,

              phone:
                cleanPhone,

              password,
            })

          if (
            !result.success ||
            !result.data?.user
          ) {
            return {
              success: false,
              message:
                result.message ||
                'Registration failed',
            }
          }

          const user =
            mapUser(
              result.data.user
            )

          set({
            user,
            isAuthenticated: true,
          })

          return {
            success: true,
            message:
              result.message ||
              'Account created successfully',

            isAdmin:
              user.role ===
              'admin',
          }
        },

        // ========================================
        // LOGOUT
        // ========================================

        logout: () => {
          apiLogout()

          set({
            user: null,
            isAuthenticated:
              false,
          })
        },
      }),

      {
        name:
          'nn-supermarket-auth',

        // IMPORTANT:
        // Do not persist passwords or
        // local demo users.

        partialize: (state) => ({
          user:
            state.user,

          isAuthenticated:
            state.isAuthenticated,

          users: [],
        }),
      }
    )
  )