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

Legend: `✓` = built in, `x` = not the product's focus, Partial<sup>N</sup> = possible, but with an important caveat below.

| UI Capability | LiteLLM Dashboards | Portkey / Helicone | Langfuse / LangSmith | OpenRouter Console | Internal Admin Panels | Hyperstrate Client |
| --- | --- | --- | --- | --- | --- | --- |
| Visual graph router builder | Partial<sup>1</sup> | Partial<sup>2</sup> | x | x | Partial<sup>3</sup> | ✓ |
| Configure targets, features, and interceptors together | Partial<sup>4</sup> | Partial<sup>5</sup> | x | x | Partial<sup>3</sup> | ✓ |
| Manage provider models and key rotation | Partial<sup>6</sup> | Partial<sup>7</sup> | x | x | Partial<sup>3</sup> | ✓ |
| Test a router and inspect each routing step | Partial<sup>8</sup> | Partial<sup>9</sup> | Partial<sup>10</sup> | Partial<sup>11</sup> | Partial<sup>3</sup> | ✓ |
| Manage teams, API keys, virtual keys, and budgets | ✓ | ✓ | Partial<sup>12</sup> | Partial<sup>13</sup> | Partial<sup>3</sup> | ✓ |
| Prompt editor with versions and restore | Partial<sup>14</sup> | Partial<sup>15</sup> | ✓ | x | Partial<sup>3</sup> | ✓ |
| Eval sets and router regression runs | x | Partial<sup>16</sup> | ✓ | x | Partial<sup>3</sup> | ✓ |
| MCP server management for gateway tools | x | x | x | x | Partial<sup>3</sup> | ✓ |
| Agent-session analytics and replay | x | Partial<sup>17</sup> | ✓ | x | Partial<sup>3</sup> | ✓ |
| UI paired with a self-hosted gateway database | ✓ | Partial<sup>18</sup> | Partial<sup>19</sup> | x | ✓ | ✓ |

Notes:

| Note | Comment |
| --- | --- |
| <sup>1</sup> | LiteLLM dashboards are useful for proxy operations, keys, models, and spend, but router composition is still mostly config-driven. |
| <sup>2</sup> | Portkey and Helicone expose gateway configuration, but the workflow is not primarily a graph builder for self-hosted router pipelines. |
| <sup>3</sup> | Internal admin panels can do anything you build, but every capability here becomes your own design, implementation, maintenance, and security work. |
| <sup>4</sup> | LiteLLM handles models, routing, keys, budgets, and callbacks, but Hyperstrate groups targets, features, and interceptors as explicit router-building blocks. |
| <sup>5</sup> | Managed gateways support routing and guardrails, but the exact shape depends on product mode and plan. |
| <sup>6</sup> | LiteLLM supports model and key management, but key rotation UX and provider operations depend on proxy/database configuration. |
| <sup>7</sup> | Managed products support provider configuration, but credentials may live in the hosted control plane unless you use BYOK or self-hosted options. |
| <sup>8</sup> | LiteLLM can log proxy behavior, but step-by-step route explanation depends on callbacks and observability setup. |
| <sup>9</sup> | Managed gateways can explain request behavior well, but traces usually live in their hosted product. |
| <sup>10</sup> | Langfuse and LangSmith trace application runs; they do not own the gateway router unless you wire that data in. |
| <sup>11</sup> | OpenRouter shows model/provider behavior, but not your internal router pipeline or team policy decisions. |
| <sup>12</sup> | Langfuse and LangSmith have workspace/project controls, but not gateway-native virtual keys and spend enforcement by default. |
| <sup>13</sup> | OpenRouter has account/key controls, but not the same as tenant teams, internal virtual keys, and per-router budgets. |
| <sup>14</sup> | LiteLLM can integrate with prompt/observability tooling, but prompt editing is not the dashboard's main job. |
| <sup>15</sup> | Portkey and Helicone include prompt-management or prompt-adjacent workflows depending on product and plan. |
| <sup>16</sup> | Managed products can support eval-like or testing workflows, but router regression runs are not always first-class. |
| <sup>17</sup> | Managed observability products can support sessions or traces, but agent replay depth varies by product. |
| <sup>18</sup> | Helicone has open-source/self-hosting options; Portkey's common workflow is hosted or managed. Deployment model depends on product tier and edition. |
| <sup>19</sup> | Langfuse can be self-hosted; LangSmith deployment depends on plan. They are observability/eval systems, not the gateway database by default. |

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
