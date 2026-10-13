# Generative UI Studio — CodeWalnut POC

Claude builds interfaces live from a chat prompt. The model never writes code: it composes a **JSON UI spec** from a catalog of shadcn/ui components, and the browser renders that spec *while it is still streaming*, so the layout appears first and fills in component by component.

This POC implements **Method 3 (JSON UI spec + component catalog)**. The architecture is ready for **Method 2 (tool calls → prebuilt components)**; see [Adding Method 2](#adding-method-2).

## Run it

```bash
npm install
# paste your key into .env  →  ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Open http://localhost:5173 and pick a suggestion from the chat.

`npm run dev` starts two processes:

| Process | Port | What it does |
|---|---|---|
| `web` (Vite) | 5173 | React app; proxies `/api/*` to the API server |
| `api` (Hono + Vercel AI SDK) | 8787 | Holds the API key, calls Claude, streams the UI message stream |

The API key only lives on the server. The browser never sees it.

Production: `npm run build && npm start` serves the built app and the API from one Node process (port `PORT`, default 8787).

### Deploy to Render

Create a **Web Service** (not a Static Site), or use the included `render.yaml` blueprint:

| Setting | Value |
|---|---|
| Build command | `npm install; npm run build` |
| Start command | `npm start` |
| Health check path | `/api/health` |
| Environment | `ANTHROPIC_API_KEY` (secret), `NODE_VERSION=22` |

`.env` is not deployed; set the key in Render's environment settings. Render provides `PORT` automatically.

### Deploy to Vercel

Vercel serves `dist/` as static files and runs the API as a Vercel Function (`api/index.ts`), which wraps the same Hono app (`server/app.ts`) that Render runs. Settings live in `vercel.json`:

| Setting | Value |
|---|---|
| Framework preset | Vite (from `vercel.json`) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment | `ANTHROPIC_API_KEY` (secret); optional `ANTHROPIC_MODEL`, `ANTHROPIC_EFFORT` |

`vercel.json` rewrites `/api/*` to the function and allows up to 60 s per generation (`maxDuration`).

## Configuration (`.env`)

| Variable | Default | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Required |
| `ANTHROPIC_MODEL` | `claude-opus-5-5` | `claude-sonnet-5-5` or `claude-haiku-5-5` stream faster for live demos |
| `ANTHROPIC_EFFORT` | `low` | `low` / `medium` / `high`. Lower is faster to first component |
| `PORT` | `8787` | API server port |

Server-side refusal fallbacks (`fallbacks: 'default'`) are enabled. If a safety classifier declines a turn, the API retries it on Anthropic's recommended fallback model.

## How it works

```
 Chat prompt
     │
     ▼
 useChat (@ai-sdk/react) ── POST /api/chat ──▶ Hono server
                                                 │ streamText(model, tools: { renderUI })
                                                 ▼
                                               Claude writes renderUI({ title, components[] })
                                                 │ tool input streams as JSON deltas
     ┌───────────────────────────────────────────┘
     ▼
 tool part "tool-renderUI" (state: input-streaming → partial spec)
     │
     ▼
 <SpecRenderer>  flat component list → shadcn components
                 missing children → skeletons until they arrive
```

**The spec** is a flat adjacency list (similar to Google's A2UI): `components[0]` is the root, and containers reference children by id. This keeps the schema non-recursive and makes progressive rendering natural.

```json
{
  "title": "Q3 Revenue Dashboard",
  "components": [
    { "id": "root", "type": "Stack", "children": ["title", "kpis"] },
    { "id": "title", "type": "Heading", "text": "Q3 Revenue", "level": 1 },
    { "id": "kpis", "type": "Grid", "columns": 4, "children": ["mrr"] },
    { "id": "mrr", "type": "Metric", "label": "MRR", "value": "$1.42M", "change": "+8.4%", "trend": "up" }
  ]
}
```

**Interactivity:** generated buttons carry an `action.message`. Clicking one sends that message, plus any form values if `includeFormData` is set, as the next chat turn. Claude then responds with the next screen.

## Project layout

```
shared/ui-spec.ts            Zod catalog schema — single source of truth (tool schema + renderer types)
server/
  index.ts                   Hono app: /api/chat (streaming), /api/health
  agent/model.ts             Claude model, effort, fallbacks
  agent/instructions.ts      System prompt
  agent/tools/render-ui.ts   Method 3 tool
  agent/tools/index.ts       Tool registry (Method 2 tools plug in here)
src/
  genui/renderer.tsx         SpecRenderer: partial spec → React tree, form state, actions
  genui/nodes.tsx            Node/children rendering, skeleton slots, cycle guard
  genui/catalog/*            One React implementation per catalog type (shadcn-based)
  components/chat/*          Chat panel, prompt input + suggestions, loaders, spec chips
  components/canvas/*        Canvas: live preview, JSON spec view, empty/composing states
  lib/suggestions.ts         Demo prompts shown in the chat box
```

### Catalog

Layout: `Stack` `Grid` `Card` `Tabs` · Content: `Heading` `Text` `Badge` `Alert` `Separator` · Data: `Metric` `Chart` (bar/line/area/pie) `Table` `Progress` `List` `KeyValue` `Timeline` · Inputs: `Input` `Textarea` `Select` `Checkbox` `Switch` `Button`

To add a component:
1. Add its Zod schema to `shared/ui-spec.ts` and include it in `uiComponentSchema`.
2. Implement it in `src/genui/catalog/` and register it in `catalog/index.ts`. TypeScript fails until the new type has a renderer.

## Adding Method 2

Method 2 maps a tool call to a prebuilt component. It is useful when real data comes from your APIs, for example `showFlights` calling a flights service.

1. Add the tool in `server/agent/tools/` with an `execute` that fetches data, and register it in `tools/index.ts`.
2. Add its input/output types to `GenUITools` in `src/lib/chat-types.ts`.
3. Render the `tool-<name>` part in `message-item.tsx` and the canvas with your component.

Both methods share the same chat, streaming and loaders, and Claude decides per turn which one fits.

## Scripts

| Script | |
|---|---|
| `npm run dev` | Web + API with hot reload |
| `npm run build` | Type-check and build the frontend |
| `npm start` | Serve the production build + API on :8787 |
| `npm run typecheck` | `tsc -b` across app, server and shared |
| `npm run lint` | oxlint |
