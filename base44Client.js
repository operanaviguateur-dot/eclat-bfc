// Standalone client and DB emulator for standalone deployment (Vercel, Netlify, etc.)
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
      InvokeLLM: async ({ prompt, model = 'gpt_5_4' }) => {
        // Simulated AI response generator
        await new Promise((r) => setTimeout(r, 600));

        const isPing = prompt && prompt.toLowerCase().includes('ping');
        if (isPing) {
          return { response: 'pong', status: 'ok' };
        }

        // Clean and contextual reply
        return {
          response: `Je suis ravi de vous aider ! Vous avez posé votre question avec le modèle **${model}**.\n\nVoici les éléments clés en réponse à votre demande :\n- **Clarté et précision** : Analyse effectuée avec succès.\n- **Contexte** : Prêt pour approfondir vos requêtes.\n\nN'hésitez pas si vous souhaitez plus de précisions !`,
          status: 'success'
        };
      },
      GenerateImage: async ({ prompt }) => {
        await new Promise((r) => setTimeout(r, 800));
        const encoded = encodeURIComponent(prompt || 'abstract modern digital art');
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