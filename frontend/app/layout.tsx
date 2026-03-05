import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agri Guard — Livestock Health Monitoring",
  description: "Real-time livestock health monitoring and early disease detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
