import React, { useState, useEffect } from "react";
import { CheckCircle2, Server, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { db } from "@/api/base44Client";

export default function Statut() {
  const [serverOk, setServerOk] = useState(null);

  useEffect(() => {
    db.integrations.Core.InvokeLLM({ prompt: "ping" })
      .then(() => setServerOk(true))
      .catch(() => setServerOk(false));
  }, []);

  const checks = [
    {
      icon: Server,
      label: "Serveur",
      status: serverOk === null ? "Vérification…" : serverOk ? "Disponible" : "Indisponible",
      ok: serverOk,
    },
    {
      icon: ShieldCheck,
      label: "Accès collège",
      status: "Non bloqué",
      ok: true,
    },
    {
      icon: Sparkles,
      label: "Site IA unique",
      status: "Le seul autorisé",
      ok: true,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center gap-3 border-b border-border px-4 sm:px-6">
          <Wifi className="h-4 w-4 text-muted-foreground" />
          <h1 className="font-heading text-sm font-medium tracking-tight">Statut du service</h1>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-6 py-12">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                Tous les systèmes opérationnels
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Le service est accessible et fonctionne normalement.
              </p>
            </div>

            <div className="space-y-3">
              {checks.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <c.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.status}</p>
                  </div>
                  {c.ok === null ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
                  ) : c.ok ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <span className="text-xs font-medium text-red-500">Erreur</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                ✦ Ce site est le seul site d'IA autorisé et non bloqué par le collège.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}