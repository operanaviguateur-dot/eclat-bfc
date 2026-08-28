const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useRef } from "react";
import { Menu, Sparkles } from "lucide-react";

import Sidebar from "@/components/chat/Sidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import ModelSelector, { MODELS } from "@/components/chat/ModelSelector";
import ThemeToggle from "@/components/chat/ThemeToggle";

const STORAGE_KEY = "lumiere_conversations";

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function Home() {
  const [conversations, setConversations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [activeId, setActiveId] = useState(() => conversations[0]?.id || null);
  const [model, setModel] = useState(() => localStorage.getItem("lumiere_model") || "automatic");
  const [theme, setTheme] = useState(() => localStorage.getItem("base44_theme") || "light");
  const [input, setInput] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("base44_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId) || null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("lumiere_model", model);
  }, [model]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.messages, loading]);

  const newConversation = () => {
    const conv = { id: uid(), title: "Nouvelle conversation", messages: [] };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setSidebarOpen(false);
  };

  const selectConversation = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const deleteConversation = (id) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (id === activeId) setActiveId(next[0]?.id || null);
      return next;
    });
  };

  const send = async (text, attachments, mode) => {
    let convId = activeId;
    const cleanAttachments = (attachments || []).map((a) => ({
      id: a.id,
      name: a.name,
      isImage: a.isImage,
      file_url: a.file_url,
      previewUrl: a.isImage ? a.previewUrl : null,
    }));
    const userMsg = {
      id: uid(),
      role: "user",
      content: text,
      attachments: mode === "chat" ? cleanAttachments : undefined,
    };

    if (!convId) {
      const conv = { id: uid(), title: (text || "Image").slice(0, 40), messages: [userMsg] };
      convId = conv.id;
      setConversations((prev) => [conv, ...prev]);
      setActiveId(convId);
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                title: c.messages.length === 0 ? (text || "Image").slice(0, 40) : c.title,
                messages: [...c.messages, userMsg],
              }
            : c
        )
      );
    }

    setLoading(true);
    setInput("");
    try {
      let aiMsg;

      if (mode === "image") {
        const res = await db.integrations.Core.GenerateImage({ prompt: text });
        aiMsg = {
          id: uid(),
          role: "assistant",
          content: `Image générée pour : « ${text} »`,
          image_url: res.url,
        };
      } else {
        const file_urls = cleanAttachments.map((a) => a.file_url).filter(Boolean);
        const history = (conversations.find((c) => c.id === convId)?.messages || [])
          .concat([userMsg])
          .map((m) => `${m.role === "user" ? "Utilisateur" : "Assistant"}: ${m.content}`)
          .join("\n\n");

        const prompt = `Tu es base44, un assistant IA utile, clair et concis. Réponds en français, en Markdown quand c'est pertinent. Si des fichiers ou images sont joints, appuie-toi dessus.\n\n${history}\n\nAssistant:`;

        const useWeb = ["gemini_3_flash", "gemini_3_1_pro"].includes(model);
        const res = await db.integrations.Core.InvokeLLM({
          prompt,
          model,
          ...(file_urls.length ? { file_urls } : {}),
          ...(useWeb ? { add_context_from_internet: true } : {}),
        });
        const content = typeof res === "string" ? res : res?.response || JSON.stringify(res);
        aiMsg = { id: uid(), role: "assistant", content };
      }

      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, aiMsg] } : c))
      );
    } catch (e) {
      const errMsg = {
        id: uid(),
        role: "assistant",
        content: "Désolé, une erreur est survenue. Veuillez réessayer.",
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, errMsg] } : c))
      );
    } finally {
      setLoading(false);
    }
  };

  const messages = active?.messages || [];

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onNew={newConversation}
        onDelete={deleteConversation}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center gap-3 border-b border-border px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <h1 className="font-heading text-sm font-medium tracking-tight truncate">
              {active?.title || "base44"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector value={model} onChange={setModel} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="font-heading text-2xl font-semibold tracking-tight">
                  Comment puis-je vous aider ?
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Posez une question, demandez un texte, une idée ou une explication. base44 répond avec clarté.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {messages.map((m) => (
                  <ChatMessage
                    key={m.id}
                    role={m.role}
                    content={m.content}
                    image_url={m.image_url}
                    attachments={m.attachments}
                  />
                ))}
                {loading && (
                  <div className="flex gap-4 px-4 sm:px-6 py-6 bg-muted/30">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1.5 pt-6">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <ChatInput onSend={send} disabled={loading} />
      </div>
    </div>
  );
}