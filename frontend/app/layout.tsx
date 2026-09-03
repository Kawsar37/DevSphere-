import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/features/auth/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevSphere - Developer Platform & Community",
  description: "A production-minded developer community platform built for engineers building resilient systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-on-surface`}
      >
        <AuthProvider>
          <Header />
          <main className="pt-16 min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
