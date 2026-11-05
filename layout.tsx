import type { Metadata, Viewport } from 'next'
import { Poppins, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ToastProvider } from '@/components/toast-provider'
import './globals.css'

// Primary font - Poppins for headings and UI
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

// Secondary font - Inter for body text
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'NN Supermarket - Fresh Groceries Delivered',
    template: '%s | NN Supermarket',
  },

  description:
    'Your one-stop shop for fresh groceries, vegetables, fruits, dairy, and household essentials. Quality products at the best prices with fast delivery.',

  keywords: [
    'supermarket',
    'groceries',
    'fresh vegetables',
    'fruits',
    'dairy',
    'online shopping',
    'delivery',
    'Indian supermarket',
  ],

  authors: [{ name: 'NN Supermarket' }],

  creator: 'NN Supermarket',

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'NN Supermarket',
    title: 'NN Supermarket - Fresh Groceries Delivered',
    description:
      'Your one-stop shop for fresh groceries with fast delivery.',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'NN Supermarket - Fresh Groceries Delivered',
    description:
      'Your one-stop shop for fresh groceries with fast delivery.',
  },

  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0FA958',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}

        <ToastProvider />

        {process.env.NODE_ENV === 'production' && (
          <Analytics />
        )}
      </body>
    </html>
  )
}