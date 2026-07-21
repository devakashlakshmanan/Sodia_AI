import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getClientSession } from "@/lib/auth";
import { getWorkspaceItemsAction, deleteWorkspaceItemAction } from "@/lib/server-actions.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Search, Trash2, Copy, Check, Eye, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/saved")({
  component: SavedWorkspace,
});

function SavedWorkspace() {
  const user = getClientSession();
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const loadItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getWorkspaceItemsAction({ data: { userId: user.id } });
      setItems(res);
      setFilteredItems(res);
    } catch (e) {
      toast.error("Failed to load workspace items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let result = items;
    if (activeTab !== "all") {
      result = result.filter((item) => item.agentType === activeTab.toUpperCase());
    }
    if (search) {
      result = result.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredItems(result);
  }, [search, activeTab, items]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteWorkspaceItemAction({ data: { id } });
      toast.success("Item deleted from workspace");
      setItems(items.filter((item) => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (e) {
      toast.error("Failed to delete item");
    }
  };

  const copyContent = (item: any) => {
    let text = "";
    try {
      const parsed = JSON.parse(item.content);
      if (item.agentType === "CAPTION") {
        text = `${parsed.hook}\n\n${parsed.body}\n\n${parsed.cta}`;
      } else if (item.agentType === "IMAGE") {
        text = parsed.url;
      } else if (item.agentType === "CONVERTER") {
        text = `LINKEDIN:\n${parsed.linkedin}\n\nX:\n${parsed.x}`;
      } else {
        text = JSON.stringify(parsed, null, 2);
      }
    } catch (e) {
      text = item.content;
    }
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    toast.success("Copied item content to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderContentPreview = (item: any) => {
    try {
      const parsed = JSON.parse(item.content);
      if (item.agentType === "CAPTION") {
        return (
          <div className="space-y-1.5 text-xs text-muted-foreground line-clamp-3">
            <span className="font-semibold text-foreground">"{parsed.hook}"</span>
            <p>{parsed.body}</p>
          </div>
        );
      }
      if (item.agentType === "IMAGE") {
        return (
          <div className="relative h-20 w-full overflow-hidden rounded-lg bg-surface border border-border/20 flex items-center justify-center p-1">
            <img src={parsed.url} alt={item.title} className="h-full object-contain rounded-md" />
          </div>
        );
      }
      if (item.agentType === "TREND") {
        return <p className="text-xs text-muted-foreground line-clamp-3 italic">"{parsed.summary}"</p>;
      }
      if (item.agentType === "RESEARCH") {
        return <p className="text-xs text-muted-foreground line-clamp-3 italic">"{parsed.researchSummary}"</p>;
      }
      return <p className="text-xs text-muted-foreground line-clamp-3 font-mono">{item.content.substring(0, 100)}...</p>;
    } catch (e) {
      return <p className="text-xs text-muted-foreground line-clamp-3">{item.content}</p>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and filter controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search saved items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background/40"
          />
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-muted-foreground" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto overflow-x-auto">
          <TabsList className="bg-background/80 border border-border/40 p-1 rounded-xl flex">
            <TabsTrigger value="all" className="rounded-lg text-xs">All</TabsTrigger>
            <TabsTrigger value="trend" className="rounded-lg text-xs">Trends</TabsTrigger>
            <TabsTrigger value="research" className="rounded-lg text-xs">Research</TabsTrigger>
            <TabsTrigger value="idea" className="rounded-lg text-xs">Ideas</TabsTrigger>
            <TabsTrigger value="caption" className="rounded-lg text-xs">Captions</TabsTrigger>
            <TabsTrigger value="converter" className="rounded-lg text-xs">Conversions</TabsTrigger>
            <TabsTrigger value="image" className="rounded-lg text-xs">Images</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 py-6">
          <div className="h-40 rounded-2xl bg-surface/30 animate-pulse" />
          <div className="h-40 rounded-2xl bg-surface/30 animate-pulse" />
          <div className="h-40 rounded-2xl bg-surface/30 animate-pulse" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center text-muted-foreground">
          <Star className="mx-auto h-8 w-8 text-muted-foreground/30 animate-bounce mb-3" />
          No items found in this workspace filter.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="glass rounded-2xl p-5 flex flex-col justify-between hover:border-primary/50 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-surface px-2.5 py-0.5 rounded-full border border-border/40 text-muted-foreground">
                    {item.agentType}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-display font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h4>
                <div className="pt-2 border-t border-border/20">
                  {renderContentPreview(item)}
                </div>
              </div>

              <div className="flex gap-2 mt-5 border-t border-border/20 pt-4">
                <Button variant="glass" size="sm" onClick={() => setSelectedItem(item)} className="flex-1 text-xs gap-1">
                  <Eye className="h-3.5 w-3.5" /> Open
                </Button>
                <Button variant="ghost" size="icon" onClick={() => copyContent(item)} className="h-9 w-9 text-muted-foreground hover:text-foreground">
                  {copiedId === item.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded View Dialog Mockup */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass rounded-3xl p-6 border border-border/40 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/20 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase">{selectedItem.agentType} Workspace Item</span>
                <h3 className="font-display font-bold text-lg">{selectedItem.title}</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedItem(null)}>&times;</Button>
            </div>

            <div className="overflow-y-auto max-h-[350px] p-4 rounded-xl bg-background/40 border border-border/20 select-text select-all">
              {(() => {
                try {
                  const parsed = JSON.parse(selectedItem.content);
                  if (selectedItem.agentType === "IMAGE") {
                    return (
                      <div className="flex flex-col items-center gap-3">
                        <img src={parsed.url} alt={selectedItem.title} className="max-h-[250px] rounded-lg" />
                        <p className="text-xs text-muted-foreground font-mono">{parsed.prompt}</p>
                      </div>
                    );
                  }
                  if (selectedItem.agentType === "CAPTION") {
                    return (
                      <div className="space-y-4 text-sm leading-relaxed whitespace-pre-wrap">
                        <span className="font-bold block text-base text-foreground border-l-2 border-primary pl-2">{parsed.hook}</span>
                        <p>{parsed.body}</p>
                        <p className="text-primary font-semibold border-t border-dashed border-border/40 pt-2">{parsed.cta}</p>
                      </div>
                    );
                  }
                  return <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/80">{JSON.stringify(parsed, null, 2)}</pre>;
                } catch (e) {
                  return <p className="text-sm whitespace-pre-wrap">{selectedItem.content}</p>;
                }
              })()}
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-border/20 pt-4">
              <Button variant="glass" onClick={() => copyContent(selectedItem)}>
                Copy Content
              </Button>
              <Button onClick={() => setSelectedItem(null)}>
                Close Workspace Detail
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

