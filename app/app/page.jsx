"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import { toast } from "@/hooks/use-toast.js";
import JSZip from "jszip";
import { Header } from "@/components/header.jsx";
import { imageGenerationService, historyService } from "@/lib/api/index.js";
import { useSession } from "next-auth/react";

const MAX_VARIATIONS = 8;

export default function StudioPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [styles, setStyles] = useState([]);
  const [count, setCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const inputRef = useRef(null);
  const prevUrlRef = useRef(null);

  const styleOptions = [
    "Bold Text",
    "High Contrast",
    "Minimal",
    "Color Pop",
    "Face Close-up",
    "Emoji",
  ];

  const refPreview = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!refPreview) return;
    if (prevUrlRef.current && prevUrlRef.current !== refPreview) {
      URL.revokeObjectURL(prevUrlRef.current);
    }
    prevUrlRef.current = refPreview;
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  }, [refPreview]);

  const onDrop = useCallback((f) => {
    setFile(f);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const onRemoveRef = useCallback(() => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const makePlaceholderUrl = useCallback((w, h, q) => {
    const query = encodeURIComponent(q);
    return `/placeholder.svg?height=${h}&width=${w}&query=${query}`;
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!title && !brief) {
      toast({
        title: "Add a brief",
        description:
          "Provide a title or short description to guide generation.",
      });
      return;
    }

    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate thumbnails.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults([]); // Clear previous results

    try {
      const requestData = {
        prompt: title,
        customPrompt: brief,
        category: "YouTube",
        thumbnailStyle:
          styles.length > 0 ? styles.join(", ") : "Bold Text, High Contrast",
        imageCount: Math.min(count, MAX_VARIATIONS).toString(),
        enhancePrompt: true,
      };

      let result;

      if (file) {
        // Image-to-image generation
        const formData = imageGenerationService.createImageFormData(
          file,
          requestData
        );
        result = await imageGenerationService.generateFromImage(formData);
      } else {
        // Text-to-image generation
        result = await imageGenerationService.generateImages(requestData);
      }

      if (result.success && result.data.images) {
        const generatedItems = result.data.images.map((imageUrl, i) => ({
          id: `${Date.now()}-${i}`,
          prompt: result.data.prompt || `${title} - ${brief}`,
          url: imageUrl,
          alt: `Generated thumbnail ${i + 1}`,
        }));

        setResults(generatedItems);
        toast({
          title: "Generated successfully",
          description: `Created ${generatedItems.length} thumbnail variations.`,
        });
      } else {
        throw new Error(result.error || "Generation failed");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description:
          error.message || "Unable to generate thumbnails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [title, brief, styles, count, file, session]);

  const toggleStyle = useCallback(
    (s, checked) => {
      setStyles((prev) =>
        checked ? [...prev, s] : prev.filter((x) => x !== s)
      );
    },
    [setStyles]
  );

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  // Load user's generation history
  const loadHistory = useCallback(async () => {
    if (!session) return;

    setHistoryLoading(true);
    try {
      const result = await historyService.getHistory(10, 0);
      if (result.success && result.data.history) {
        const historyItems = result.data.history.map((item, i) => ({
          id: `history-${item._id || i}`,
          prompt:
            item.finalPrompt || item.originalPrompt || "Generated thumbnail",
          url: item.imageUrls?.[0] || "/placeholder.svg",
          alt: `History: ${item.finalPrompt || item.originalPrompt}`,
          isHistory: true,
          historyId: item._id,
        }));
        setResults(historyItems);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      toast({
        title: "Failed to load history",
        description: "Unable to load your previous generations.",
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
    }
  }, [session]);

  // Clear all history
  const clearHistory = useCallback(async () => {
    if (!session) return;

    try {
      const result = await historyService.clearHistory();
      if (result.success) {
        setResults([]);
        toast({
          title: "History cleared",
          description: "All your generation history has been cleared.",
        });
      } else {
        throw new Error(result.error || "Failed to clear history");
      }
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast({
        title: "Failed to clear history",
        description: error.message || "Unable to clear history.",
        variant: "destructive",
      });
    }
  }, [session]);

  return (
    <main
      id="main-content"
      className="min-h-dvh"
      aria-busy={loading ? "true" : "false"}
    >
      <div className="sr-only" aria-live="polite">
        {loading
          ? "Generating thumbnails…"
          : results.length
          ? `${results.length} results ready.`
          : ""}
      </div>
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>1) Upload (optional)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) onDrop(f);
              }}
              className="rounded-md border border-dashed p-4 text-sm text-muted-foreground"
              role="button"
              aria-label="Upload reference image"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  inputRef.current?.click();
              }}
            >
              {file ? (
                <div className="flex items-center justify-between">
                  <span className="truncate">{file.name}</span>
                  <Button variant="outline" size="sm" onClick={onRemoveRef}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span>Drag & drop or choose a file</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                  >
                    Browse
                  </Button>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onDrop(f);
                }}
              />
            </div>
            {refPreview && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-md border">
                <Image
                  src={refPreview || "/placeholder.svg"}
                  alt={
                    file
                      ? `Reference preview: ${file.name}`
                      : "Reference preview"
                  }
                  fill
                  className="object-cover"
                  onLoad={() => {}}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>2) Brief</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Video title</Label>
              <Input
                id="title"
                placeholder="e.g., 10 Editing Tricks for Faster Videos"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="brief">Additional context</Label>
              <Textarea
                id="brief"
                placeholder="Audience, vibe, must-have words, etc."
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="min-h-24"
              />
            </div>
            <div className="grid gap-3">
              <span className="text-sm font-medium">Styles</span>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {styleOptions.map((s) => {
                  const checked = styles.includes(s);
                  return (
                    <label
                      key={s}
                      className="inline-flex items-center gap-2 rounded-md border p-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => toggleStyle(s, Boolean(v))}
                      />
                      <span>{s}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="count">Variations (max {MAX_VARIATIONS})</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={MAX_VARIATIONS}
                value={count}
                onChange={(e) =>
                  setCount(
                    Math.max(
                      1,
                      Math.min(MAX_VARIATIONS, Number(e.target.value || 1))
                    )
                  )
                }
                className="w-32"
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              AI-powered thumbnail generation
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={loadHistory}
                disabled={historyLoading || !session}
              >
                {historyLoading ? "Loading..." : "Load History"}
              </Button>
              <Button
                variant="outline"
                onClick={clearResults}
                disabled={loading || results.length === 0}
              >
                Clear
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleGenerate}
                disabled={loading || !session}
              >
                {loading ? "Generating…" : "Generate"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </section>

      <ResultsSection results={results} setResults={setResults} />
    </main>
  );
}

function ResultsSection({ results, setResults }) {
  const [zipping, setZipping] = useState(false);
  const { data: session } = useSession();

  const toggleFavorite = useCallback(
    (id) => {
      setResults((prev) =>
        prev.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r))
      );
    },
    [setResults]
  );

  const drawToCanvasAsPng = useCallback(
    async (src, width = 1280, height = 720) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      const loaded = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
      });
      img.src = src;
      await loaded;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context not available");
      ctx.drawImage(img, 0, 0, width, height);
      const blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      return blob;
    },
    []
  );

  const handleDownload = useCallback(
    async (item) => {
      try {
        const blob = await drawToCanvasAsPng(item.url);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = sanitizeFilename(item.prompt) + ".png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch {
        toast({
          title: "Download failed",
          description: "Could not prepare image.",
          variant: "destructive",
        });
      }
    },
    [drawToCanvasAsPng]
  );

  const handleCopy = useCallback(
    async (item) => {
      try {
        const blob = await drawToCanvasAsPng(item.url);
        await navigator.clipboard.write([
          new window.ClipboardItem({ [blob.type]: blob }),
        ]);
        toast({ title: "Copied", description: "Image copied to clipboard." });
      } catch {
        toast({
          title: "Copy failed",
          description: "Clipboard not available.",
          variant: "destructive",
        });
      }
    },
    [drawToCanvasAsPng]
  );

  const handleZipAll = useCallback(async () => {
    if (!results.length) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        const blob = await (async () => {
          try {
            return await drawToCanvasAsPng(r.url);
          } catch {
            return null;
          }
        })();
        if (blob) {
          zip.file(
            `${String(i + 1).padStart(2, "0")}-${sanitizeFilename(
              r.prompt
            )}.png`,
            blob
          );
        }
      }
      zip.file(
        "metadata.txt",
        results.map((r, i) => `${i + 1}. ${r.prompt}`).join("\n")
      );
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "thumbnails.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "ZIP ready", description: "Downloaded all thumbnails." });
    } catch {
      toast({
        title: "ZIP failed",
        description: "Could not create ZIP.",
        variant: "destructive",
      });
    } finally {
      setZipping(false);
    }
  }, [results, drawToCanvasAsPng]);

  if (!results.length) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          Your results will appear here after generation.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Results</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleZipAll} disabled={zipping}>
            {zipping ? "Preparing ZIP…" : "Download All (ZIP)"}
          </Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <Card key={r.id} className="overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium truncate">
                {r.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative aspect-[16/9] overflow-hidden rounded-md border">
                <Image
                  src={r.url || "/placeholder.svg"}
                  alt={r.alt}
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownload(r)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(r)}
                >
                  Copy
                </Button>
              </div>
              <Button
                size="sm"
                variant={r.favorite ? "default" : "outline"}
                onClick={() => toggleFavorite(r.id)}
                className={r.favorite ? "bg-amber-500 hover:bg-amber-600" : ""}
                aria-pressed={r.favorite ? "true" : "false"}
                aria-label={r.favorite ? "Unfavorite" : "Favorite"}
              >
                {r.favorite ? "Favorited" : "Favorite"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

function sanitizeFilename(s) {
  return s.replace(/[^\w-]+/g, "_").slice(0, 64) || "thumbnail";
}
