"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button.jsx";
import { ThemeToggle } from "@/components/theme-toggle.jsx";
import { authService } from "@/lib/api/index.js";

export function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "auth_token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-sm bg-blue-600" aria-hidden />
          <Link href="/" className="font-semibold hover:text-blue-600 transition-colors">
            ThumbGen AI
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {isLoading ? (
            <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/app">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Open Studio
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
