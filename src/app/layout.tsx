import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Build What You Need by Chris - Stop Paying for SaaS, Start Building",
    template: "%s | Build What You Need"
  },
  description: "Join 1000+ entrepreneurs vibe coding with AI. Learn to build your own SaaS tools, save thousands per month, and own everything. Get free templates to replace expensive subscriptions.",
  keywords: ["SaaS alternatives", "build your own tools", "AI coding", "no-code", "low-code", "save money on software", "entrepreneur tools", "vibe coding", "Chris Lee"],
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
    title: "Build What You Need by Chris - Stop Paying for SaaS, Start Building",
    description: "Join 1000+ entrepreneurs vibe coding with AI. Learn to build your own SaaS tools, save thousands per month, and own everything.",
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
    title: "Build What You Need by Chris",
    description: "Join 1000+ entrepreneurs vibe coding with AI. Build your own SaaS tools and save thousands.",
    images: ["/images/logo.png"],
    creator: "@aichrislee",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  alternates: {
    canonical: "https://buildwhatyouneed.com",
  },
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