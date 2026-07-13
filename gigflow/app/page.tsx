"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const navItems = [
  {
    label: "Hire Freelancers",
    href: "#",
    submenu: ["Web Development", "Design", "Writing", "Marketing"],
  },
  {
    label: "Find Work",
    href: "/dashboard",
    submenu: ["Browse Jobs", "My Proposals", "Profile"],
  },
  { label: "Explore", href: "#", submenu: ["Categories", "Trending", "Blog"] },
];

const categories = [
  {
    name: "Programming\n& Tech",
    color: "#dbeafe",
    accent: "#3b82f6",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7">
        <polyline
          points="16 18 22 12 16 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="8 6 2 12 8 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Video &\nAnimation",
    color: "#fce7f3",
    accent: "#ec4899",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7">
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="m10 9 5 3-5 3V9Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "AI Services",
    color: "#e0e7ff",
    accent: "#6366f1",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7">
        <circle
          cx="12"
          cy="12"
          r="8.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 3.5 9.5 12 12 20.5M12 3.5l2.5 8.5L12 20.5M3.5 12h17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Music &\nAudio",
    color: "#fef3c7",
    accent: "#f59e0b",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7">
        <path
          d="M9 18V5l12-2v13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="18" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    name: "Business",
    color: "#dcfce7",
    accent: "#22c55e",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7">
        <rect
          x="2"
          y="7"
          width="20"
          height="14"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <line
          x1="12"
          y1="12"
          x2="12"
          y2="16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <line
          x1="10"
          y1="14"
          x2="14"
          y2="14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Graphics &\nDesign",
    color: "#ffedd5",
    accent: "#f97316",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7">
        <circle
          cx="13.5"
          cy="6.5"
          r="3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M13.5 10v4.5l-3 3-2-2 1-1-3-3 3.5-1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 15.5 4 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Digital\nMarketing",
    color: "#f0fdf4",
    accent: "#14b8a6",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7">
        <path
          d="M22 12h-4l-3 9L9 3l-3 9H2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Writing &\nTranslation",
    color: "#fdf4ff",
    accent: "#a855f7",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7">
        <path
          d="M12 20h9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const stats = [
  { value: "2M+", label: "Active Freelancers" },
  { value: "18M+", label: "Projects Completed" },
  { value: "190+", label: "Countries" },
  { value: "$2B+", label: "Paid to Freelancers" },
];

const steps = [
  {
    step: "01",
    title: "Post a Job",
    desc: "Describe your project, set your budget, and publish your listing in minutes.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Review Proposals",
    desc: "Receive bids from skilled freelancers. Compare profiles, ratings, and portfolios.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Hire & Collaborate",
    desc: "Chat in real-time, share files, and track milestones in one workspace.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Pay Securely",
    desc: "Funds held in escrow—released only when you approve the delivered work.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
      </svg>
    ),
  },
];

const freelancers = [
  {
    name: "Sophia Kaur",
    role: "Full-Stack Developer",
    rate: "$85/hr",
    rating: 4.9,
    reviews: 214,
    skills: ["React", "Node.js", "PostgreSQL"],
    initials: "SK",
    color: "#38bdf8",
    location: "🇨🇦 Canada",
  },
  {
    name: "Marcus Chen",
    role: "UI/UX Designer",
    rate: "$70/hr",
    rating: 5.0,
    reviews: 189,
    skills: ["Figma", "Framer", "Tailwind"],
    initials: "MC",
    color: "#818cf8",
    location: "🇸🇬 Singapore",
  },
  {
    name: "Aaliya Patel",
    role: "AI/ML Engineer",
    rate: "$110/hr",
    rating: 4.8,
    reviews: 97,
    skills: ["Python", "TensorFlow", "LangChain"],
    initials: "AP",
    color: "#34d399",
    location: "🇮🇳 India",
  },
  {
    name: "Liam Brooks",
    role: "Brand & Motion",
    rate: "$65/hr",
    rating: 4.9,
    reviews: 312,
    skills: ["After Effects", "Illustrator", "3D"],
    initials: "LB",
    color: "#fb923c",
    location: "🇬🇧 UK",
  },
];

