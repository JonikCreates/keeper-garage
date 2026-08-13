import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  const socialImage = `${protocol}://${host}/og.png`;

  return {
    title: {
      default: "Keeper — Maintenance intelligence for enthusiast cars",
      template: "%s · Keeper",
    },
    description:
      "A sourced maintenance dashboard and digital service journal for cars worth keeping.",
    openGraph: {
      title: "Keeper — Know what your car needs next",
      description:
        "OEM schedules, enthusiast guidance, known issues, and your complete service history in one place.",
      type: "website",
      images: [{ url: socialImage, width: 1672, height: 939, alt: "Keeper maintenance intelligence dashboard" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Keeper — Maintenance intelligence for enthusiast cars",
      description: "Know what your car needs next, and why.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
