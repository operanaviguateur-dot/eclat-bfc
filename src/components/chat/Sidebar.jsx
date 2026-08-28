import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus, MessageSquare, Sparkles, Trash2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, open, onClose }) {
  const location = useLocation();
  return (
    <>
      {open &&
      <div
        className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm md:hidden"
        onClick={onClose} />

      }
      <aside
        className={cn(
          "fixed md:static z-40 top-0 left-0 h-full w-72 shrink-0 border-r border-border bg-sidebar flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
        
        <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight">base44 Loges IA</span>
        </div>

        <div className="p-3 space-y-2">
          <Link
            to="/statut"
            onClick={onClose}
            className={cn(
              "flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
              location.pathname === "/statut"
                ? "border-foreground/20 bg-accent text-foreground"
                : "border-border bg-background hover:bg-accent"
            )}
          >
            <Activity className="h-4 w-4 text-emerald-500" />
            Statut
          </Link>
          <button
            onClick={onNew}
            className="flex w-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium hover:bg-accent transition">
            <Plus className="h-4 w-4" />
            Nouvelle conversation
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
          {conversations.length === 0 &&
          <p className="px-3 py-8 text-center text-xs text-muted-foreground/70">
              Aucune conversation pour le moment.
            </p>
          }
          {conversations.map((c) =>
          <div
            key={c.id}
            className={cn(
              "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition",
              c.id === activeId ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground"
            )}
            onClick={() => onSelect(c.id)}>
            
              <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
              <span className="flex-1 truncate">{c.title || "Nouvelle conversation"}</span>
              <button
              onClick={(e) => {e.stopPropagation();onDelete(c.id);}}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition">
              
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </nav>

        <div className="border-t border-border p-4">
          <p className="text-[11px] text-muted-foreground/60">Propulsé par Base44</p>
        </div>
      </aside>
    </>);

}