import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolveRootFile(fileName) {
  const extensions = ['.jsx', '.js', '.tsx', '.ts', '.json', '.css', '']
  for (const ext of extensions) {
    const p = path.resolve(__dirname, fileName + ext)
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      return p
    }
  }
  return null
}

function rootAliasPlugin() {
  return {
    name: 'custom-root-alias',
    enforce: 'pre',
    resolveId(source, importer) {
      if (importer && importer.includes('node_modules')) {
        return null
      }

      if (source.startsWith('@/')) {
        const subpath = source.replace(/^@\//, '')
        const direct = resolveRootFile(subpath)
        if (direct) return direct

        const baseName = path.basename(subpath)
        const baseDirect = resolveRootFile(baseName)
        if (baseDirect) return baseDirect

        const srcDirect = resolveRootFile(path.join('src', subpath))
        if (srcDirect) return srcDirect
      }

      return null
    }
  }
}

function devApiMiddlewarePlugin(env) {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ status: 'ok', message: 'Local Dev API Proxy active' }))
          return
        }

        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Méthode non autorisée (POST attendu)' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })

        req.on('end', async () => {
          try {
            const parsed = body ? JSON.parse(body) : {}
            const apiKey = env.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY
            if (!apiKey) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(
                JSON.stringify({
                  error:
                    'Clé API Mistral (MISTRAL_API_KEY) non configurée dans votre fichier .env ou .env.local.'
                })
              )
              return
            }

            const defaultModel = env.MISTRAL_MODEL || process.env.MISTRAL_MODEL || 'mistral-large-2512'
            const { prompt, model = defaultModel, messages, temperature = 0.7 } = parsed

            let formattedMessages = messages
            if (!formattedMessages || formattedMessages.length === 0) {
              formattedMessages = [
                {
                  role: 'system',
                  content:
                    'Tu es Éclat BFC, un assistant IA utile, précis, rapide et concis. Réponds toujours en français et formate tes réponses en Markdown élégant.'
                },
                {
                  role: 'user',
                  content: prompt || ''
                }
              ]
            }

            const modelsToTry = Array.from(
              new Set([
                model || defaultModel,
                defaultModel,
                'mistral-large-2512',
                'mistral-large-latest',
                'mistral-medium-latest',
                'mistral-small-latest'
              ])
            )

            let lastError = null

            for (const targetModel of modelsToTry) {
              try {
                const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`
                  },
                  body: JSON.stringify({
                    model: targetModel,
                    messages: formattedMessages,
                    temperature,
                    max_tokens: 2048
                  })
                })

                const data = await response.json()

                if (response.ok && data.choices && data.choices[0]?.message?.content) {
                  res.writeHead(200, { 'Content-Type': 'application/json' })
                  res.end(
                    JSON.stringify({
                      response: data.choices[0].message.content,
                      model: targetModel,
                      status: 'success'
                    })
                  )
                  return
                }

                if (data.type === 'tier_not_allowed' || data.code === '1910' || response.status === 403) {
                  lastError = data.message
                  continue
                }

                if (!response.ok) {
                  lastError = data.message || `Erreur API Mistral (${response.status})`
                }
              } catch (err) {
                lastError = err.message
              }
            }

            res.writeHead(502, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: lastError || "Impossible de joindre l'API Mistral AI" }))
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: `Erreur traitement requête: ${e.message}` }))
          }
        })
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      rootAliasPlugin(),
      devApiMiddlewarePlugin(env),
      react(),
    ],
  }
})
