import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Programming\n& Tech",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M4 11h16l1.5 8h-19L4 11Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8 11V8.5A3.5 3.5 0 0 1 11.5 5h1A3.5 3.5 0 0 1 16 8.5V11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 15h.01M15 15h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Video &\nAnimation",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
        <rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m10 9 5 3-5 3V9Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "AI services",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 3.5 9.5 12 12 20.5M12 3.5l2.5 8.5L12 20.5M3.5 12h17M6.2 6.2l11.6 11.6M17.8 6.2 6.2 17.8" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Music & Audio",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M5 18v-6a7 7 0 0 1 14 0v6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="3.5" y="13" width="4" height="7" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <rect x="16.5" y="13" width="4" height="7" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    name: "Business",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
        <circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 9.5a2.5 2.5 0 1 1 2.8 4.1M17 16.5a4.5 4.5 0 0 1 3.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Graphics &\nDesign",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
        <rect x="4" y="4" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="4" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <rect x="4" y="14" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="14" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    name: "Digital\nMarketing",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
        <rect x="4" y="5" width="16" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 20h6M12 16v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

const navItems = ["Hire Freelancers", "Find work", "Explore"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-black">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-white/95 shadow-[0_3px_6px_rgba(0,0,0,0.24)] backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1360px] items-center justify-between px-5 sm:h-[86px] sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-2 sm:gap-3" aria-label="GigFlow home">
            <Image src="/assets/logo.svg" alt="" width={60} height={60} className="h-12 w-12 rounded-2xl sm:h-[60px] sm:w-[60px]" priority />
            <span className="hidden text-[30px] font-extrabold tracking-normal min-[480px]:inline">GigFlow</span>
          </Link>

          <nav className="hidden items-center gap-8 text-[20px] font-bold md:flex">
            {navItems.map((item) => (
              <a key={item} href="#" className="flex items-center gap-1 transition hover:text-[#24aee8]">
                {item}
                <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1 h-4 w-4">
                  <path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/login" className="flex h-9 min-w-[78px] items-center justify-center rounded-xl border border-black px-3 text-sm font-bold transition hover:bg-black hover:text-white sm:h-11 sm:min-w-[150px] sm:rounded-[14px] sm:px-6 sm:text-[20px]">
              Login
            </Link>
            <Link href="/register" className="flex h-9 min-w-[78px] items-center justify-center rounded-xl bg-[#38bdf8] px-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#159fdc] sm:h-11 sm:min-w-[150px] sm:rounded-[14px] sm:px-6 sm:text-[20px]">
              Signup
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1360px] px-5 pb-16 pt-12 sm:px-8 lg:px-12">
        <div className="relative min-h-[420px] overflow-hidden rounded-xl bg-black shadow-sm sm:min-h-[520px] lg:min-h-[600px]">
          <video className="absolute inset-0 h-full w-full object-cover" src="/videos/hero-video.mp4" autoPlay muted loop playsInline preload="metadata" aria-label="GigFlow hero video" />
          <div className="absolute inset-0 bg-black/45" />

          <div className="relative z-10 flex min-h-[420px] flex-col justify-center px-6 py-10 sm:min-h-[520px] sm:px-12 lg:min-h-[600px] lg:px-[72px]">
            <h1 className="max-w-[810px] text-[40px] font-extrabold leading-[1.12] tracking-normal text-white sm:text-[56px] lg:text-[64px]">
              Find the right talent to turn your dream projects into reality.
            </h1>

            <form className="mt-9 flex w-full max-w-[1120px] items-center rounded-[14px] bg-white/88 shadow-[0_1px_12px_rgba(255,255,255,0.25)] backdrop-blur-sm" action="#">
              <label htmlFor="hero-search" className="sr-only">Search services</label>
              <input id="hero-search" type="search" placeholder="Search for what you are looking for" className="h-[58px] min-w-0 flex-1 rounded-l-[14px] border-0 bg-transparent px-4 text-lg font-medium text-slate-700 outline-none placeholder:text-slate-500 sm:px-5 sm:text-[20px]" />
              <button type="submit" className="mr-0 flex h-[58px] w-[64px] items-center justify-center rounded-[14px] bg-[#38bdf8] text-black transition hover:bg-[#159fdc] sm:w-[68px]" aria-label="Search">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8">
                  <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m16.5 16.5 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto mt-6 grid max-w-[1068px] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7 lg:gap-5">
          {categories.map((category) => (
            <a key={category.name} href="#" className="flex min-h-[138px] flex-col justify-between rounded-xl border border-black/5 bg-white p-4 text-black shadow-[0_4px_8px_rgba(0,0,0,0.23)] transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
              <span className="text-black">{category.icon}</span>
              <span className="whitespace-pre-line text-[16px] font-medium leading-tight">{category.name}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

