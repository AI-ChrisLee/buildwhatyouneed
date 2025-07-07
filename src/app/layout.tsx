import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Build What You Need With Vibe Coding - The SaaS Genocide",
    template: "%s | The SaaS Genocide"
  },
  description: "Build what you need with vibe coding. We're ending SaaS subscriptions forever. Kill your first bill in 14 days using AI. Join The SaaS Genocide.",
  keywords: ["SaaS genocide", "vibe coding", "kill SaaS subscriptions", "build don't rent", "SaaS replacement", "software sovereignty", "cancel SaaS", "build what you need", "no code movement", "AI development"],
  authors: [{ name: "The SaaS Genocide" }],
  creator: "The SaaS Genocide",
  publisher: "The SaaS Genocide",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.ico",
    apple: "/logo-toggle.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://buildwhatyouneed.com",
    siteName: "The SaaS Genocide",
    title: "Build What You Need With Vibe Coding - The SaaS Genocide",
    description: "Build what you need with vibe coding. We're ending SaaS subscriptions forever. Kill your first bill in 14 days.",
    images: [
      {
        url: "/logo-toggle.svg",
        width: 1200,
        height: 630,
        alt: "The SaaS Genocide Movement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The SaaS Genocide - Kill Your SaaS Bills",
    description: "Learn vibe coding. Build in hours. Join 2k+ builders. $0/month forever.",
    images: ["/logo-toggle.svg"],
    creator: "@saasgenocide",
  },
  alternates: {
    canonical: "https://buildwhatyouneed.com",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.className} h-full flex flex-col`}>
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}