import { handle } from 'hono/vercel'
import { app } from '../server/app.js'

/**
 * Vercel Function entry. vercel.json rewrites every /api/* request here, and
 * the shared Hono app (server/app.ts) routes it. The frontend is served by
 * Vercel as static files from dist/.
 */
export const GET = handle(app)
export const POST = handle(app)
