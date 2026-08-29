const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, Image as ImageIcon, MessageSquare, X, Loader2, FileText } from "lucide-react";

import { cn } from "@/lib/utils";

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const [mode, setMode] = useState("chat"); // 'chat' | 'image'
  const [attachments, setAttachments] = useState([]);
  const ref = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.min(ref.current.scrollHeight, 200) + "px";
    }
  }, [value]);

  const addFiles = async (files) => {
    for (const file of Array.from(files)) {
      const id = uid();
      const isImage = file.type.startsWith("image/");
      const previewUrl = isImage ? URL.createObjectURL(file) : null;
      setAttachments((prev) => [
        ...prev,
        { id, name: file.name, previewUrl, isImage, uploading: true, file_url: null },
      ]);
      try {
        const res = await db.integrations.Core.UploadFile({ file });
        setAttachments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, file_url: res.file_url, uploading: false } : a))
        );
      } catch {
        setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, uploading: false, error: true } : a)));
      }
    }
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const a = prev.find((x) => x.id === id);
      if (a?.previewUrl) URL.revokeObjectURL(a.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const busy = attachments.some((a) => a.uploading);
  const canSend = (!value.trim() && attachments.length === 0) || disabled || busy;

  const submit = () => {
    if (canSend) return;
    onSend(value.trim(), attachments, mode);
    setValue("");
    setAttachments([]);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const placeholder =
    mode === "image" ? "Décrivez l'image à générer…" : "Écrivez votre message…";

  const suggestions =
    mode === "image"
      ? [
          "Un coucher de soleil sur la montagne, style peinture à l'huile",
          "Logo minimaliste pour une marque de café",
          "Chat astronauta flottant dans l'espace, illustration colorée",
        ]
      : [
          "Résume-moi l'actualité technologique du moment",
          "Aide-moi à rédiger un e-mail professionnel",
          "Donne-moi trois idées de repas équilibrés pour la semaine",
          "Explique-moi l'apprentissage automatique simplement",
        ];

  const sendSuggestion = (text) => {
    if (disabled) return;
    onSend(text, attachments, mode);
    setValue("");
    setAttachments([]);
  };

  return (
    <div className="px-4 sm:px-6 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent">
      <div className="mx-auto max-w-3xl">
        {value.trim() === "" && attachments.length === 0 && !disabled && (
          <div className="mb-2 flex flex-wrap gap-2 justify-center">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendSuggestion(s)}
                className="rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-accent transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="rounded-2xl border border-border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring/40 transition">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 pb-0">
              {attachments.map((a) => (
                <div
                  key={a.id}
                  className="group relative flex items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5"
                >
                  {a.isImage ? (
                    <img src={a.previewUrl} alt={a.name} className="h-9 w-9 rounded object-cover" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="max-w-[140px] truncate text-xs">{a.name}</span>
                  {a.uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  ) : a.error ? (
                    <span className="text-[10px] text-destructive">échec</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">prêt</span>
                  )}
                  <button
                    onClick={() => removeAttachment(a.id)}
                    className="ml-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-1.5 p-2">
            <div className="flex items-center gap-0.5 pb-1">
              <button
                onClick={() => setMode("chat")}
                title="Mode conversation"
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition",
                  mode === "chat" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent"
                )}
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMode("image")}
                title="Mode génération d'image"
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition",
                  mode === "image" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent"
                )}
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              {mode === "chat" && (
                <button
                  onClick={() => fileRef.current?.click()}
                  title="Joindre un fichier"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent transition"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              )}
            </div>

            <textarea
              ref={ref}
              rows={1}
              value={value}
              disabled={disabled}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKey}
              placeholder={placeholder}
              className="flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none placeholder:text-muted-foreground/60 max-h-[200px]"
            />
            <button
              onClick={submit}
              disabled={canSend}
              className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
          {mode === "image"
            ? "L'image est générée à partir de votre description."
            : "L'assistant peut commettre des erreurs. Vérifiez les informations importantes."}
        </p>
      </div>
    </div>
  );
}