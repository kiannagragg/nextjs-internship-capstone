"use client"

import { useState, useEffect } from "react"
import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { Loader2 } from "lucide-react"
import { useTheme } from "@/components/shared/theme-provider"

export function SignUpForm() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <>
      <style jsx global>{`
        .dark .cl-rootBox {
          color: #f5f5f5;
        }
        .dark .cl-rootBox h1,
        .dark .cl-rootBox h2,
        .dark .cl-rootBox h3 {
          color: #f5f5f5;
        }
        .dark .cl-rootBox p,
        .dark .cl-rootBox span,
        .dark .cl-rootBox label {
          color: #d4d4d4;
        }
        .dark .cl-rootBox [class^="cl-internal-"] {
          color: inherit;
        }
      `}</style>

      <SignUp
        forceRedirectUrl="/onboarding"
        appearance={{
          baseTheme: isDark ? dark : undefined,
          variables: isDark
            ? {
                colorBackground: "#1a1a1a",
                colorText: "#f5f5f5",
                colorTextSecondary: "#a3a3a3",
                colorInputBackground: "#262626",
                colorInputText: "#f5f5f5",
                colorPrimary: "#3b82f6",
                colorDanger: "#ef4444",
                colorNeutral: "#d4d4d4",
                borderRadius: "0.5rem",
                fontFamily: "var(--font-body), sans-serif",
              }
            : {
                colorPrimary: "#000000",
                colorText: "#000000",
                colorTextSecondary: "#6B7280",
                colorBackground: "#FFFFFF",
                colorInputBackground: "#FFFFFF",
                colorInputText: "#000000",
                borderRadius: "0.5rem",
                fontFamily: "var(--font-body), sans-serif",
              },
          elements: {
            card: "shadow-none border border-border",
            headerTitle: "font-display font-bold",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "border border-border text-foreground hover:bg-accent",
            socialButtonsBlockButtonText: "font-medium",
            dividerLine: "bg-border",
            dividerText: "text-muted-foreground",
            formFieldLabel: "text-xs font-semibold uppercase tracking-wide",
            formFieldInput:
              "border-border focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground",
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg",
            footerActionLink: "text-foreground font-semibold hover:text-brand",
            footer: "text-muted-foreground",

            ...(isDark && {
              formFieldInput:
                "border-[#404040] bg-[#262626] text-[#f5f5f5] placeholder:text-[#a3a3a3] focus:border-ring focus:ring-1 focus:ring-ring",
            }),
          },
        }}
      />
    </>
  )
}
