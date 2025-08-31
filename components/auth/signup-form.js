"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { authService } from "../../lib/api/index.js";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  function validate() {
    const next = {};
    if (!name) next.name = "Name is required";
    else if (name.trim().length < 2)
      next.name = "Name must be at least 2 characters";
    if (!email) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email";
    if (!password) next.password = "Password is required";
    else if (password.length < 6)
      next.password = "Password must be at least 6 characters";
    return next;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSubmitting(true);
    try {
      const result = await authService.signup({ name, email, password });

      if (result.success) {
        // Store token and user data
        authService.storeToken(result.data.token);
        router.push("/app");
      } else {
        setErrors({ form: result.error || "Signup failed. Please try again." });
      }
    } catch (err) {
      setErrors({ form: "Unable to sign up. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-describedby={errors.form ? "signup-form-error" : undefined}
    >
      <Card>
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.form ? (
            <p
              id="signup-form-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.form}
            </p>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name ? (
              <p id="name-error" className="text-xs text-destructive">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email ? (
              <p id="email-error" className="text-xs text-destructive">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password ? (
              <p id="password-error" className="text-xs text-destructive">
                {errors.password}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
