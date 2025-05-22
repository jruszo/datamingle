import "@/styles/globals.css"; // Assuming landing page uses global styles
import { type Metadata } from "next";
import { Geist } from "next/font/google"; // Or a different font if desired

export const metadata: Metadata = {
  title: "DataMingle - Welcome!", // Landing-page specific title
  description: "Discover DataMingle, your all-in-one database solution.", // Landing-page specific description
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  // Or your chosen font setup for the landing page
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>{children}</body>{" "}
      {/* This will render src/app/(landing)/page.tsx */}
    </html>
  );
}
