import type { Metadata } from "next";
import { AuthProvider } from "./providers/AuthContext";
import { SocketProvider } from "./providers/SocketContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "GigFlow – Hire Top Freelancers & Find Freelance Work",
  description:
    "GigFlow connects businesses with elite freelancers across 50+ skills. Post a job for free, browse verified profiles, and launch your project faster with secure milestone payments.",
  keywords: [
    "freelancing",
    "hire freelancers",
    "find work",
    "remote jobs",
    "upwork alternative",
    "gigflow",
  ],
  openGraph: {
    title: "GigFlow – Hire Top Freelancers & Find Freelance Work",
    description:
      "The modern freelancing platform connecting businesses with world-class talent.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
