import type { Metadata } from "next"
import { SignInForm } from "./sign-in-form"

export const metadata: Metadata = {
  title: "Sign In | FLOE.",
  description: "Sign in to your FLOE. account",
}

export default function SignInPage() {
  return <SignInForm />
}
