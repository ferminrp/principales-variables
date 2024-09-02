import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Argentine Central Bank Dashboard",
  description: "View key economic indicators and statistics from the Argentine Central Bank",
  keywords: "Argentina, Central Bank, Economy, Finance, Dashboard",
  authors: [{ name: "ferminrp" }],
  openGraph: {
    title: "Argentine Central Bank Dashboard",
    description: "Key economic indicators from Argentina's Central Bank",
    type: "website",
    url: "https://bcra.ferminrp.com",
    images: [{ url: "https://i.ibb.co/wYqyzBL/pv.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Argentine Central Bank Dashboard",
    description: "Key economic indicators from Argentina's Central Bank",
    images: ["https://i.ibb.co/wYqyzBL/pv.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
