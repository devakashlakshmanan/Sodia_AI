import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getClientSession, setClientSession } from "@/lib/auth";
import { generateAIImage, saveCalendarEventAction } from "@/lib/server-actions.server";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, ArrowRight, Loader2, Download, Calendar, Sparkles, RefreshCw, Sliders, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/image")({
  component: ImageAgent,
});

const SURPRISE_PROMPTS = [
  "A futuristic holographic digital workspace hovering in a cozy mid-century modern room, violet accents, soft photorealistic lens flare",
  "Close-up cinematic shot of a transparent glass mug filled with glowing blue tea, steam rising, natural window light, bokeh background",
  "An adorable astronaut cat floating in space, holding a star-shaped balloon, watercolor paint style with soft splashes",
  "Minimalist vector flat design of a developer programming on a laptop surrounded by lush green house plants, warm pastel colors",
  "A vibrant cyberpunk city alley at night with neon glowing signs that read 'SODIA AI' in bright cyan and amber, rain-slicked asphalt",
  "Sleek product mockup of a wellness skincare bottle sitting on a smooth stone pedestal, water ripples, minimalist studio lighting",
  "A colorful 3D render of floating geometric shapes, glassmorphism textures, abstract design concept",
  "Playful cartoon illustration of a happy golden retriever wearing round glasses and reading a massive book, warm colors",
  "A glowing portal opening in a mysterious fantasy forest, giant mushrooms, fireflies, digital painting concept art",
  "Futuristic electric sports car parked on a cliff overlooking a high-tech sci-fi city during golden hour sunset"
];

