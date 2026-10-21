import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TabBar } from "@/components/TabBar";
import { Providers } from "@/components/Providers";
import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flightly",
  description:
    "Personal Flighty-style flight tracker. Pro features unlocked — delay predictions, Where's My Plane, airport ops, passport.",
  applicationName: "Flightly",
  appleWebApp: {
    capable: true,
    title: "Flightly",
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${body.variable} antialiased`}>
        <Providers>
          <div className="mx-auto min-h-screen max-w-lg md:max-w-2xl lg:max-w-4xl">
            {children}
          </div>
          <TabBar />
        </Providers>
      </body>
    </html>
  );
}