const services = [
  {
    title: "Website Design",
    category: "Graphics & Design",
    price: "Starting at $50",
    tags: ["Figma", "UI/UX"],
    badge: "Popular",
    badgeColor: "#38bdf8",
  },
  {
    title: "React Web App Development",
    category: "Programming & Tech",
    price: "Starting at $150",
    tags: ["React", "Next.js"],
    badge: "Top Rated",
    badgeColor: "#22c55e",
  },
  {
    title: "SEO Content Writing",
    category: "Writing & Translation",
    price: "Starting at $25",
    tags: ["SEO", "Blog"],
    badge: "Fast Delivery",
    badgeColor: "#f59e0b",
  },
  {
    title: "Social Media Management",
    category: "Digital Marketing",
    price: "Starting at $40",
    tags: ["Instagram", "TikTok"],
    badge: "Popular",
    badgeColor: "#38bdf8",
  },
  {
    title: "AI Chatbot Integration",
    category: "AI Services",
    price: "Starting at $200",
    tags: ["GPT-4", "LangChain"],
    badge: "Trending",
    badgeColor: "#a855f7",
  },
  {
    title: "Logo & Brand Identity",
    category: "Graphics & Design",
    price: "Starting at $30",
    tags: ["Branding", "Vector"],
    badge: "Top Rated",
    badgeColor: "#22c55e",
  },
];

const testimonials = [
  {
    name: "Daniel Rivera",
    role: "Startup Founder",
    company: "Nova Labs",
    text: "GigFlow helped us hire a stellar React team in under 48 hours. The quality of talent and the seamless escrow system blew us away.",
    initials: "DR",
    color: "#38bdf8",
    rating: 5,
  },
  {
    name: "Emma Johansson",
    role: "Freelance Designer",
    company: "Self-employed",
    text: "I landed three long-term clients in my first month. The dashboard makes managing proposals and invoices a complete breeze.",
    initials: "EJ",
    color: "#818cf8",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Product Manager",
    company: "TechVault Inc.",
    text: "We've built three products through GigFlow. It's our go-to platform—verified profiles and on-time delivery every single time.",
    initials: "PS",
    color: "#34d399",
    rating: 5,
  },
];

const popularSearches = [
  "Website Design",
  "React Developer",
  "Logo Design",
  "Content Writing",
  "Video Editing",
  "AI Integration",
];

