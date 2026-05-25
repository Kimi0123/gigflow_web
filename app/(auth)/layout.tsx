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
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image
          src="/assets/logo.svg"
          alt="GigFlow logo"
          width={48}
          height={48}
        />
        <span className="text-xl font-bold text-gray-900 tracking-tight">
          GigFlow
        </span>
      </div>

      {children}
    </div>
  );
}
