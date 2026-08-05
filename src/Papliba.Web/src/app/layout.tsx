import type { Metadata } from "next";
import "./globals.css";

const themeScript = `
  (function () {
    try {
      var theme = window.localStorage.getItem("papliba-theme");

      if (theme === "light" || theme === "dark") {
        document.documentElement.dataset.theme = theme;
      }
    } catch (_) {}
  })();
`;

export const metadata: Metadata = {
  title: "Papliba",
  description: "Papliba local-first workflow builder.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
