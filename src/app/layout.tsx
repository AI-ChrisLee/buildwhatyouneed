import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Build What You Need - Productize Yourself Using AI | Chris Lee",
    template: "%s | Build What You Need"
  },
  description: "I'm productizing myself with AI. Building one SaaS tool per week. Every error documented. Join entrepreneurs who build tools that work exactly how THEY work. Save $20K+ yearly.",
  keywords: ["productize yourself", "build what you need", "AI automation", "SaaS replacement", "entrepreneur tools", "build your own software", "one week one app", "Chris Lee", "save $20K SaaS"],
  authors: [{ name: "Chris Lee" }],
  creator: "Chris Lee",
  publisher: "Build What You Need",
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
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://buildwhatyouneed.com",
    siteName: "Build What You Need",
    title: "Build What You Need - Productize Yourself Using AI",
    description: "I'm productizing myself with AI. Building one SaaS tool per week. Every error documented. Join entrepreneurs who build instead of rent.",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Build What You Need by Chris",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build What You Need - Productize Yourself Using AI",
    description: "One week, one app. Every error documented. Build tools that work exactly how YOU work. Save $20K+ yearly.",
    images: ["/images/logo.png"],
    creator: "@aichrislee",
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