import 'dotenv/config'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { app } from './app.js'
import { EFFORT, MODEL_ID } from './agent/model.js'

/**
 * Long-lived Node server: local dev (`npm run dev`) and Render (`npm start`).
 * In production it also serves the built frontend from dist/.
 */
const PORT = Number(process.env.PORT) || 8787
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production')

if (isProduction) {
  app.use('/*', serveStatic({ root: './dist' }))
  app.get('*', serveStatic({ path: './dist/index.html' }))
}

serve({ fetch: app.fetch, port: PORT }, ({ port }) => {
  const keyState = process.env.ANTHROPIC_API_KEY ? 'API key loaded' : 'API key MISSING — add it to .env'
  console.log(`[api] http://localhost:${port}  ·  ${MODEL_ID} (effort: ${EFFORT})  ·  ${keyState}`)
})
