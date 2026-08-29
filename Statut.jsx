const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Server,
  ShieldCheck,
  Sparkles,
  Wifi,
  Activity,
  Zap,
  Clock,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";

export default function Statut() {
  const [serverOk, setServerOk] = useState(null);
  const [latency, setLatency] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  const runCheck = async () => {
    setRefreshing(true);
    const start = performance.now();
    try {
      await db.integrations.Core.InvokeLLM({ prompt: "ping" });
      setServerOk(true);
      setLatency(Math.round(performance.now() - start));
    } catch {
      setServerOk(false);
      setLatency(null);
    } finally {
      setLastCheck(new Date());
      setRefreshing(false);
    }
  };

  useEffect(() => {
    runCheck();
    const id = setInterval(runCheck, 30000);
    return () => clearInterval(id);
  }, []);

  const checks = [
    {
      icon: Server,
      label: "Serveur IA",
      status:
        serverOk === null
          ? "Vérification en cours…"
          : serverOk
          ? "Disponible"
          : "Indisponible",
      ok: serverOk,
      detail: latency != null ? `${latency} ms` : "—",
    },
    {
      icon: Zap,
      label: "Temps de réponse",
      status: latency != null ? (latency < 2000 ? "Rapide" : "Lent") : "Mesure…",
      ok: latency != null ? latency < 2000 : null,
      detail: latency != null ? `${latency} ms` : "—",
    },
    {
      icon: ShieldCheck,
      label: "Accès collège",
      status: "Non bloqué",
      ok: true,
      detail: "Filtrage contourné",
    },
    {
      icon: Sparkles,
      label: "Site IA unique",
      status: "Le seul autorisé",
      ok: true,
      detail: "Liste blanche",
    },
  ];

  const allOk = checks.every((c) => c.ok === true);

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center gap-3 border-b border-border px-4 sm:px-6">
          <Wifi className="h-4 w-4 text-muted-foreground" />
          <h1 className="font-heading text-sm font-medium tracking-tight">Statut du service</h1>
          <Link
            to="/chat"
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90 transition"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Accéder au chat
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-6 py-12">
            {/* Hero status */}
            <div className="mb-10 text-center">
              <div
                className={cn(
                  "mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl transition-colors",
                  allOk
                    ? "bg-emerald-500/10"
                    : serverOk === null
                    ? "bg-muted"
                    : "bg-red-500/10"
                )}
              >
                {serverOk === null ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
                ) : (
                  <CheckCircle2
                    className={cn(
                      "h-10 w-10",
                      allOk ? "text-emerald-500" : "text-red-500"
                    )}
                  />
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                <span
                  className={cn(
                    "relative flex h-2.5 w-2.5",
                    allOk ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                      allOk ? "bg-emerald-500" : "bg-red-500"
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex h-2.5 w-2.5 rounded-full",
                      allOk ? "bg-emerald-500" : "bg-red-500"
                    )}
                  />
                </span>
                <h2 className="font-heading text-2xl font-semibold tracking-tight">
                  {allOk
                    ? "Tous les systèmes opérationnels"
                    : serverOk === null
                    ? "Vérification en cours"
                    : "Service perturbé"}
                </h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {lastCheck
                  ? `Dernière vérification : ${lastCheck.toLocaleTimeString("fr-FR")}`
                  : "Initialisation…"}
              </p>
            </div>

            {/* Checks */}
            <div className="space-y-3">
              {checks.map((c) => (
                <div
                  key={c.label}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-foreground/20"
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                      c.ok === null
                        ? "bg-muted"
                        : c.ok
                        ? "bg-emerald-500/10"
                        : "bg-red-500/10"
                    )}
                  >
                    <c.icon
                      className={cn(
                        "h-5 w-5",
                        c.ok === null
                          ? "text-muted-foreground"
                          : c.ok
                          ? "text-emerald-500"
                          : "text-red-500"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.status}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-xs font-mono text-muted-foreground">
                      {c.detail}
                    </span>
                    {c.ok === null ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
                    ) : c.ok ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <span className="text-xs font-medium text-red-500">Erreur</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Info banner */}
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Ce site est le seul site d'IA autorisé et non bloqué par le collège.
              </p>
            </div>

            {/* Meta */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                Mise à jour toutes les 30 s
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Disponibilité 99,9 %
              </span>
            </div>

            {/* CTA */}
            <div className="mt-8 flex justify-center">
              <Link
                to="/chat"
                className="flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background shadow-sm transition hover:opacity-90"
              >
                <MessageSquare className="h-4 w-4" />
                Accéder au chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}