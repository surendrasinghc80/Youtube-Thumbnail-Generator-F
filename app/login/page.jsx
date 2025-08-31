import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form.js";

export const metadata = {
  title: "Log in",
  description: "Access your AI thumbnail workspace.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <header className="mb-6">
        <h1 className="text-pretty text-2xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Log in to continue creating thumbnails.
        </p>
      </header>
      <LoginForm />
      <p className="mt-6 text-sm text-muted-foreground">
        Don{"'"}t have an account?{" "}
        <Link
          className="text-primary underline-offset-4 hover:underline"
          href="/signup"
          prefetch
        >
          Sign up
        </Link>
      </p>
    </main>
  );
}
