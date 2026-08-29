import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Cpu,
  Sparkles,
  Zap,
  Shield,
  CheckCircle2,
  ExternalLink,
  Bot
} from "lucide-react";
import { MODELS } from "@/components/chat/ModelSelector";
import ModelLogo from "@/components/chat/ModelLogo";
import { Button } from "@/components/ui/button";

const MODEL_DETAILS = {
  automatic: {
    provider: "Smart Router",
    speed: "Ultra rapide",
    context: "Variable",
    category: "Généraliste",
    features: ["Routage intelligent", "Sélection dynamique selon la requête", "Optimisation des coûts"],
    badge: "Recommandé"
  },
  gpt_5_mini: {
    provider: "OpenAI",
    speed: "Très rapide",
    context: "128k tokens",
    category: "Léger & Économique",
    features: ["Réponses instantanées", "Faible latence", "Idéal pour questions simples"],
    badge: "Rapide"
  },
  gpt_5_4: {
    provider: "OpenAI",
    speed: "Rapide",
    context: "200k tokens",
    category: "Polyvalent",
    features: ["Grand équilibre vitesse/qualité", "Excellente rédaction", "Polyvalence générale"],
    badge: "Populaire"
  },
  gemini_3_flash: {
    provider: "Google DeepMind",
    speed: "Ultra rapide",
    context: "1M tokens",
    category: "Multimodal & Web",
    features: ["Recherche web en temps réel", "Traitement de documents longs", "Analyse d'images"],
    badge: "Web Search"
  },
  gemini_3_1_pro: {
    provider: "Google DeepMind",
    speed: "Modéré",
    context: "2M tokens",
    category: "Avancé & Multimodal",
    features: ["Contexte ultra-large (2M)", "Raisonnement complexe", "Recherche web intégrée"],
    badge: "Grand Contexte"
  },
  claude_sonnet_4_6: {
    provider: "Anthropic",
    speed: "Rapide",
    context: "200k tokens",
    category: "Rédaction & Analyse",
    features: ["Style d'écriture naturel et nuancé", "Excellente analyse de texte", "Précision factuelle"],
    badge: "Nuancé"
  },
  "claude-sonnet-5": {
    provider: "Anthropic",
    speed: "Très rapide",
    context: "200k tokens",
    category: "Nouvelle Génération",
    features: ["Architecture de dernière génération", "Capacités de codage de pointe", "Compréhension approfondie"],
    badge: "Nouveau"
  },
  claude_opus_4_6: {
    provider: "Anthropic",
    speed: "Modéré",
    context: "200k tokens",
    category: "Raisonnement Profond",
    features: ["Raisonnement logique complexe", "Résolution de problèmes difficiles", "Expertise approfondie"],
    badge: "Expert"
  },
  claude_opus_4_8: {
    provider: "Anthropic",
    speed: "Standard",
    context: "200k tokens",
    category: "Haute Performance",
    features: ["Modèle le plus puissant de la gamme", "Maîtrise absolue du code et de la logique", "Synthèse complexe"],
    badge: "Ultra Puissant"
  }
};

export default function Modeles() {
  const navigate = useNavigate();

  const handleSelectModel = (modelId) => {
    localStorage.setItem("lumiere_model", modelId);
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-8 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            to="/chat"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Modèles d'Intelligence Artificielle</h1>
            <p className="text-xs text-muted-foreground">Découvrez et choisissez le modèle adapté à vos besoins</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/chat">
            <Button size="sm" className="gap-1.5">
              <Bot className="h-4 w-4" />
              <span>Ouvrir le Chat</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-6 sm:p-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              Multi-fournisseurs intégrés
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Des modèles de pointe pour chaque usage
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Basculez librement entre les technologies d'OpenAI, Anthropic et Google DeepMind selon vos besoins de rapidité, de raisonnement ou d'analyse web.
            </p>
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODELS.map((m) => {
            const details = MODEL_DETAILS[m.id] || {
              provider: "IA",
              speed: "Standard",
              context: "128k",
              category: "Général",
              features: ["Conversation naturelle", "Assistance intelligente"],
              badge: "IA"
            };

            return (
              <div
                key={m.id}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm hover:border-primary/50 hover:shadow-md transition duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent border border-border/80">
                        {m.id === "automatic" ? (
                          <Cpu className="h-5 w-5 text-primary" />
                        ) : (
                          <ModelLogo modelId={m.id} className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition">
                          {m.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">{details.provider}</span>
                      </div>
                    </div>

                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                      {details.badge}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {m.desc}
                  </p>

                  <div className="space-y-2 mb-4 border-t border-border/60 pt-3 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Vitesse</span>
                      <span className="font-medium text-foreground">{details.speed}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Fenêtre de contexte</span>
                      <span className="font-medium text-foreground">{details.context}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-5">
                    {details.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleSelectModel(m.id)}
                  variant="outline"
                  className="w-full justify-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition"
                >
                  <span>Utiliser ce modèle</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
