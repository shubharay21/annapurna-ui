import type { Metadata } from "next";
import { LanguageProvider } from "./i18n/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Annapurna Yojana | Family Level Data Collection",
  description: "Official portal for Family Level Data Collection under Annapurna Yojana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-background text-on-surface">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