function ImageAgent() {
  const user = getClientSession();
  
  // Generation Parameters
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic photo");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [quality, setQuality] = useState("standard");
  const [numImages, setNumImages] = useState("1");
  const [background, setBackground] = useState("default");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [editingSeed, setEditingSeed] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calendar State
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const handleSurpriseMe = () => {
    const randomIdx = Math.floor(Math.random() * SURPRISE_PROMPTS.length);
    setPrompt(SURPRISE_PROMPTS[randomIdx]);
    setEditingSeed(null); // Clear the seed lock so the surprise prompt is completely fresh
    toast.info("Surprise prompt loaded! Feel free to edit or generate.");
  };

  const preloadImages = (urls: string[]): Promise<void[]> => {
    return Promise.all(
      urls.map((url) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          const timer = setTimeout(() => {
            console.warn(`Preload timed out for: ${url}`);
            resolve();
          }, 10000); // 10s maximum timeout

          img.src = url;
          img.onload = () => {
            clearTimeout(timer);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timer);
            console.warn(`Failed to preload image: ${url}`);
            resolve(); // Resolve anyway
          };
        });
      })
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !prompt) return;
    setLoading(true);
    try {
      const creditsNeeded = parseInt(numImages) * 5;
      if (user.credits < creditsNeeded) {
        toast.error(`You need ${creditsNeeded} credits, but you only have ${user.credits} remaining.`);
        setLoading(false);
        return;
      }

      const res = await generateAIImage({
        data: {
          userId: user.id,
          prompt,
          style,
          aspectRatio,
          quality,
          numImages: parseInt(numImages),
          background,
          negativePrompt,
          seed: editingSeed !== null ? editingSeed : undefined
        }
      });

      if (res.error) {
        toast.error(res.error);
        setLoading(false);
      } else {
        // Preload the generated images in browser background before hiding loader
        const urlsToPreload = res.images?.map((img: any) => img.url) || [];
        await preloadImages(urlsToPreload);

        setImageData(res);
        setSelectedImage(res.images?.[0] || null);
        toast.success("Visual assets generated successfully! Saved to workspace.");
        user.credits = res.userCredits !== undefined ? res.userCredits : Math.max(0, user.credits - creditsNeeded);
        setClientSession(user);
      }
    } catch (e) {
      toast.error("Failed to generate visual assets");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!user || !selectedImage || !scheduleDate) return;
    setScheduling(true);
    try {
      await saveCalendarEventAction({
        data: {
          userId: user.id,
          title: `Visual: ${prompt.substring(0, 20)}...`,
          content: `<img src="${selectedImage.url}" alt="${prompt}" style="max-width: 100%; border-radius: 8px;" />`,
          platforms: "instagram",
          scheduledAt: new Date(scheduleDate).toISOString(),
          status: "SCHEDULED"
        }
      });
      toast.success("Scheduled visual successfully! Placed on calendar.");
      setScheduleDate("");
    } catch (e) {
      toast.error("Failed to schedule image post");
    } finally {
      setScheduling(false);
    }
  };

  const downloadImage = async (url: string) => {
    try {
      let downloadUrl = url;
      if (url.startsWith("http")) {
        // If it's a cross-origin HTTP URL, fetch it as a blob first to force download
        const res = await fetch(url);
        const blob = await res.blob();
        downloadUrl = URL.createObjectURL(blob);
      }
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `sodia-ai-visual-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (url.startsWith("http")) {
        URL.revokeObjectURL(downloadUrl);
      }
      toast.success("Visual download initialized!");
    } catch (e) {
      console.error("Download failed:", e);
      // Fallback: try opening in new tab
      window.open(url, "_blank");
      toast.info("Download opened in new tab.");
    }
  };

  const handleRefine = (img: any) => {
    setEditingSeed(img.seed);
    toast.info(`Seed lock enabled (Seed: ${img.seed}). Changing prompt or settings will regenerate consistent structures.`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Agent Intro */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" /> AI Image Studio Agent
          </h2>
          <p className="text-sm text-muted-foreground font-sans">Create high-converting visuals, social graphics, and custom illustration assets</p>
        </div>
        <div className="text-xs font-mono bg-surface/50 border border-border/40 px-3 py-1.5 rounded-lg text-muted-foreground">
          Cost: <span className="text-accent-warm font-bold">5 credits</span> / image
        </div>
      </div>

      {/* Input Form Panel */}
      <form onSubmit={handleGenerate} className="glass rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/10 pb-2">
          <Label htmlFor="image-prompt" className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Describe visual concept
          </Label>
          <Button type="button" onClick={handleSurpriseMe} variant="glass" size="sm" className="text-xs text-primary gap-1 py-1 px-2.5">
            Surprise Me
          </Button>
        </div>

        <Textarea
          id="image-prompt"
          placeholder="Describe your scene in detail (e.g. A premium glass container skincare bottle on stone steps with water reflections, studio lighting)..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-background/40 min-h-24 resize-none"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-background/40">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realistic photo">Realistic Photo</SelectItem>
                <SelectItem value="cinematic">Cinematic</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
                <SelectItem value="digital art">Digital Art</SelectItem>
                <SelectItem value="3d render">3D Render</SelectItem>
                <SelectItem value="cartoon">Cartoon</SelectItem>
                <SelectItem value="watercolor">Watercolor</SelectItem>
                <SelectItem value="oil painting">Oil Painting</SelectItem>
                <SelectItem value="pencil sketch">Pencil Sketch</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
                <SelectItem value="pixel art">Pixel Art</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                <SelectItem value="product mockup">Product Mockup</SelectItem>
                <SelectItem value="social media post">Social Media Post</SelectItem>
                <SelectItem value="logo design">Logo Design</SelectItem>
                <SelectItem value="icon">Icon Design</SelectItem>
                <SelectItem value="poster">Poster</SelectItem>
                <SelectItem value="infographic">Infographic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger className="bg-background/40">
                <SelectValue placeholder="Aspect Ratio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">Square (1:1)</SelectItem>
                <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                <SelectItem value="9:16">Portrait (9:16)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Quality</Label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="bg-background/40">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Definition</SelectItem>
                <SelectItem value="hd">High Definition (HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Images Count</Label>
            <Select value={numImages} onValueChange={setNumImages}>
              <SelectTrigger className="bg-background/40">
                <SelectValue placeholder="Count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Image (5 cr)</SelectItem>
                <SelectItem value="2">2 Images (10 cr)</SelectItem>
                <SelectItem value="3">3 Images (15 cr)</SelectItem>
                <SelectItem value="4">4 Images (20 cr)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Collapsible Advanced Parameters */}
        <div className="border-t border-border/10 pt-4 space-y-4">
          <h4 className="font-mono text-xs text-muted-foreground flex items-center gap-1.5 uppercase">
            <Sliders className="h-3.5 w-3.5 text-primary" /> Advanced Options
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Background Style</Label>
              <Select value={background} onValueChange={setBackground}>
                <SelectTrigger className="bg-background/40">
                  <SelectValue placeholder="Background" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Scene Background</SelectItem>
                  <SelectItem value="transparent">Isolate Background (Clean White)</SelectItem>
                  <SelectItem value="solid">Flat Solid Color Background</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="neg-prompt" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Negative Prompt (Exclude)</Label>
              <Input
                id="neg-prompt"
                placeholder="Blurry, low quality, deformed hands, text margins..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="bg-background/40 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Seed Lock Bar if editing */}
        {editingSeed !== null && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
            <span className="font-sans text-primary">
              🔒 Seed Lock Enabled: <strong>{editingSeed}</strong> (Images will have consistent visual structures)
            </span>
            <Button type="button" onClick={() => setEditingSeed(null)} variant="glass" className="h-6 py-0 px-2 text-[10px] text-destructive hover:bg-destructive/10">
              <X className="h-3 w-3 mr-1" /> Clear Lock
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="hero" className="w-full sm:w-auto py-5 text-xs font-semibold px-8" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rendering visual assets...
              </>
            ) : (
              <>
                Generate Visual Assets <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Loading Canvas */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 glass rounded-3xl min-h-[350px] border border-dashed border-primary/30 space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-sm font-semibold animate-pulse text-muted-foreground">Synthesizing Flux high-fidelity layers...</span>
          <span className="text-xs text-muted-foreground text-center max-w-sm">This takes about 5 to 15 seconds as Sodia AI pre-fetches and validates the visual assets. Please do not close this window.</span>
        </div>
      )}

      {/* Results Workspace */}
      {imageData && !loading && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Visual Display & Grid Selection */}
          <div className="glass rounded-3xl p-6 md:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-border/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase">Active Prompt Canvas</span>
                <h3 className="font-display font-bold text-base">Generated Assets Gallery</h3>
              </div>
              {selectedImage && (
                <Button variant="glass" size="sm" onClick={() => downloadImage(selectedImage.url)} className="text-xs font-semibold gap-1.5">
                  <Download className="h-4 w-4" /> Download PNG
                </Button>
              )}
            </div>

            {/* Main Preview Container */}
            {selectedImage && (
              <div 
                onClick={() => setIsFullscreen(true)}
                className="relative overflow-hidden rounded-2xl border border-border/20 bg-background/50 flex items-center justify-center p-4 min-h-[300px] cursor-zoom-in group"
              >
                <img
                  src={selectedImage.url}
                  alt={imageData.prompt}
                  className="max-h-[380px] object-contain rounded-xl shadow-2xl transition-all duration-300 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-sans shadow-lg">Click to expand</span>
                </div>
              </div>
            )}

            {/* Grid for Multiple Images Selection */}
            {imageData.images && imageData.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 pt-2">
                {imageData.images.map((img: any, idx: number) => (
                  <div
                    key={img.seed}
                    onClick={() => setSelectedImage(img)}
                    className={`relative overflow-hidden rounded-xl border-2 cursor-pointer aspect-video bg-background/40 flex items-center justify-center ${
                      selectedImage?.seed === img.seed ? "border-primary shadow-md" : "border-border/30 hover:border-border"
                    }`}
                  >
                    <img src={img.url} alt={`Option ${idx + 1}`} className="object-cover h-full w-full" />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-white px-1 rounded font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Editor Tools */}
          {selectedImage && (
            <div className="glass rounded-3xl p-6 space-y-5 md:col-span-1 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="space-y-1.5 border-b border-border/10 pb-3">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block">Asset Metadata</span>
                  <div className="text-xs font-sans text-foreground/90 space-y-1">
                    <p>🎯 <strong>Seed:</strong> {selectedImage.seed}</p>
                    <p>📐 <strong>Size:</strong> {selectedImage.width} x {selectedImage.height}</p>
                    <p>🎭 <strong>Style:</strong> <span className="capitalize">{style}</span></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4 text-primary" /> Modify Structurally
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Lock this asset's structure. You can alter descriptors (e.g. change color from red to blue) while keeping the same layout.
                  </p>
                  <Button onClick={() => handleRefine(selectedImage)} variant="glass" className="w-full text-xs font-semibold gap-1 py-4">
                    Lock Seed & Edit
                  </Button>
                </div>

                <div className="border-t border-border/10 pt-4 space-y-3">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-accent-warm" /> Schedule Asset
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Schedule this visual directly as a social post slot in your content calendar.
                  </p>
                  <div className="space-y-2.5">
                    <Input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="bg-background/40 text-xs"
                    />
                    <Button
                      onClick={handleSchedule}
                      disabled={scheduling || !scheduleDate}
                      className="w-full bg-gradient-to-r from-primary to-accent-warm text-primary-foreground font-semibold text-xs py-4.5"
                    >
                      {scheduling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Queue Visual Slot"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && selectedImage && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 animate-in fade-in-50">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button variant="glass" size="sm" onClick={() => downloadImage(selectedImage.url)} className="text-white border-white/20 hover:bg-white/10 text-xs">
              <Download className="h-4 w-4 mr-1.5" /> Download
            </Button>
            <Button variant="glass" size="icon" onClick={() => setIsFullscreen(false)} className="text-white border-white/20 hover:bg-white/10 h-9 w-9 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="max-w-4xl max-h-[80vh] flex items-center justify-center p-2">
            <img
              src={selectedImage.url}
              alt={prompt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
          <p className="mt-4 text-xs font-sans text-white/70 max-w-lg text-center px-4 leading-relaxed">{prompt}</p>
        </div>
      )}
    </div>
  );
}

