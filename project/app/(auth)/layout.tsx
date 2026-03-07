import Link from "next/link"
import type React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Logo */}
      <div className="px-6 pt-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-foreground">
          FLOE<span className="text-brand">.</span>
        </Link>
      </div>

      {/* Decorative curve — left */}
      <svg
        viewBox="0 0 200 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute -left-16 top-0 h-[500px] w-auto text-foreground"
        aria-hidden="true"
      >
        <path
          d="M100 0 C100 0, 20 100, 30 200 C40 300, 0 350, 10 450 C20 550, 80 580, 60 600"
          stroke="currentColor"
          strokeWidth="40"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Decorative curve — center-bottom */}
      <svg
        viewBox="0 0 300 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[350px] w-auto -translate-x-1/2 text-foreground md:left-[40%]"
        aria-hidden="true"
      >
        <path
          d="M50 0 C80 80, 250 100, 200 200 C150 300, 280 350, 250 400"
          stroke="currentColor"
          strokeWidth="35"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Content — centered */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  )
}
