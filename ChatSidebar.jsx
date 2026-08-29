import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  Sparkles,
  Trash2,
  Activity,
  Cpu,
  ImageIcon,
  BarChart3,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  open,
  onClose
}) {
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Statut système", icon: Activity, color: "text-emerald-500" },
    { to: "/modeles", label: "Modèles d'IA", icon: Cpu, color: "text-primary" },
    { to: "/galerie", label: "Galerie d'images", icon: ImageIcon, color: "text-purple-500" },
    { to: "/statistiques", label: "Statistiques", icon: BarChart3, color: "text-blue-500" },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed md:static z-40 top-0 left-0 h-full w-72 shrink-0 border-r border-border bg-sidebar flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight text-sidebar-foreground">
            Éclat BFC
          </span>
        </div>

        {/* Navigation items */}
        <div className="p-3 space-y-1.5 border-b border-border/60">
          <button
            onClick={onNew}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-3 py-2.5 text-sm font-medium hover:opacity-90 shadow-sm transition mb-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle conversation</span>
          </button>

          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", item.color)} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Conversations History */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Historique
          </div>

          {conversations.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground/70">
              Aucune conversation enregistrée.
            </p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition",
                  c.id === activeId
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-sidebar-accent/50 text-muted-foreground hover:text-sidebar-foreground"
                )}
                onClick={() => onSelect(c.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
                <span className="flex-1 truncate">{c.title || "Nouvelle conversation"}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-70 hover:!opacity-100 hover:text-destructive transition p-1"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">Éclat BFC</span>
            <span className="text-[11px] opacity-70">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
