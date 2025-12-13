import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import AppInit from "@/components/common/AppInit";
import FramerProvider from "@/components/common/FramerProvider";
import { generateMetaKeywords, generateLocalBusinessSchema } from "@/lib/seo";
import "./globals.css";

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

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
  title: "Khazaana - Food Ordering Application",
  description: "Order food from your favorite restaurants in Aurangabad, West Bengal",
  keywords: generateMetaKeywords(),
  openGraph: {
    title: "Khazaana - Food Delivery in Aurangabad",
    description: "Order biryani, Chinese, and more from top restaurants in Aurangabad, West Bengal.",
    url: "https://khazaana.co.in",
    siteName: "Khazaana",
    images: [
      {
        url: "https://khazaana.co.in/og-image.jpg", // Ensure this image exists or use a placeholder
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
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
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="65f79836-7e67-4637-ac7d-fce6b4f15e52"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <FramerProvider>
          <AppInit />
          {children}
        </FramerProvider>
      </body>
    </html>
  );

  if (clerkPubKey) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
