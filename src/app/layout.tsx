import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import { Toaster } from "@/components/ui/sonner";
import { ImpersonationBanner } from "@/components/impersonation-banner";

export const metadata: Metadata = {
  title: "DataMingle - Your Database Solution",
  description: "Monitor, secure, and optimize your database with DataMingle.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <AuthKitProvider>
          <ImpersonationBanner />
          {children}
          <Toaster />
        </AuthKitProvider>
      </body>
    </html>
  );
}
