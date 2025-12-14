import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppInit from "@/components/common/AppInit";
import FramerProvider from "@/components/common/FramerProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/components/ui/Toast";
import { generateMetaKeywords, generateLocalBusinessSchema } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Prevent FOIT - show fallback font immediately
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Prevent FOIT - show fallback font immediately
  preload: true,
});

export const metadata: Metadata = {
  title: "Khazaana - Food Delivery in Aurangabad | Order Biryani, Chinese Online",
  description: "Order delicious biryani, Chinese food, and cafe items in Aurangabad, West Bengal. Fast delivery from top restaurants like Cups N Crumbs, Bandhu Hotel. Call +91 86959 02696",
  keywords: generateMetaKeywords(),
  openGraph: {
    title: "Khazaana - Food Delivery in Aurangabad | Order Online Now",
    description: "🍽️ Order biryani, Chinese, cafe food in Aurangabad, West Bengal. Fast delivery to DNC College, College More. Best prices guaranteed!",
    url: "https://khazaana.co.in",
    siteName: "Khazaana",
    images: [
      {
        url: "https://khazaana.co.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Khazaana Food Delivery - Order Biryani and Chinese Food in Aurangabad",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Khazaana - Food Delivery in Aurangabad",
    description: "🍛 Order biryani, Chinese food online in Aurangabad, West Bengal. Fast delivery! 🚀",
    images: ["https://khazaana.co.in/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://khazaana.co.in",
    languages: {
      'en-IN': 'https://khazaana.co.in',
      'bn-IN': 'https://khazaana.co.in',
    },
  },
  other: {
    'theme-color': '#FF6A00',
    'msapplication-TileColor': '#FF6A00',
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Khazaana',
    'application-name': 'Khazaana',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = generateLocalBusinessSchema();

  const content = (
    <html lang="en">
      <head>
        {/* Preconnect to external origins for faster loading */}
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://www.googleapis.com" />
        <link rel="preconnect" href="https://cloud.umami.is" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googleapis.com" />
        
        {/* Analytics - load async to not block rendering */}
        <script
          async
          src="https://cloud.umami.is/script.js"
          data-website-id="65f79836-7e67-4637-ac7d-fce6b4f15e52"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <LanguageProvider>
          <ToastProvider>
            <FramerProvider>
              <AppInit />
              {children}
            </FramerProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );

  return content;
}
