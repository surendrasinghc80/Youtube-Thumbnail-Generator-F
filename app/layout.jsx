import { Toaster } from "sonner";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider.jsx";
import "./globals.css";

export const metadata = {
  title: "YouTube Thumbnail Generator",
  description: "Created with Passion",
  generator: "Surendra Singh",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-2 focus:rounded-md"
          >
            Skip to content
          </a>
          <Suspense fallback={null}>
            {children}
            {/* ✅ Sonner Toaster (works with toast() globally) */}
            <Toaster richColors position="top-right" />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
