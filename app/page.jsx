import Link from "next/link";
import { Button } from "@/components/ui/button.jsx";
import { Header } from "@/components/header.jsx";

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-dvh">
      <Header />

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-pretty">
            Create eye-catching YouTube thumbnails in minutes
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Upload a reference image, describe your video, and instantly
            generate multiple thumbnail options. Download individually or export
            everything as a ZIP.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link href="/app">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Try the Generator
              </Button>
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm underline underline-offset-4"
            >
              How it works
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Feature
            title="Fast results"
            description="Generate multiple variations at once and compare side-by-side."
          />
          <Feature
            title="Simple workflow"
            description="Upload, write a short brief, and click Generate."
          />
          <Feature
            title="ZIP export"
            description="Download all images as a single ZIP package."
          />
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          <Step
            n={1}
            title="Upload"
            desc="Drop an image or start without one."
          />
          <Step
            n={2}
            title="Brief"
            desc="Describe your video and choose styles."
          />
          <Step
            n={3}
            title="Generate"
            desc="Preview, copy, or download your favorites."
          />
        </ol>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground">
          Built with shadcn/ui. Local-only mode (no integrations).
        </div>
      </footer>
    </main>
  );
}

function Feature({ title, description }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <li className="rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
          {n}
        </span>
        <span className="font-medium">{title}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </li>
  );
}
