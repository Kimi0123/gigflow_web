import type { Metadata } from "next";
import { AuthProvider } from "./providers/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "GigFlow",
  description: "GigFlow authentication dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
