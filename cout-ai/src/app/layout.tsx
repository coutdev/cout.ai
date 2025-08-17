import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ColorProvider } from '../context/ColorContext';

export const metadata: Metadata = {
  // Title that appears at the top of the browser window
  title: "Cout.AI - Professional AI Assistant", 
  // Metadata description
  description: "Your intelligent AI companion for any question, task, or conversation. Experience the future of AI assistance with our modern, professional platform.",
  keywords: "AI assistant, artificial intelligence, chat bot, AI chat, intelligent assistant, AI companion",
  openGraph: {
    title: "Cout.AI - Professional AI Assistant",
    description: "Your intelligent AI companion for any question, task, or conversation.",
    type: "website",
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#4338ca" }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cout.AI'
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <ColorProvider>
            <AuthProvider>{children}</AuthProvider>
          </ColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