const trustedBy = ["TechCorp", "MediaHub", "DevWorks", "CloudBase", "PixelStudio", "BrandLab"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const [openNav, setOpenNav] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111d31]" style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>

      {/* ── Google Font ── */}
      <style>{`
        * { box-sizing: border-box; }

        html { scroll-behavior: smooth; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to   { width: 100%; }
        }

        .animate-fade-up   { animation: fadeInUp 0.7s ease both; }
        .animate-float     { animation: floatCard 4s ease-in-out infinite; }
        .animate-count     { animation: countUp 0.6s ease both; }
        .animate-slide-left { animation: slideInLeft 0.6s ease both; }

        .hero-gradient {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #0f2847 100%);
        }
        .text-gradient {
          background: linear-gradient(135deg, #38bdf8, #818cf8, #34d399);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(17,29,49,0.12);
        }
        .btn-primary {
          background: #38bdf8;
          color: white;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .btn-primary:hover {
          background: #0ea5e9;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(56,189,248,0.4);
        }
        .btn-outline {
          border: 2px solid rgba(255,255,255,0.35);
          color: white;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.65);
          transform: translateY(-1px);
        }
        .pill-tag {
          display: inline-flex;
          align-items: center;
          padding: 2px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          background: rgba(56,189,248,0.12);
          color: #0284c7;
          border: 1px solid rgba(56,189,248,0.25);
        }
        .nav-link-hover {
          position: relative;
        }
        .nav-link-hover::after {
          content: '';
          position: absolute;
          left: 0; bottom: -3px;
          width: 0; height: 2px;
          background: #38bdf8;
          transition: width 0.25s;
        }
        .nav-link-hover:hover::after { width: 100%; }

        .step-connector {
          position: absolute;
          top: 32px;
          left: calc(50% + 40px);
          width: calc(100% - 80px);
          height: 1px;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          opacity: 0.3;
        }

        .freelancer-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(56,189,248,0.05), rgba(129,140,248,0.05));
          opacity: 0;
          transition: opacity 0.3s;
        }
        .freelancer-card:hover::before { opacity: 1; }

        .search-input:focus-within {
          box-shadow: 0 0 0 3px rgba(56,189,248,0.2);
        }

        .mobile-menu {
          transition: all 0.3s ease;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #38bdf8; }
      `}</style>

      {/* ══════════════════════════ HEADER ══════════════════════════ */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.97)",
          borderBottom: scrolled ? "1px solid #e9eef5" : "1px solid #e9eef5",
          boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.08)" : "0 1px 0 rgba(0,0,0,0.06)",
          backdropFilter: "blur(12px)",
          transition: "all 0.3s ease",
        }}
      >
        <div className="mx-auto flex h-[72px] max-w-[1360px] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="GigFlow home">
            <Image
              src="/assets/logo.svg"
              alt=""
              width={44}
              height={44}
              className="rounded-xl"
              priority
            />
            <span style={{ fontSize: 22, fontWeight: 900, color: "#111d31", letterSpacing: "-0.02em" }}>
              GigFlow
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="group relative"
                onMouseEnter={() => setOpenNav(item.label)}
                onMouseLeave={() => setOpenNav(null)}
              >
                <button
                  className="nav-link-hover flex items-center gap-1 text-[15px] font-600 text-[#374151] transition hover:text-[#38bdf8]"
                  style={{ fontWeight: 600 }}
                >
                  {item.label}
                  <svg viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m3 6 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openNav === item.label && item.submenu && (
                  <div className="absolute left-0 top-full z-50 w-52 pt-2">
                    <div className="overflow-hidden rounded-xl border border-[#e9eef5] bg-white shadow-[0_20px_60px_rgba(17,29,49,0.12)]">
                      {item.submenu.map((sub) => (
                        <a
                          key={sub}
                          href="#"
                          className="flex items-center gap-3 px-4 py-3 text-[13.5px] font-medium text-[#374151] transition hover:bg-[#f0fbff] hover:text-[#38bdf8]"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" />
                          {sub}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden items-center justify-center rounded-xl border-2 border-[#e2e8f0] px-5 py-2 text-[14px] font-700 text-[#374151] transition hover:border-[#38bdf8] hover:text-[#38bdf8] sm:flex"
              style={{ fontWeight: 700 }}
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="btn-primary flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[14px]"
              style={{ fontWeight: 700 }}
            >
              Get Started
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            {/* Mobile burger */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2e8f0] md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu border-t border-[#e9eef5] bg-white px-5 py-4 md:hidden">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="block py-3 text-[15px] font-600 text-[#374151] transition hover:text-[#38bdf8]" style={{ fontWeight: 600 }}>
                {item.label}
              </a>
            ))}
            <div className="mt-3 flex gap-3 border-t border-[#e9eef5] pt-3">
              <Link href="/login" className="flex-1 rounded-xl border-2 border-[#e2e8f0] py-2.5 text-center text-[14px] font-700 text-[#374151]" style={{ fontWeight: 700 }}>Log In</Link>
              <Link href="/register" className="btn-primary flex-1 rounded-xl py-2.5 text-center text-[14px]" style={{ fontWeight: 700 }}>Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1a3353 50%, #0c2340 100%)", minHeight: "90vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* Background Video */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/hero-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="GigFlow hero background"
          style={{ opacity: 0.18 }}
        />

        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: 400, height: 400, background: "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "80px", left: "-100px", width: 500, height: 500, background: "radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Grid lines overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        <div className="relative z-10 mx-auto w-full max-w-[1360px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          {/* Badge */}
          <div className="animate-fade-up mb-7 flex justify-center" style={{ animationDelay: "0ms" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 999, padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#7dd3fc", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8", display: "inline-block" }} />
              The Future of Freelancing is Here
            </span>
          </div>

          {/* Headline */}
          <div className="animate-fade-up text-center" style={{ animationDelay: "80ms" }}>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 74px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", color: "white", marginBottom: 20, maxWidth: 960, marginLeft: "auto", marginRight: "auto" }}>
              Find World-Class Talent.{" "}
              <span className="text-gradient">Build Anything.</span>
            </h1>
            <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.65)", maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.65, fontWeight: 400 }}>
              GigFlow connects businesses with elite freelancers across 50+ skills—faster hiring, verified profiles, and secure payments.
            </p>
          </div>

          {/* Search bar */}
          <div className="animate-fade-up mx-auto max-w-[820px]" style={{ animationDelay: "160ms" }}>
            <div
              className="search-input"
              style={{ display: "flex", alignItems: "center", background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, padding: "0 20px" }}>
                <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, color: "#94a3b8", flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                  id="hero-search"
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search for a service or skill…"
                  style={{ flex: 1, height: 62, border: "none", outline: "none", fontSize: 16, fontWeight: 500, color: "#111d31", background: "transparent", fontFamily: "inherit" }}
                  aria-label="Search services"
                />
              </div>
              <div style={{ borderLeft: "1px solid #e9eef5", padding: "0 20px", display: "flex", alignItems: "center" }}>
                <select
                  style={{ border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#374151", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
                  aria-label="Category"
                >
                  <option>All Categories</option>
                  <option>Design</option>
                  <option>Development</option>
                  <option>Marketing</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn-primary m-2 flex h-[50px] items-center gap-2 rounded-xl px-7 text-[15px]"
                style={{ fontWeight: 700, flexShrink: 0 }}
              >
                Search
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Popular searches */}
            <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500, marginRight: 4 }}>Popular:</span>
              {popularSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => setSearchValue(s)}
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, padding: "4px 14px", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.75)", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(56,189,248,0.2)"; (e.currentTarget as HTMLButtonElement).style.color = "#7dd3fc"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Hero CTA buttons */}
          <div className="animate-fade-up mt-10 flex flex-wrap justify-center gap-4" style={{ animationDelay: "240ms" }}>
            <Link href="/register" className="btn-primary flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-[15px]" style={{ fontWeight: 700 }}>
              Start Hiring Today
              <svg viewBox="0 0 20 20" style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/dashboard" className="btn-outline flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-[15px]" style={{ fontWeight: 700 }}>
              Browse Projects
            </Link>
          </div>

          {/* Social proof */}
          <div className="animate-fade-up mt-12 flex flex-wrap items-center justify-center gap-6" style={{ animationDelay: "300ms" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex" }}>
                {["#38bdf8", "#818cf8", "#34d399", "#fb923c"].map((c, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: "2px solid rgba(255,255,255,0.2)", marginLeft: i > 0 ? -8 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "white" }}>
                    {["SK", "MC", "AP", "LB"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} viewBox="0 0 16 16" style={{ width: 13, height: 13, fill: "#fbbf24" }}>
                      <path d="m8 1.5 1.8 3.7 4 .6-2.9 2.8.7 4L8 10.4 4.4 12.6l.7-4L2.2 5.8l4-.6L8 1.5Z" />
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500, marginTop: 2 }}>4.9 from 50k+ reviews</p>
              </div>
            </div>
            <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.12)" }} className="hidden sm:block" />
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
              Trusted by <span style={{ color: "#7dd3fc", fontWeight: 700 }}>2M+</span> freelancers worldwide
            </p>
          </div>
        </div>

        {/* Bottom wave */}
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 80 }}>
            <path d="M0 80h1440V20c-240 40-480 60-720 60S240 60 0 20v60Z" fill="#f7f8fa" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════ CATEGORIES ══════════════════════════ */}
      <section style={{ background: "#f7f8fa", paddingTop: 72, paddingBottom: 80 }}>
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#38bdf8", marginBottom: 10 }}>Browse Categories</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, color: "#111d31", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              Every skill you need, all in one place
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
            {categories.map((cat) => (
              <a
                key={cat.name}
                href="#"
                className="card-hover"
                style={{ display: "flex", flexDirection: "column", gap: 16, background: "white", border: "1.5px solid #e9eef5", borderRadius: 16, padding: "22px 18px", textDecoration: "none", cursor: "pointer", position: "relative", overflow: "hidden" }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: cat.color, display: "flex", alignItems: "center", justifyContent: "center", color: cat.accent }}>
                  {cat.icon}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111d31", lineHeight: 1.35, whiteSpace: "pre-line" }}>{cat.name}</p>
                </div>
                <svg viewBox="0 0 16 16" style={{ width: 14, height: 14, color: cat.accent, marginTop: "auto" }} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ STATS ══════════════════════════ */}
      <section style={{ background: "linear-gradient(135deg, #0f172a, #1a3353)", padding: "72px 0" }}>
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 40, textAlign: "center" }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ animationDelay: `${i * 100}ms` }}>
                <p style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginTop: 8, letterSpacing: "0.02em" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Trusted by brands */}
          <div style={{ marginTop: 64, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 48, textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 28 }}>
              Trusted by teams at
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 36px", alignItems: "center" }}>
              {trustedBy.map((brand) => (
                <span key={brand} style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.2)", letterSpacing: "-0.02em", fontStyle: "italic" }}>
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ HOW IT WORKS ══════════════════════════ */}
      <section style={{ background: "white", padding: "96px 0" }}>
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#38bdf8", marginBottom: 10 }}>Simple Process</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, color: "#111d31", letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 16 }}>
              Hire top talent in 4 easy steps
            </h2>
            <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}>
              From posting a job to receiving polished deliverables—GigFlow keeps every step transparent and secure.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {steps.map((step, i) => (
              <div
                key={step.step}
                className="card-hover"
                style={{ background: "#f7f8fa", border: "1.5px solid #e9eef5", borderRadius: 20, padding: "32px 28px", position: "relative", overflow: "hidden" }}
              >
                {/* Step number bg */}
                <div style={{ position: "absolute", top: 16, right: 20, fontSize: 80, fontWeight: 900, color: "#f1f5f9", lineHeight: 1, userSelect: "none", pointerEvents: "none", letterSpacing: "-0.04em" }}>
                  {step.step}
                </div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #e0f7ff, #dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8", marginBottom: 20 }}>
                    {step.icon}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111d31", marginBottom: 10, letterSpacing: "-0.01em" }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.65 }}>{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", top: 32, right: -12, width: 24, zIndex: 2 }} className="hidden lg:block">
                    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, color: "#38bdf8", opacity: 0.5 }} fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M15 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FEATURED FREELANCERS ══════════════════════════ */}
      <section style={{ background: "#f7f8fa", padding: "96px 0" }}>
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#38bdf8", marginBottom: 10 }}>Top Talent</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, color: "#111d31", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                Meet our top freelancers
              </h2>
            </div>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#38bdf8", textDecoration: "none", border: "1.5px solid rgba(56,189,248,0.3)", borderRadius: 10, padding: "8px 18px", transition: "all 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fbff")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              Browse All Talent
              <svg viewBox="0 0 16 16" style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {freelancers.map((f, i) => (
              <div
                key={f.name}
                className="card-hover freelancer-card"
                style={{ background: "white", border: "1.5px solid #e9eef5", borderRadius: 20, padding: "28px 24px", position: "relative", overflow: "hidden", cursor: "pointer" }}
              >
                {/* Badge */}
                <div style={{ position: "absolute", top: 16, right: 16 }}>
                  <span className="pill-tag">Top Rated</span>
                </div>

                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 16, background: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "white", flexShrink: 0 }}>
                    {f.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "#111d31", lineHeight: 1.2 }}>{f.name}</p>
                    <p style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, marginTop: 2 }}>{f.role}</p>
                  </div>
                </div>

                {/* Rating */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} viewBox="0 0 16 16" style={{ width: 13, height: 13, fill: "#fbbf24" }}>
                        <path d="m8 1.5 1.8 3.7 4 .6-2.9 2.8.7 4L8 10.4 4.4 12.6l.7-4L2.2 5.8l4-.6L8 1.5Z" />
                      </svg>
                    ))}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111d31" }}>{f.rating}</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>({f.reviews} reviews)</span>
                </div>

                {/* Skills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                  {f.skills.map((skill) => (
                    <span key={skill} style={{ fontSize: 11, fontWeight: 600, color: "#374151", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 10px" }}>
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                  <div>
                    <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, marginBottom: 2 }}>Rate</p>
                    <p style={{ fontSize: 17, fontWeight: 900, color: "#111d31" }}>{f.rate}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 11, color: "#9ca3af" }}>{f.location}</p>
                    <button style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, background: "#38bdf8", color: "white", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0ea5e9")} onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#38bdf8")}>
                      Hire
                      <svg viewBox="0 0 16 16" style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ POPULAR SERVICES ══════════════════════════ */}
      <section style={{ background: "white", padding: "96px 0" }}>
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#38bdf8", marginBottom: 10 }}>Services</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, color: "#111d31", letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 14 }}>
              Popular services right now
            </h2>
            <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
              Explore high-demand offerings from our verified freelancer community.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {services.map((svc) => (
              <a
                key={svc.title}
                href="#"
                className="card-hover"
                style={{ background: "#f7f8fa", border: "1.5px solid #e9eef5", borderRadius: 18, padding: "28px 24px", textDecoration: "none", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.04em", marginBottom: 8 }}>
                      {svc.category}
                    </p>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111d31", lineHeight: 1.3 }}>{svc.title}</h3>
                  </div>
                  <span style={{ background: `${svc.badgeColor}18`, color: svc.badgeColor, border: `1px solid ${svc.badgeColor}30`, borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {svc.badge}
                  </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {svc.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 11, fontWeight: 600, color: "#374151", background: "white", border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 10px" }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 12, borderTop: "1px solid #e9eef5" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111d31" }}>{svc.price}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#38bdf8" }}>
                    View Service
                    <svg viewBox="0 0 16 16" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ TESTIMONIALS ══════════════════════════ */}
      <section style={{ background: "#f7f8fa", padding: "96px 0" }}>
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#38bdf8", marginBottom: 10 }}>Reviews</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, color: "#111d31", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              Loved by freelancers & clients
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="card-hover"
                style={{ background: "white", border: "1.5px solid #e9eef5", borderRadius: 20, padding: "32px 28px", position: "relative" }}
              >
                {/* Quote icon */}
                <svg viewBox="0 0 32 32" style={{ width: 32, height: 32, color: "#e0f7ff", marginBottom: 16 }} fill="currentColor">
                  <path d="M10 8C6.7 8 4 10.7 4 14v10h10V14H7c0-1.7 1.3-3 3-3V8zm18 0c-3.3 0-6 2.7-6 6v10h10V14h-7c0-1.7 1.3-3 3-3V8z" />
                </svg>
                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.72, marginBottom: 24, fontStyle: "italic" }}>
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Stars */}
                <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} viewBox="0 0 16 16" style={{ width: 14, height: 14, fill: "#fbbf24" }}>
                      <path d="m8 1.5 1.8 3.7 4 .6-2.9 2.8.7 4L8 10.4 4.4 12.6l.7-4L2.2 5.8l4-.6L8 1.5Z" />
                    </svg>
                  ))}
                </div>

                {/* Author */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "white", flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#111d31" }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>
                      {t.role} · {t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FOR FREELANCERS CTA ══════════════════════════ */}
      <section style={{ background: "white", padding: "0 0 96px" }}>
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <div style={{ borderRadius: 24, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", background: "linear-gradient(135deg, #0f172a, #1a3353)" }} className="grid-cols-1 md:grid-cols-2">
            {/* Left: For Freelancers */}
            <div style={{ padding: "60px 52px", borderRight: "1px solid rgba(255,255,255,0.08)" }} className="p-10">
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7dd3fc", marginBottom: 14 }}>For Freelancers</p>
              <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "white", lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.02em" }}>
                Turn your skills into steady income
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, marginBottom: 32 }}>
                Create your profile, showcase your portfolio, and start winning clients in a marketplace of millions.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 10 }}>
                {["Free to join & bid on projects", "Secure milestone payments", "Build a verified reputation"].map((point) => (
                  <li key={point} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(56,189,248,0.2)", border: "1px solid rgba(56,189,248,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 16 16" style={{ width: 10, height: 10, color: "#38bdf8" }} fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m3 8 3.5 3.5 6.5-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#38bdf8", color: "white", textDecoration: "none", borderRadius: 12, padding: "13px 28px", fontSize: 14, fontWeight: 700, transition: "all 0.2s" }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#0ea5e9"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#38bdf8"; }}>
                Start Freelancing Free
                <svg viewBox="0 0 16 16" style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {/* Right: For Clients */}
            <div style={{ padding: "60px 52px" }} className="p-10">
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a5f3fc", marginBottom: 14 }}>For Clients</p>
              <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "white", lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.02em" }}>
                Hire top talent, launch faster
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, marginBottom: 32 }}>
                Post a job for free and receive proposals from skilled freelancers within hours—not days.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 10 }}>
                {["Post a job for free in minutes", "Verified profiles & portfolios", "Escrow-protected payments"].map((point) => (
                  <li key={point} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(56,189,248,0.2)", border: "1px solid rgba(56,189,248,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 16 16" style={{ width: 10, height: 10, color: "#38bdf8" }} fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m3 8 3.5 3.5 6.5-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", color: "white", textDecoration: "none", borderRadius: 12, padding: "13px 28px", fontSize: 14, fontWeight: 700, border: "1.5px solid rgba(255,255,255,0.2)", transition: "all 0.2s" }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.2)"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)"; }}>
                Post a Job Free
                <svg viewBox="0 0 16 16" style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer style={{ background: "#0f172a", color: "rgba(255,255,255,0.6)", padding: "72px 0 0" }}>
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px 60px", marginBottom: 64 }} className="footer-grid">
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Image src="/assets/logo.svg" alt="GigFlow" width={38} height={38} style={{ borderRadius: 10 }} />
                <span style={{ fontSize: 20, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>GigFlow</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 280, marginBottom: 24 }}>
                The modern freelancing platform connecting businesses with world-class talent across every skill and industry.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "Twitter", path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
                  { label: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
                  { label: "Instagram", path: "M8.56 2h6.88C17.38 2 19 3.63 19 5.56v6.88c0 1.93-1.62 3.56-3.56 3.56H8.56C6.63 16 5 14.37 5 12.44V5.56C5 3.63 6.63 2 8.56 2zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4.5-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" },
                ].map((sn) => (
                  <a key={sn.label} href="#" aria-label={sn.label} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", color: "rgba(255,255,255,0.5)" }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#38bdf8"; (e.currentTarget as HTMLAnchorElement).style.color = "white"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)"; }}>
                    <svg viewBox="0 0 24 24" style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={sn.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "For Clients",
                links: ["Post a Job", "Browse Freelancers", "How to Hire", "Enterprise Solutions", "Success Stories"],
              },
              {
                title: "For Freelancers",
                links: ["Find Work", "Create Profile", "Skill Tests", "Proposals & Contracts", "Community Forum"],
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Press", "Trust & Safety", "Help Center"],
              },
            ].map((col) => (
              <div key={col.title}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 18 }}>
                  {col.title}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#7dd3fc")} onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)")}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
              © {new Date().getFullYear()} GigFlow, Inc. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["Privacy Policy", "Terms of Service", "Cookie Settings", "Accessibility"].map((item) => (
                <a key={item} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#7dd3fc")} onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)")}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 960px) {
            .footer-grid {
              grid-template-columns: 1fr 1fr !important;
            }
          }
          @media (max-width: 640px) {
            .footer-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </footer>
    </main>
  );
}
