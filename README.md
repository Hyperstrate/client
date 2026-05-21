# Hyperstrate Client

<p align="center">
  <strong>Open-source AI gateway control plane with visual router pipelines, provider management, prompts, evals, MCP tools, virtual keys, teams, SSO groups, analytics, and observability.</strong>
</p>

<p align="center">
  Build, operate, and observe production AI gateways from one modern Vue and TypeScript workspace.
</p>

<p align="center">
  <a href="https://github.com/Hyperstrate/client/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Hyperstrate/client/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-111827.svg"></a>
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue-3.5-42b883.svg">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178c6.svg">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8.svg">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6.2-646cff.svg">
</p>

---
<img src="https://raw.githubusercontent.com/Hyperstrate/client/refs/heads/master/home.gif" width="100%" style="object-fit: cover;" />

## What Is Hyperstrate Client?

Hyperstrate Client is the web interface for [Hyperstrate Server](https://github.com/Hyperstrate/server). It is a single-page application for teams running AI traffic in production: routing, policy, safety, cost controls, observability, prompt management, and team governance all live in one workspace.

Use it to:

- Design router pipelines visually, with features and interceptors shown in context.
- Register and operate model providers with health checks and key rotation.
- Inspect inference logs, costs, latency, cache performance, and agent sessions.
- Manage prompts, versions, evaluations, MCP servers, API keys, virtual keys, teams, and SSO groups.

## Highlights

| Area                | What You Get                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Router builder      | Visual Vue Flow pipeline, targets, features, interceptors, linting, import/export, test inference           |
| Pipeline features   | Caching, retry, fallback, rate limits, budgets, MCP tools, semantic memory, quality gates, rollout controls |
| Safety interceptors | Content filters, PII detection, prompt guard, prompt shield, semantic routing, A/B testing, team budgets    |
| Analytics           | Request volume, tokens, spend, errors, latency percentiles, cache hit rates, provider health, audit logs    |
| Playground          | Compare up to 4 models side by side or trace a prompt through a router                                      |
| Prompt management   | Template variables, version history, restore flow, router attachment                                        |
| Access control      | API keys, virtual keys, teams, org users, spend caps, SSO group mapping                                     |
| MCP                 | Register org-scoped Model Context Protocol servers for use inside router pipelines                          |

## How Hyperstrate Compares

Hyperstrate Client is the operating surface for a self-hosted AI gateway. It is designed for teams that need to change routing behavior, inspect why traffic moved, and manage access without jumping between a proxy config, an observability tool, and a custom admin panel.

```text
Design                 Operate                Improve
------                 -------                -------
routers + policies ->  live gateway traces -> prompts + evals
provider keys          teams + virtual keys    cost and quality reviews
MCP tools              budgets + limits        replay and regression checks
```

Legend: `built-in` means first-class UI, `partial` means possible but narrower, `external` means another tool or custom UI is usually needed, and `hosted` means the main console is outside your stack.

| UI Job | LiteLLM Dashboards | Portkey / Helicone | Langfuse / LangSmith | OpenRouter Console | Internal Admin Panels | Hyperstrate Client |
| --- | --- | --- | --- | --- | --- | --- |
| Build routers visually | partial | partial | not focus | no | custom | built-in |
| Edit live gateway policy | built-in | built-in | not focus | partial | custom | built-in |
| Manage providers and key rotation | built-in | partial | external | hosted | custom | built-in |
| Explain why a request routed | partial | built-in | app traces | partial | custom | built-in |
| Inspect cost, latency, cache, and errors | partial | built-in | built-in | partial | custom | built-in |
| Manage orgs, teams, API keys, and virtual keys | built-in | built-in | partial | partial | custom | built-in |
| Manage prompts, versions, and evals | partial | partial | built-in | no | custom | built-in |
| Operate against a self-hosted server and database | built-in | varies | varies | hosted | built-in | built-in |

### When The UI Matters

| Choose | When It Is The Better Fit |
| --- | --- |
| LiteLLM dashboards | You need a practical proxy console for keys, budgets, models, and spend controls |
| Portkey or Helicone | You want a managed gateway/observability console and are comfortable with hosted operations |
| Langfuse or LangSmith | Your core workflow is tracing application runs, reviewing prompts, managing datasets, and running experiments |
| OpenRouter console | You primarily need to browse, select, and call hosted models through one provider account |
| Internal admin panels | Your workflow is narrow enough that a custom screen around your own database is cheaper to maintain |
| Hyperstrate Client | Router design, provider operations, access control, traces, prompts, evals, and team governance all need to live together |

## Product Surface

### Router Operations

- Build routers with weighted, percentage, priority, or policy-driven targets.
- Add 25+ pipeline stages across context, caching, resilience, traffic, cost, quality, intelligence, and rollout.
- Configure pre-routing interceptors for classification, safety, traffic governance, and experimentation.
- Run live test inference and inspect every phase of the pipeline trace.
- Review logs, stored payloads, A/B variants, feedback, webhooks, and evaluation runs per router.

### Observability

- Track cost, tokens, request volume, error rate, and latency over time.
- Compare models, routers, virtual keys, providers, and cache behavior.
- Replay agent sessions with tool calls, quality scores, cost, turns, and loop detection.
- Export inference logs and inspect full request detail from the UI.

### Model And Prompt Management

- Register provider models from a catalog of 100+ definitions across 13 providers.
- Configure API keys, custom base URLs, key pools, and rotation grace periods.
- Create prompt templates with `{{variable}}` placeholders.
- Browse prompt version history, preview snapshots, and restore earlier versions.

## Quick Start

### Prerequisites

- Node.js 22+
- npm 10+
- A running [Hyperstrate Server](https://github.com/Hyperstrate/server), usually at `http://localhost:8090`

### Run Locally

```bash
git clone https://github.com/Hyperstrate/client.git
cd client

cp .env.dist .env.local
npm install
npm run dev
```

The app starts at `http://localhost:8080`.

Configure the API endpoint in `.env.local`:

```env
VITE_HYPERSTRATE_API_URL=http://localhost:8090
VITE_HYPERSTRATE_OPENAPI_URL=http://localhost:8090/swagger/doc.json
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

## Development

```bash
npm run dev             # Vite dev server
npm run type-check      # vue-tsc project check
npm run lint            # ESLint 9
npm run format          # Prettier for src/
npm run test:unit       # Vitest
npm run test:e2e        # Cypress headless
npm run story:dev       # Histoire at http://localhost:6006
npm run codegen         # regenerate the OpenAPI client
```

When the server OpenAPI spec changes, run:

```bash
npm run codegen
```

By default, code generation reads from `../server/docs/swagger.json` and patches the generated client with `scripts/patch-openapi-client.mjs`.

## Tech Stack

| Layer                | Technology                                                                  |
| -------------------- | --------------------------------------------------------------------------- |
| App framework        | [Vue 3](https://vuejs.org) + [TypeScript](https://www.typescriptlang.org)   |
| Build system         | [Vite](https://vite.dev)                                                    |
| Styling              | [Tailwind CSS](https://tailwindcss.com) 4                                   |
| Routing              | [Vue Router](https://router.vuejs.org)                                      |
| State and components | `vue-facing-decorator`, `vuex-facing-decorator`, class-style Vue components |
| Headless primitives  | [Reka UI](https://reka-ui.com)                                              |
| Diagrams             | [Vue Flow](https://vueflow.dev)                                             |
| Charts               | [D3](https://d3js.org)                                                      |
| Auth client          | [Supabase](https://supabase.com) SDK                                        |
| Testing              | [Vitest](https://vitest.dev), [Cypress](https://cypress.io)                 |
| Component docs       | [Histoire](https://histoire.dev)                                            |
| API client           | OpenAPI-generated TypeScript client                                         |

## Repository Layout

```text
src/
  features/
    app-auth/          login, setup, teams, virtual keys, SSO groups
    app-home/          home dashboard
    app-model/         model registry and provider configuration
    app-router/        router builder, pipeline diagram, router tabs
    app-playground/    model comparison and router inspection
    app-chat/          streaming chat interface
    app-mcp/           MCP server management
    app-prompt/        prompt editor and version history
    app-analytics/     analytics dashboards and logs
    agents/            agent session management
    domain-ui/         domain-specific reusable components
    ui/                shared design-system primitives
    core/              app shell, routing, DI container, store setup
  __generated__/
    hyperstrate-api/   generated TypeScript API client
```

## Production Build

```bash
npm run build
```

Static assets are emitted to `dist/`. Serve them from any static host or CDN. Since this is a client-side routed SPA, configure your web server to fall back to `index.html`.

Example Nginx config:

```nginx
location / {
    root /var/www/hyperstrate;
    try_files $uri $uri/ /index.html;
}
```

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

For a smooth review:

- Keep pull requests focused.
- Add tests for behavior changes.
- Run `npm run type-check`, `npm run lint`, `npm run test:unit -- --run`, and `npm run build-only`.
- Regenerate the API client after server OpenAPI changes.
- Open an issue first for large UI, routing, or design-system changes.

## Security

Please do not report security vulnerabilities in public issues. See [SECURITY.md](SECURITY.md) for the private disclosure process.

## License

Hyperstrate Client is released under the [MIT License](LICENSE).
