import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist_Mono, Onest } from 'next/font/google'
import './globals.css'

const onest = Onest({
  variable: '--font-onest',
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  display: 'swap',
  fallback: ['Arial'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Wise Choice — Умный выбор',
  description:
    'Учебный сервис для анализа рекламных обещаний, маркетингового давления и признаков риска в предложениях онлайн-курсов.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      className={`${onest.variable} ${geistMono.variable} dark`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
