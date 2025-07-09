import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Footer from "@/components/footer"
import { AuthProvider } from "@/providers/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Control OS by AI Chris Lee - Learn Vibe Coding & Build SaaS Replacements",
    template: "%s | Control OS"
  },
  description: "Learn vibe coding with AI Chris Lee. Build SaaS replacements in hours using AI. Control your software stack. Free blueprints, weekly builds, 2k+ builders. Start free today.",
  keywords: ["vibe coding", "AI Chris Lee", "Control OS", "AI development", "build SaaS with AI", "replace SaaS", "AI coding", "Claude AI", "Cursor IDE", "SaaS alternatives", "build don't rent", "cancel subscriptions", "software ownership", "AI automation"],
  authors: [{ name: "AI Chris Lee", url: "https://aichrislee.com" }],
  creator: "AI Chris Lee",
  publisher: "Control OS",
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
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://buildwhatyouneed.com",
    siteName: "Control OS",
    title: "Control OS by AI Chris Lee - Learn Vibe Coding & Build SaaS Replacements",
    description: "Learn vibe coding with AI Chris Lee. Build SaaS replacements in hours using AI. Control your software stack. Free blueprints, weekly builds, 2k+ builders.",
    images: [
      {
        url: "https://buildwhatyouneed.com/control-os-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Control OS by AI Chris Lee - Learn Vibe Coding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Control OS - Learn Vibe Coding with AI",
    description: "Build SaaS replacements in hours using AI. Control your software stack. Free blueprints by AI Chris Lee.",
    images: ["https://buildwhatyouneed.com/control-os-hero.jpg"],
    creator: "@AiChrisLee",
    site: "@AiChrisLee",
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
        <AuthProvider>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}