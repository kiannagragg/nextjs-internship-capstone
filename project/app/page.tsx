import { Header } from "@/components/features/landing/header"
import { Hero } from "@/components/features/landing/hero"
import { Features } from "@/components/features/landing/features"
import { Preview } from "@/components/features/landing/preview"
import { Footer } from "@/components/features/landing/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FLOE. | Structure Your Workflow",
  description:
    "Flow Like Operations Engineering — where your team's work moves with intention, not friction.",
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Features />
      <Preview />
      <Footer />
    </div>
  )
}
