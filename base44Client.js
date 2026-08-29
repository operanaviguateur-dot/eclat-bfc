// Standalone client and DB emulator with secure backend proxy for Mistral AI
export async function callChatAPI({ prompt, model = "mistral-large-2512", history = [] }) {
  const messages = [
    {
      role: "system",
      content: "Tu es Éclat BFC, un assistant IA utile, précis, rapide et concis. Réponds toujours en français et formate tes réponses en Markdown élégant avec des listes, gras et sections quand nécessaire."
    }
  ];

  if (history && history.length > 0) {
    history.forEach((m) => {
      messages.push({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content || ""
      });
    });
  } else if (prompt) {
    messages.push({
      role: "user",
      content: prompt
    });
  }

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt,
      model,
      messages
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Erreur serveur (${res.status})`);
  }

  return {
    response: data.response,
    model: data.model || model,
    status: "success"
  };
}

export const db = globalThis.__B44_DB__ || {
  auth: {
    isAuthenticated: async () => true,
    me: async () => ({ id: 'user_1', name: 'Utilisateur', email: 'user@eclat-bfc.fr', role: 'user' }),
    logout: () => {},
    redirectToLogin: () => {}
  },
  entities: new Proxy({}, {
    get: (target, entityName) => ({
      filter: async () => {
        try {
          const stored = localStorage.getItem(`db_${entityName}`);
          return stored ? JSON.parse(stored) : [];
        } catch {
          return [];
        }
      },
      get: async (id) => {
        try {
          const stored = localStorage.getItem(`db_${entityName}`);
          const items = stored ? JSON.parse(stored) : [];
          return items.find((i) => i.id === id) || null;
        } catch {
          return null;
        }
      },
      create: async (data) => {
        const item = { id: Math.random().toString(36).slice(2), ...data, created_at: new Date().toISOString() };
        try {
          const stored = localStorage.getItem(`db_${entityName}`);
          const items = stored ? JSON.parse(stored) : [];
          items.push(item);
          localStorage.setItem(`db_${entityName}`, JSON.stringify(items));
        } catch {}
        return item;
      },
      update: async (id, data) => {
        try {
          const stored = localStorage.getItem(`db_${entityName}`);
          const items = stored ? JSON.parse(stored) : [];
          const index = items.findIndex((i) => i.id === id);
          if (index !== -1) {
            items[index] = { ...items[index], ...data };
            localStorage.setItem(`db_${entityName}`, JSON.stringify(items));
            return items[index];
          }
        } catch {}
        return { id, ...data };
      },
      delete: async (id) => {
        try {
          const stored = localStorage.getItem(`db_${entityName}`);
          const items = stored ? JSON.parse(stored) : [];
          const filtered = items.filter((i) => i.id !== id);
          localStorage.setItem(`db_${entityName}`, JSON.stringify(filtered));
        } catch {}
        return true;
      }
    })
  }),
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        if (file && typeof window !== 'undefined') {
          return { file_url: URL.createObjectURL(file) };
        }
        return { file_url: '' };
      },
      InvokeLLM: async ({ prompt, model = 'mistral-large-2512' }) => {
        return await callChatAPI({ prompt, model });
      },
      GenerateImage: async ({ prompt }) => {
        await new Promise((r) => setTimeout(r, 800));
        return {
          url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80&sig=${Math.random().toString(36).slice(2)}`,
          prompt
        };
      }
    }
  }
};

globalThis.__B44_DB__ = db;
export const base44 = db;
export default db;