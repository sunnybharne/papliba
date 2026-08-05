import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Papliba",
  description: "Papliba local-first workflow builder.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
