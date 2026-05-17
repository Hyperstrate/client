# Contributing

Thanks for helping improve Hyperstrate.

## Development

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-change`.
3. Make focused changes with tests where behavior changes.
4. Run the relevant checks:

```bash
npm run type-check
npm run lint
npm run test:unit -- --run
npm run build-only
```

5. Open a pull request and describe the behavior change, tests, and any API/client-generation impact.

## Pull Request Guidelines

- Keep pull requests focused on one topic.
- Include tests for bug fixes and behavior changes.
- Regenerate the API client with `npm run codegen` after server OpenAPI changes.
- Do not commit `.env`, build outputs, TypeScript build info, API keys, Supabase secrets, or provider credentials.
- Open an issue before large UI, routing, or design-system changes so maintainers can discuss the direction.

## Code Style

Follow the existing Vue 3, TypeScript, class-component, Pug, and Tailwind patterns in `src/features/`.
