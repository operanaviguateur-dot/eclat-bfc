import React from "react";
import { User, Sparkles, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function ChatMessage({ role, content, image_url, attachments }) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-4 px-4 sm:px-6 py-6 group", isUser ? "bg-transparent" : "bg-muted/30")}>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-sm",
          isUser
            ? "bg-background border-border text-foreground"
            : "bg-foreground text-background border-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {isUser ? "Vous" : "Assistant"}
        </p>
        {content && (
          <div className="prose prose-sm sm:prose-base max-w-none text-foreground/90 leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
        {attachments?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {attachments.map((a) =>
              a.isImage ? (
                <img
                  key={a.id}
                  src={a.file_url || a.previewUrl}
                  alt={a.name}
                  className="h-32 w-32 rounded-lg border border-border object-cover"
                />
              ) : (
                <div
                  key={a.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="max-w-[180px] truncate">{a.name}</span>
                </div>
              )
            )}
          </div>
        )}
        {image_url && (
          <div className="pt-1">
            <img
              src={image_url}
              alt="Image générée"
              className="max-w-sm w-full rounded-xl border border-border"
            />
          </div>
        )}
      </div>
    </div>
  );
}