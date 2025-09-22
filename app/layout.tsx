import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../contexts/AuthContext";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import ClickSpark from "../components/ClickSpark";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillDash | AI-Powered Skill Platform for Bangladesh's Youth",
  description: "The AI-Powered platform for Bangladesh's youth to discover skills, learn new courses, get resume feedback, and find opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ClickSpark
          sparkColor="#3B82F6"
          sparkSize={12}
          sparkRadius={20}
          sparkCount={10}
          duration={500}
          easing="ease-out"
          extraScale={1.2}
        >
          <AuthProvider>
            <Navbar />
            <main>
              {children}
            </main>
          </AuthProvider>
        </ClickSpark>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
