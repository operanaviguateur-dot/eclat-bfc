import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ImageIcon, Calendar, Download } from "lucide-react";

const STORAGE_KEY = "lumiere_conversations";

const dayKey = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

const sortKey = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : "0000-00-00");

export default function Galerie() {
  const groups = useMemo(() => {
    let conversations = [];
    try {
      conversations = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      conversations = [];
    }

    const images = [];
    conversations.forEach((c) => {
      (c.messages || []).forEach((m) => {
        if (m.image_url) {
          images.push({
            url: m.image_url,
            prompt: m.content || "",
            created_at: m.created_at || c.created_at,
            conversation: c.title,
          });
        }
      });
    });

    const map = {};
    images.forEach((img) => {
      const key = sortKey(img.created_at);
      if (!map[key]) map[key] = { label: dayKey(img.created_at), items: [] };
      map[key].items.push(img);
    });

    return Object.entries(map)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([_, v]) => v);
  }, []);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center gap-3 border-b border-border px-4 sm:px-6">
          <Link
            to="/chat"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <h1 className="font-heading text-sm font-medium tracking-tight">Galerie d'images</h1>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-10">
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                Images générées
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {total > 0
                  ? `${total} image${total > 1 ? "s" : ""} générée${total > 1 ? "s" : ""} lors de vos conversations, organisées par date.`
                  : "Aucune image générée pour le moment. Utilisez le mode image dans le chat pour en créer."}
              </p>
            </div>

            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <ImageIcon className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">La galerie est vide.</p>
                <Link
                  to="/chat"
                  className="mt-4 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 transition"
                >
                  Générer une image
                </Link>
              </div>
            ) : (
              <div className="space-y-10">
                {groups.map((g, i) => (
                  <div key={i}>
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="capitalize">{g.label}</span>
                      <span className="text-xs text-muted-foreground/60">· {g.items.length}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {g.items.map((img, j) => (
                        <div key={j} className="group relative overflow-hidden rounded-xl border border-border">
                          <img
                            src={img.url}
                            alt={img.prompt}
                            className="aspect-square w-full object-cover transition group-hover:scale-105"
                          />
                          <a
                            href={img.url}
                            download={`image-${j + 1}.png`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/80 group-hover:opacity-100"
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                            <p className="line-clamp-2 text-[11px] text-white/90">{img.prompt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}