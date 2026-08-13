import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  const socialImage = `${protocol}://${host}/og.png`;
  return {
    title: { default: "Keeper — 2016 BMW F30 maintenance intelligence", template: "%s · Keeper" },
    description: "A configuration-aware maintenance plan, issue library, and service journal for the 2016 BMW F30 family.",
    openGraph: {
      title: "Keeper — Know what your F30 needs next",
      description: "BMW schedules, 320i–340i issue research, configuration filtering, and service history in one place.",
      type: "website",
      images: [{ url: socialImage, width: 1672, height: 941, alt: "Keeper F30 maintenance intelligence" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Keeper — 2016 BMW F30 intelligence",
      description: "Know what your exact F30 needs next, and why.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
