import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast-container";
import { ThemeProvider } from "@/components/theme-provider";

import { WebSocketInitializer } from "@/components/websocket-initializer";

import { DebugEnv } from "@/components/debug-env";

const ibmSans = IBM_Plex_Sans({
  variable: "--font-ibm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MERMAN_IDE",
  description: "A fullstack Mermaid.js IDE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read environment variable at runtime (Server Component)
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ibmSans.variable} ${ibmMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <WebSocketInitializer url={wsUrl} />
        <DebugEnv url={wsUrl} />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
