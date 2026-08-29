import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ArrowLeft, BarChart3, MessageSquare, Images, Layers } from "lucide-react";
import { MODELS } from "@/components/chat/ModelSelector";

const STORAGE_KEY = "lumiere_conversations";

const dayLabel = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

export default function Statistiques() {
  const stats = useMemo(() => {
    let conversations = [];
    try {
      conversations = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      conversations = [];
    }

    const perDay = {};
    const perModel = {};
    let totalMessages = 0;
    let totalImages = 0;

    conversations.forEach((c) => {
      (c.messages || []).forEach((m) => {
        totalMessages += 1;
        if (m.image_url) totalImages += 1;

        const date = m.created_at || c.created_at;
        if (date) {
          const key = new Date(date).toISOString().slice(0, 10);
          perDay[key] = (perDay[key] || 0) + 1;
        }

        if (m.role === "assistant") {
          const model = m.model || "automatic";
          perModel[model] = (perModel[model] || 0) + 1;
        }
      });
    });

    const chartData = Object.entries(perDay)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-14)
      .map(([key, count]) => ({ key, label: dayLabel(key), messages: count }));

    const modelData = Object.entries(perModel)
      .map(([id, count]) => {
        const found = MODELS.find((mm) => mm.id === id);
        return { id, name: found ? found.name : id, count };
      })
      .sort((a, b) => b.count - a.count);

    const totalModelMsgs = modelData.reduce((n, m) => n + m.count, 0) || 1;

    return {
      totalConversations: conversations.length,
      totalMessages,
      totalImages,
      chartData,
      modelData,
      totalModelMsgs,
    };
  }, []);

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
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h1 className="font-heading text-sm font-medium tracking-tight">Analyses d'usage</h1>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                Vos statistiques
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Nombre de messages envoyés et usage estimé des modèles par jour.
              </p>
            </div>

            {/* KPI cards */}
            <div className="mb-8 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight">{stats.totalMessages}</p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight">{stats.totalConversations}</p>
                <p className="text-xs text-muted-foreground">Conversations</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Images className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight">{stats.totalImages}</p>
                <p className="text-xs text-muted-foreground">Images générées</p>
              </div>
            </div>

            {/* Messages per day chart */}
            <div className="mb-8 rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium">Messages par jour (14 derniers jours)</h3>
              {stats.chartData.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Aucune donnée disponible.</p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar dataKey="messages" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Model usage */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium">Usage estimé des modèles</h3>
              {stats.modelData.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucune donnée disponible.</p>
              ) : (
                <div className="space-y-3">
                  {stats.modelData.map((m) => {
                    const pct = Math.round((m.count / stats.totalModelMsgs) * 100);
                    return (
                      <div key={m.id}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium">{m.name}</span>
                          <span className="text-muted-foreground">{m.count} msg · {pct}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-foreground"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}