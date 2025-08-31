import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form.js";

export const metadata = {
  title: "Sign up",
  description: "Create an account to start generating thumbnails.",
};

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <header className="mb-6">
        <h1 className="text-pretty text-2xl font-semibold">
          Create your account
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Start generating AI-powered thumbnails in minutes.
        </p>
      </header>
      <SignupForm />
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="text-primary underline-offset-4 hover:underline"
          href="/login"
          prefetch
        >
          Log in
        </Link>
      </p>
    </main>
  );
}
