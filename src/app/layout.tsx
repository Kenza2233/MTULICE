import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { BackgroundRenderer } from "@/components/background/BackgroundRenderer";
import { SettingsModal } from "@/components/settings/SettingsModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MULTILIVE - Web Platform Multiview",
  description: "Watch up to 12 live video streams simultaneously from YouTube, Twitch, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-white selection:bg-cyan-500/30`}>
        <BackgroundRenderer />
        <Header />
        <Sidebar />
        <SettingsModal />
        <main className="pt-14 h-screen w-full flex overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
