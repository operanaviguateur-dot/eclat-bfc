export default async function handler(req, res) {
  // Support both GET (ping/healthcheck) and POST
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: 'API Mistral Proxy active' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée (POST attendu)' });
  }

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Clé API Mistral (MISTRAL_API_KEY) non configurée sur le serveur. Veuillez renseigner la variable d\'environnement.'
    });
  }

  const defaultModel = process.env.MISTRAL_MODEL || 'mistral-large-2512';
  const { prompt, model = defaultModel, messages, temperature = 0.7 } = req.body || {};

  let formattedMessages = messages;
  if (!formattedMessages || formattedMessages.length === 0) {
    formattedMessages = [
      {
        role: 'system',
        content: 'Tu es Éclat BFC, un assistant IA utile, précis, rapide et concis. Réponds toujours en français et formate tes réponses en Markdown élégant avec des listes, gras et sections quand nécessaire.'
      },
      {
        role: 'user',
        content: prompt || ''
      }
    ];
  }

  const modelsToTry = Array.from(new Set([
    model || defaultModel,
    defaultModel,
    'mistral-large-2512',
    'mistral-large-latest',
    'mistral-medium-latest',
    'mistral-small-latest'
  ]));

  let lastError = null;

  for (const targetModel of modelsToTry) {
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: formattedMessages,
          temperature,
          max_tokens: 2048
        })
      });

      const data = await response.json();

      if (response.ok && data.choices && data.choices[0]?.message?.content) {
        return res.status(200).json({
          response: data.choices[0].message.content,
          model: targetModel,
          status: 'success'
        });
      }

      if (data.type === 'tier_not_allowed' || data.code === '1910' || response.status === 403) {
        lastError = data.message;
        continue;
      }

      if (!response.ok) {
        lastError = data.message || `Erreur API Mistral (${response.status})`;
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  return res.status(502).json({
    error: lastError || 'Impossible de joindre l\'API Mistral AI.'
  });
}
