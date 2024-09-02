import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Argentine Central Bank Dashboard",
  description: "View key economic indicators and statistics from the Argentine Central Bank",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
