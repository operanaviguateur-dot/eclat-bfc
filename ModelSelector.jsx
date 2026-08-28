import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import ModelLogo from "@/components/chat/ModelLogo";

export const MODELS = [
  { id: "automatic", name: "Automatique", desc: "Choix optimal selon la tâche" },
  { id: "gpt_5_mini", name: "GPT-5 Mini", desc: "Rapide et économe" },
  { id: "gpt_5_4", name: "GPT-5.4", desc: "Équilibré" },
  { id: "gemini_3_flash", name: "Gemini 3 Flash", desc: "Rapide + recherche web" },
  { id: "gemini_3_1_pro", name: "Gemini 3.1 Pro", desc: "Qualité élevée + recherche web" },
  { id: "claude_sonnet_4_6", name: "Claude Sonnet 4.6", desc: "Clair et nuancé" },
  { id: "claude-sonnet-5", name: "Claude Sonnet 5", desc: "Dernière génération" },
  { id: "claude_opus_4_6", name: "Claude Opus 4.6", desc: "Raisonnement avancé" },
  { id: "claude_opus_4_8", name: "Claude Opus 4.8", desc: "Le plus puissant" },
];

const LOGO_COLORS = {
  gpt: "text-foreground",
  gemini: "text-[#1a73e8]",
  claude: "text-[#cc785c]",
};

export default function ModelSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = MODELS.find((m) => m.id === value) || MODELS[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent transition"
      >
        <span className={cn("flex h-4 w-4 items-center justify-center", LOGO_COLORS[current.id.split("_")[0]] || "text-muted-foreground")}>
          {current.id === "automatic" ? (
            <Cpu className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ModelLogo modelId={current.id} className="h-4 w-4" />
          )}
        </span>
        <span className="font-medium">{current.name}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-border bg-popover p-1.5 shadow-lg">
          <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Modèle d'IA
          </p>
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => { onChange(m.id); setOpen(false); }}
              className={cn(
                "flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-accent transition",
                m.id === value && "bg-accent/60"
              )}
            >
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center mt-0.5", LOGO_COLORS[m.id.split("_")[0]] || "text-muted-foreground")}>
                {m.id === "automatic" ? (
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ModelLogo modelId={m.id} className="h-5 w-5" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{m.name}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">{m.desc}</p>
              </div>
              {m.id === value && <Check className="h-4 w-4 shrink-0 mt-0.5 text-foreground" />}
            </button>
          ))}
          <div className="mt-1 border-t border-border px-3 py-2">
            <p className="text-[11px] text-muted-foreground/70">
              Les modèles avancés consomment plus de crédits.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}