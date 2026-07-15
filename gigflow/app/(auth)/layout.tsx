import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Top-left logo */}
      <Link
        href="/"
        className="absolute left-6 top-6 z-50 flex items-center gap-2"
      >
        <Image
          src="/assets/logo.svg"
          alt="GigFlow logo"
          width={48}
          height={48}
          priority
        />
        <span className="text-xl font-bold">
          GigFlow
        </span>
      </Link>

      {children}
    </div>
  );
}
