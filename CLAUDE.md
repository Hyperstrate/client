# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # dev server on :8080
npm run build         # production build
npm run type-check    # vue-tsc type check (no emit)
npm run lint          # ESLint
npm run format        # Prettier (src/ only)
npm run test:unit     # Vitest unit tests
npm run test:unit -- --reporter=verbose  # with per-test output
npx vitest run src/features/ui/badge/Badge.spec.ts  # single spec file
npm run test:e2e:dev  # Cypress e2e against dev server (opens Cypress UI)
npm run codegen       # regenerate API client from ../server/docs/swagger.json
npm run story:dev     # Histoire component stories dev server
```

## Component structure

**Keep every `.vue` file under 400 lines.** If a file is growing beyond this, extract sub-components, mixins, or composable helpers — do not let it grow past the limit.

All components use the class-based `vue-facing-decorator` API with Pug templates. Standard shape:

```vue
<template lang="pug">
div ...
</template>

<script lang="ts">
import { Component, Watch } from 'vue-facing-decorator'
import { Mixins } from '@/util/mixin'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { HyperstrateApi, SomeResponse, PaginatedMeta } from '@/__generated__/hyperstrate-api'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { AsyncData } from '@/util/async-data.decorator'
import { Size, Variant } from '@/features/ui/clickables/model'

type Item = SomeResponse  // always alias long generated type names at the top

@Component
export default class MyComponent extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  // Expose enums to the template via public getters (never reference them directly in the template)
  public Variant = Variant
  public Size = Size

  // Data properties
  public items: Item[] = []
  public meta?: PaginatedMeta
  protected pageSize = 10  // required by PaginationMixin

  // Override PaginationMixin's total getter
  protected get total(): number { return this.meta?.total ?? 0 }

  // API client is always a private getter
  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('page')
  protected async onPageChange(): Promise<void> {
    await this.asyncData()
  }

  // async asyncData() method is a global mixin that is injected into the created lifecycle hook to fetch data, no need to use mounted
  @AsyncData()
  public async asyncData(): Promise<AsyncData<MyComponent>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.someEndpointGet({ page: this.page, perPage: this.perPage })
      return { items: data.items, meta: data.meta }
    } finally {
      this.setLoading(false)
    }
  }

  public onPerPageChange(value: number): void {
    this.pageSize = value
    this.page = 1
    void this.asyncData()
  }
}
</script>
```

### `@AsyncData()` decorator

`@AsyncData()` (from `@/util/async-data.decorator`) wraps the method so the returned object is automatically assigned back to `this.$data`. Every key in the returned object must already exist as a declared class property (the decorator does `this.$data[key] = value`). Return only the keys that need updating — don't return anything you didn't declare as a `public` property.

### Component props

Props use typed decorator helpers from `@/util/prop-decorators` — never use raw `@Prop` from `vue-facing-decorator` directly. All prop properties must be `readonly`:

| Decorator | Signature | When to use |
|-----------|-----------|-------------|
| `@RequiredProp()` | any type | required prop with no primitive coercion |
| `@StringProp(true)` | `string` | required string |
| `@StringProp('default')` | `string` | optional string with a default |
| `@StringProp()` | `string \| undefined` | optional string, no default |
| `@BooleanProp()` | `boolean` | boolean, defaults to `false`; pass `true` to default to `true` |
| `@NumberProp(true)` | `number` | required number |
| `@NumberProp(0)` | `number` | optional number with default `0` |
| `@NumberProp(true, 0, 100)` | `number` | required number clamped to 0–100 |
| `@IntegerProp(true)` | `number` | required integer |
| `@ArrayProp(true)` | `unknown[]` | required array |
| `@ArrayProp(() => [])` | `unknown[]` | optional array defaulting to `[]` |
| `@ObjectProp(true)` | object | required object |
| `@ObjectProp(() => ({ ... }))` | object | optional object with a factory default |
| `@FunctionProp(true)` | function | required callback |
| `@EnumProp('a', 'a', 'b', 'c')` | `string` | optional enum string, default `'a'` |
| `@OptionalProp()` | any type | optional, defaults to `undefined` |

```ts
import { Component, Vue } from 'vue-facing-decorator'
import {
  RequiredProp, StringProp, BooleanProp, NumberProp, ObjectProp, ArrayProp,
} from '@/util/prop-decorators'

type Item = SomeGeneratedResponse

@Component
export default class MyComponent extends Vue {
  @RequiredProp()
  public readonly item!: Item

  @StringProp(true)
  public readonly label!: string

  @StringProp('default text')
  public readonly subtitle!: string

  @BooleanProp()
  public readonly disabled!: boolean

  @NumberProp(true, 0)
  public readonly count!: number

  @ArrayProp(() => [])
  public readonly tags!: string[]
}
```

**Rules:**
- **Each decorator must be on its own line; the property declaration goes on the next line. Never put a decorator and a declaration on the same line, and never stack multiple decorators on the same line.**

  ```ts
  // ✗ — decorators and declaration on one line
  @IsOptional() @IsNumberString() maxRetries?: string

  // ✓ — one decorator per line, declaration on its own line
  @IsOptional()
  @IsNumberString()
  maxRetries?: string
  ```
- Always mark prop properties `readonly` — mutations must go through `$emit`.
- Use `!` (definite assignment assertion) for required props; optional props with no default will be `T | undefined`.
- **Never use `w-[Xpx]` or `max-w-[Xpx]` custom pixel widths inside modal slot content.** Modal width is controlled by the `ui-modal` component itself (`Size.SM` → `max-w-lg`, `Size.MD` → `max-w-4xl`). Content inside a modal should use `w-full` or let the modal constrain it.
- For object/array defaults, always pass a factory function (`() => ({})`, `() => []`) — never a literal, to avoid shared state.
- Use `@RequiredProp()` for domain object types (generated API responses, domain entities); the type is inferred from the class property declaration.

### Template refs

Access a template ref via the `@Ref` decorator (from `vue-facing-decorator`). The property name **must be suffixed with `Ref`** — the decorator strips that suffix to match the `ref="..."` attribute in the template:

```ts
import { Component, Ref } from 'vue-facing-decorator'

@Component
export default class MyComponent extends Vue {
  @Ref
  public readonly inputRef!: HTMLInputElement  // matches ref="input" in the template

  @Ref
  public readonly modalRef!: MyModal  // matches ref="modal"
}
```

```pug
input(ref="input" type="text")
MyModal(ref="modal")
```

### Component emits

  
Every component that emits events must declare a typed `Emits` type and pass it to `@Component`. Make sure that the Emits type also has `(e: string): void` value, This enables template type-checking for parent components that listen to those events:

```ts
import { Component } from 'vue-facing-decorator'

type MyComponentEmits = {
  confirm: [id: string]
  cancel: []
  (e: string): void
}

@Component<MyComponent>({ emits: ['confirm', 'cancel'] })
export default class MyComponent extends Vue {
  declare public $emit: MyComponentEmits

  public onConfirm(id: string): void {
    this.$emit('confirm', id)
  }

  public onCancel(): void {
    this.$emit('cancel')
  }
}
```

Declare the `Emits` type at the top of the `<script>` block alongside any type aliases. Every key in `Emits` must appear in the `emits` array inside `@Component`.

### Pagination

Any paginated list uses three things together:

1. **`PaginationMixin`** — provides `page`, `perPage`, `pages`. The component must declare `protected pageSize` and override `protected get total()` to return the total from `meta`.
2. **`meta`** property — declared as `HyperstrateServerInternalSharedPaginationPaginatedMeta | undefined`, populated from `asyncData`.
3. **`ui-pagination`** in the template:

```pug
ui-pagination(v-model="page" :pages="pages" :per-page="perPage" :total="total" @update:per-page="onPerPageChange")
```

Pass `page` and `perPage` as query params to the API call. React to page changes with a `@Watch('page')` that calls `asyncData()` again.

### Enums in templates

Pug templates cannot reference imported TypeScript values directly. Expose every enum or constant needed in the template via a `public get` returning the module-level value:

```ts
public Variant = Variant
public Size = Size
public readonly HyperstrateServerInternalModulesRouterDomainRouterStatus = HyperstrateServerInternalModulesRouterDomainRouterStatus
```

Use `readonly` for enum references that never change and `get` for re-exports of existing module constants.

### Vuex store

Access store state in components with `@RootState` (imported from `@/features/core/store`). It is a property decorator, not a method decorator:

```ts
import { RootState } from '@/features/core/store'
import type { IdToken } from '@/features/core/store/id-token'

@RootState
public readonly idToken?: IdToken
```

The store itself does not use `vuex-facing-decorator` module classes — it is a plain Vuex `Store<State>` defined in `src/features/core/store/create-store.ts` with typed mutation/action string constants.

### Mixins

Always use the project's typed `Mixins()` helper (`@/util/mixin`) instead of `vue-facing-decorator`'s `mixins()` directly — it preserves full TypeScript types across the mixin chain:

```ts
import { Mixins } from '@/util/mixin'
export default class MyComp extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) { ... }
```

Available mixins:
- `ApiClientsMixin` — adds `apiClientFactory<T>(name)` to get a typed API client
- `LoadingMixin` — adds `loading: boolean` and `setLoading(value)`
- `PaginationMixin` — adds `page`, `perPage`, `pages`; requires component to declare `pageSize` and override `total`
- `ContainerMixin` — adds `container(token)` for DI lookup (base of ApiClientsMixin)
- `ModelsMixin` — adds `modelBrands`, `modelBrandIcon()`, `modelBrandIconName()`

### Null vs undefined

Never use `null` for optional class properties. Use `undefined` exclusively:

```ts
// Wrong
public error: string | null = null

// Correct
public error?: string = undefined
```

For `let` variables that may be absent, use `| undefined` in the type:

```ts
let controller: AbortController | undefined = undefined
```

Reset optional class properties by assigning `undefined`, not `null`. Ternary expressions that previously yielded `null` should yield `undefined` instead.

### Enum option arrays (model.ts files)

Enum values from the generated API client are mapped to human-readable labels in a feature's `model.ts` using the `Option<T>` type from `@/features/ui/inputs/model`:

```ts
import { SomeGeneratedEnum } from '@/__generated__/hyperstrate-api'
import { type Option } from '@/features/ui/inputs/model'

export const MY_ENUM_OPTIONS: Option<SomeGeneratedEnum>[] = [
  { value: SomeGeneratedEnum.ValueFoo, label: 'Foo' },
  { value: SomeGeneratedEnum.ValueBar, label: 'Bar' },
]
```

Import these arrays in components that need label lookups (e.g., `ROUTING_STRATEGY_OPTIONS.find(o => o.value === strategy)?.label`). Do not inline label maps inside components.

### Global vs local components

**Use `.global.vue` only for components that must be reachable by other features without an explicit import** — page-level modals, shared controls, and any component used as a string name in templates. The `.global.vue` suffix opts the file into auto-registration, which has a cost: the component name must be globally unique, the file is lazily loaded as an async chunk, and it cannot be tree-shaken.

**Use plain `.vue` for components that are private to one parent** — sub-panels, row renderers, typed card bodies, and any component used only via `component(:is=...)` with an imported reference. Import them directly and pass the class/object to `:is`:

```ts
import FeatureChipRetry from './feature-chips/FeatureChipRetry.vue'
import FeatureChipBudget from './feature-chips/FeatureChipBudget.vue'

const CHIP_MAP = {
  [FT.FeatureRetry]: FeatureChipRetry,
  [FT.FeatureBudget]: FeatureChipBudget,
}

public chipComponent(feature: RouterFeature) {
  return CHIP_MAP[feature.featureType!] ?? FeatureChipDefault
}
```

```pug
component(:is="chipComponent(feature)" :feature="feature")
  template(#drag-handle)
    ui-icon(icon="drag-handle")
  template(#actions)
    ui-dropdown(...)
```

Vue 3 resolves a component object passed to `:is` without registration — no `@Component({ components })` entry is needed when using this pattern.

When a `.global.vue` file imports non-global `.vue` components that are used **by name** in the template (e.g. `app-api-keys-tab`), register them in `@Component({ components: { ... } })`:

```ts
@Component({ components: { AppApiKeysTab, AppVirtualKeysTab } })
export default class AppTabBarControl extends Vue { ... }
```

### Reusing logic — prefer `ui` and `domain-ui` components

Before writing inline markup or logic for a common UI pattern, check whether a component already exists in `src/features/ui/` or `src/features/domain-ui/`. Both libraries are globally registered, so they are available in every template without importing.

Before using any `ui-*` or `domain-ui-*` component, check its story file (`src/features/ui/<name>/stories/*.story.vue`) in Histoire (`npm run story:dev`) to understand the available props, variants, and slot shapes. Stories are the authoritative usage reference for every design-system component.

**`ui` — generic, reusable primitives** (prefix `ui-`):

| Component | Tag | Use for |
|-----------|-----|---------|
| `Button.global.vue` | `ui-button` | all buttons; accepts `:size`, `:variant`, `:busy`, `:outlined`, `block` |
| `IconButton.global.vue` | `ui-icon-button` | icon-only buttons; accepts `icon`, `:icon-size`, `:size`, `:variant`, `:square` |
| `Clickable.global.vue` | `ui-clickable` | any clickable element with a custom tag (e.g. `tag="button"` or `tag="a"`) |
| `Modal.global.vue` | `ui-modal` | all dialogs/modals; exposes `#trigger` and `#default` slots |
| `Form.global.vue` | `ui-form` | wraps a form and provides validation context |
| `FormField.global.vue` | `ui-form-field` | labelled input row inside a `ui-form` |
| `InputText.global.vue` | `ui-input-text` | single-line text input |
| `InputTextarea.global.vue` | `ui-input-textarea` | multi-line textarea |
| `InputSelect.global.vue` | `ui-input-select` | dropdown select; accepts `Option<T>[]` |
| `InputCombobox.global.vue` | `ui-input-combobox` | searchable combobox; accepts `Option<T>[]` |
| `InputCheckbox.global.vue` | `ui-input-checkbox` | checkbox |
| `InputRadio.global.vue` | `ui-input-radio` | radio button group |
| `InputSearch.global.vue` | `ui-input-search` | search field with debounce |
| `InputArrayItem.global.vue` | `ui-input-array-item` | one row in an editable list of strings |
| `InputField.global.vue` | `ui-input-field` | generic field wrapper |
| `Pagination.global.vue` | `ui-pagination` | page controls; use with `PaginationMixin` |
| `TabBar.global.vue` | `ui-tab-bar` | tab strip container (`v-model` for active tab) |
| `TabButton.global.vue` | `ui-tab-button` | individual tab; `:value` must match the active tab model |
| `Table.global.vue` | `ui-table` | data table wrapper |
| `TableThead.global.vue` | `ui-table-thead` | sortable table header |
| `Badge.global.vue` | `ui-badge` | small label pill; accepts `:variant`, `:size`, `:dot` |
| `Pill.global.vue` | `ui-pill` | pill/chip; accepts `:variant` |
| `Status.global.vue` | `ui-status` | boolean status dot; accepts `:value` |
| `Label.global.vue` | `ui-label` | form label |
| `Icon.global.vue` | `ui-icon` | icon by name; accepts `icon`, `size` |
| `Indicator.global.vue` | `ui-indicator` | loading/status indicator |
| `Dropdown.global.vue` | `ui-dropdown` | floating dropdown; exposes `#trigger` and `#content` slots |
| `Tooltip.global.vue` | `ui-tooltip` | hover tooltip |
| `Card.global.vue` | `ui-card` | content card with optional title |
| `Divider.global.vue` | `ui-divider` | horizontal rule |
| `Layout.global.vue` | `ui-layout` | page layout shell; `use="core-default-layout"` applies the sidebar chrome |
| `Stepper.global.vue` | `ui-stepper` | multi-step wizard |
| `OptionPicker.global.vue` | `ui-option-picker` | visual card-style option picker |
| `DraggableList.global.vue` | `ui-draggable-list` | drag-to-reorder list; exposes `#default="{ item }"` and emits `@reorder` |
| `InfiniteScroll.global.vue` | `ui-infinite-scroll` | infinite scroll trigger |
| `CrossFadeTransition.global.vue` | `ui-cross-fade-transition` | Vue transition wrapper |
| `EmptyState.global.vue` | `ui-empty-state` | empty list/section placeholder; accepts `heading` (required) and `subheading` (optional) |

**`domain-ui` — reusable domain-specific components** (prefix `domain-ui-`):

| Component | Tag | Use for |
|-----------|-----|---------|
| `ConfirmDeleteModal.global.vue` | `domain-ui-confirm-delete-modal` | any delete confirmation; accepts `:name`, `:description`, emits `@confirm`; exposes `#trigger="{ open }"` |
| `InputSelectModelDefinition.global.vue` | `domain-ui-input-select-model-definition` | catalog key picker (model definitions) |
| `InputComboboxModel.global.vue` | `domain-ui-input-combobox-model` | registered model combobox |
| `InputComboboxRouter.global.vue` | `domain-ui-input-combobox-router` | router combobox |
| `InputComboboxTeam.global.vue` | `domain-ui-input-combobox-team` | team combobox |
| `PipelineTrace.global.vue` | `domain-ui-pipeline-trace` | pipeline step visualization for inference logs; accepts `:item` (InferenceLog) |
| `SectionCard.global.vue` | `domain-ui-section-card` | navigation card for home/dashboard sections; accepts `to`, `icon`, `title`, `description`, `pill-label`, `:pill-variant`, `color` (`gray`\|`blue`\|`green`\|`indigo`\|`purple`) |

When a new domain-level input, modal or primitive ui component is needed by more than one feature, add it to `domain-ui` rather than duplicating it.

### Page and component hierarchy

The component system is layered, loosely inspired by atomic design: small, focused units compose upward into larger, more opinionated structures. Crucially, **each layer may only depend on layers beneath it** — a building block must never know about the context it is placed in.

```
View (views/)               ← page template  — layout shell; composes Controls into named regions
  └─ Control (components/)  ← organism       — stateful section; fetches data, holds state, wires events
       └─ domain-ui-*       ← domain molecule — domain-aware but reusable; no API calls or store access
            └─ ui-*         ← primitive       — pure presentational; no domain knowledge, no state
```

**Dependency direction (each arrow = "may use"; the reverse is always forbidden):**

```
View  →  Control  →  domain-ui  →  ui
```

**Rules:**

1. **Max Control nesting depth is 2.** A View may contain Controls, and a Control may contain other Controls, but that is the limit — `Control → Control → Control` chains are forbidden. If you need a third layer, the middle Control is doing too much; split its concerns or promote a sub-section to its own Control that the View composes directly.

2. **Views own the page layout, nothing else.** A View must not contain business logic, API calls, or fine-grained conditional rendering. Its two responsibilities are:

   - **Structural skeleton** — the View defines the full page layout: the `ui-layout` wrapper (with the appropriate `use` value for the sidebar chrome), and the top-level grid or flex container that carves the page into named regions (header row, primary content area, optional sidebar, footer bar, etc.). Controls are placed into those regions; they do not define their own surrounding layout.
   - **Control composition** — the View decides which Controls are shown and passes route-level data (IDs from `$route.params`, flags from the store) down as props. It receives mutations from Controls via emitted events and forwards them to the store or router as needed.

   A canonical View shell:

   ```pug
   ui-layout(use="core-default-layout")
     template(#header)
       div(class="flex items-center gap-4")
         h1(class="text-xl font-semibold") Page Title
         div(class="flex-1 flex justify-end")
           ui-button(@click="openCreate") Create
     template(#default)
       div(class="grid grid-cols-[1fr_320px] gap-6")
         PrimaryControl(:id="id" @updated="onUpdated")
         SidebarControl(:id="id")
   ```

   If the View needs more than ~20 lines of template, layout logic has probably leaked into a Control; re-examine the regions.

3. **Controls are feature-local.** A Control must not import a Control from a different feature section. Shared orchestration logic belongs in a mixin or a `domain-ui` component.

4. **Place new components at the lowest sufficient tier.** Before writing any new component, ask: *what is the minimum tier that satisfies this need?* A reusable icon+label pair belongs in `ui-*`; a domain-specific model picker belongs in `domain-ui-*`; only stateful, data-fetching orchestration belongs in a Control. Never write a Control when a stateless component would do, and never write a `domain-ui` component when a generic `ui` primitive would do. If a suitable component already exists in `src/features/ui/` or `src/features/domain-ui/`, use it — growing the design system is always preferred over duplicating markup.

5. **Primitives are stateless and domain-free.** `ui-*` components accept only generic props (strings, numbers, booleans, `Option<T>[]`) and emit standard DOM-like events. They must not import generated API types, access the DI container, or read from Vuex. `domain-ui-*` components may reference domain types and generated response shapes, but follow the same no-API-call, no-store-write rule — they receive data via props and communicate intent via events.

6. **No upward coupling.** `ui-*` components must not import from `domain-ui`, Controls, or Views. `domain-ui-*` components must not import feature Controls or Views. A component that needs to "know" about its parent is a sign it belongs at a higher tier or that its API (props/events) needs to be redesigned.

7. **Expose scoped slots at every extension point — bind data, not decisions.** When a component needs to let callers customise a section of its output, expose a named scoped slot that binds the relevant state, rather than accepting boolean props that switch rendering modes internally. This keeps the component closed over its own logic while remaining open to rendering variations, and is the primary mechanism that lets higher tiers inject domain-specific rendering into domain-free primitives without upward coupling.

   ```pug
   //- ✗ prop-driven branching — primitive encodes caller-specific decisions
   ui-table(:show-status-badge="true" :clickable-rows="true" :has-actions="true")

   //- ✓ scoped slots — primitive owns layout/scroll; caller owns rendering
   ui-table
     template(#row="{ item, index }")
       td {{ item.name }}
       td
         ui-badge(:variant="statusVariant(item.status)") {{ item.status }}
     template(#actions="{ item }")
       domain-ui-confirm-delete-modal(:name="item.name" @confirm="onDelete(item.id)")
         template(#trigger)
           ui-icon-button(icon="trash")
   ```

   Common slot conventions used across the design system:

   | Slot | Bound values | Purpose |
   |------|-------------|---------|
   | `#default="{ item, index }"` | item data | row or card renderer in lists/tables |
   | `#trigger="{ open, close, isOpen }"` | toggle fns | caller-supplied trigger for modals/dropdowns |
   | `#actions="{ item }"` | item data | contextual action bar injected into a row or card |
   | `#empty` | — | empty-state override |
   | `#header` / `#footer` | — | structural layout regions |

   When designing a new component that renders a list, a modal, a dropdown, or any region the caller might want to customise: default to a scoped slot rather than a prop. Bind whatever data the caller would otherwise need to duplicate or re-fetch. A component with three boolean "show X" props is almost always a component that should have had a slot instead.

### Type aliasing for generated types

Always alias long generated type names at the top of the `<script>` block. This is the established convention across the codebase:

```ts
type TeamResponse = HyperstrateServerInternalModulesAuthApplicationTeamResponse
type PaginatedMeta = HyperstrateServerInternalSharedPaginationPaginatedMeta
```

### No type assertions (`as`) in templates or methods

Never use `as` casts in template expressions (Pug bindings, interpolations, event handlers) or in methods/getters visible to the template. Fix the underlying type instead.

The most common cause is a local form or intermediate type that uses `string` where a generated enum is needed:

```ts
// ✗ — scoreMethod typed too loosely; forces an assertion at the call site
type NewCaseForm = { scoreMethod: string }
scoreMethod: (this.newCase.scoreMethod as ScoreMethod) || ScoreMethod.CONTAINS

// ✓ — type the field as the enum from the start; no assertion needed
type NewCaseForm = { scoreMethod: ScoreMethod }
scoreMethod: this.newCase.scoreMethod || ScoreMethod.CONTAINS
```

For `unknown`-typed slot data (e.g. table row accessors), add a typed narrow helper method rather than casting inline:

```ts
// ✗ — assertion inline in accessor
{ accessor: (row: unknown) => (row as LogRow).status }

// ✓ — narrow once in a private method, reuse in all accessors
private asLog(row: unknown): LogRow { return row as LogRow }
{ accessor: (row: unknown) => this.asLog(row).status }
```

### No Unicode symbols as icons

Never use Unicode characters as inline icons in rendered text. Use `ui-icon` instead.

```pug
//- ✗ unicode dot as status indicator
span ● Configured

//- ✓ use ui-icon or rely on the component's own visual treatment
ui-icon(icon="circle" :size="16")
span Configured
```

For `ui-status` labels (`active-label`, `inactive-label`): pass **plain text only** — the pill variant already signals state visually. Never prefix the label string with `●` or `○`.

```ts
//- ✗
active-label="● Configured" inactive-label="○ Not set"
public get apiKeyStatusLabel(): string { return `● ${n} keys in pool` }

//- ✓
active-label="Configured" inactive-label="Not set"
public get apiKeyStatusLabel(): string { return `${n} keys in pool` }
```

For directional indicators (`→`, `←`, `↑`, `↓`) in UI text, use `ui-icon`. Exception: keyboard symbols inside `ui-kbd` (e.g. `↑↓`, `↵`) are acceptable since they represent actual key glyphs.

## Testing

Unit tests and stories live alongside the component they test. Every new `ui-*` component must ship with both:
- `Foo.spec.ts` — Vitest unit tests (next to `Foo.global.vue`)
- `stories/Foo.story.vue` — Histoire story covering each prop variant and slot shape

Utility functions and composables require a `foo.spec.ts` but no story.

### What to test

- **`ui-*` components** — render the root element tag, slot content, each prop variant (classes applied), and any conditional rendering (`v-if`). Do not test internal implementation details or private getters.
- **Utility functions** — cover the happy path, edge cases (empty input, boundary values), and any error branches.
- **No tests for Controls or Views** — stateful components that fetch data or access the store are out of scope for unit tests; they are covered by e2e.

### Test shape

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MyComponent from './MyComponent.global.vue'

describe('MyComponent', () => {
  it('renders slot content', () => {
    const wrapper = mount(MyComponent, { slots: { default: 'Hello' } })
    expect(wrapper.text()).toBe('Hello')
  })

  it('applies classes for each prop variant', () => {
    const wrapper = mount(MyComponent, { props: { variant: 'blue' } })
    expect(wrapper.classes().join(' ')).toContain('text-blue-700')
  })

  it('renders conditional element when prop is true', () => {
    const wrapper = mount(MyComponent, { props: { showIcon: true } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
```

**Rules:**
- Assert on the rendered HTML (classes, tags, text) — not on internal state.
- One behaviour per `it` block.
- Use `wrapper.classes().join(' ')` for class assertions — never `.html()` string matching.
- Tag assertions use `wrapper.element.tagName.toLowerCase()`.

## Layout and spacing

**Use flexbox for small UI compositions; use grid for page/section layouts.**

- `flex` and `flex-col` for aligning inline elements, button groups, label+input pairs, icon+text, and any other small component internals.
- `grid` for multi-column layouts, card grids, and full-section structure.
- Native elements (`button`, `a`, `label`, `input`, etc.) are styled inline via flex on their container — never add margin to them to create surrounding space.

**Hard avoid all Tailwind margin classes (`m-*`, `mt-*`, `mb-*`, `ml-*`, `mr-*`, `mx-*`, `my-*`).** Use `gap` on a flex/grid parent instead:

```pug
//- ✗ margin for spacing
div
  h1(class="mb-2") Title
  p Description

//- ✓ gap on the flex parent
div(class="flex flex-col gap-2")
  h1 Title
  p Description
```

- When siblings need different gaps, wrap the tightly-grouped ones in a nested flex/grid container with its own `gap`.
- For right- or left-aligning a single item inside a flex row, use `flex-1 flex justify-end` on a wrapper div instead of `ml-auto`/`mr-auto`.
- `mx-auto` on a max-width container (e.g. `max-w-screen-lg mx-auto`) is the only accepted margin exception — it is a centering technique, not element spacing.
- Padding classes (`p-*`, `px-*`, `py-*`, `pt-*`, `pb-*`) are fine and unaffected by this rule.

## Typography

**Only use Tailwind's built-in text size utilities — never use arbitrary sizes like `text-[11px]` or `text-[10px]`.**

Use the standard scale: `text-xs` (12px) · `text-sm` (14px) · `text-base` (16px) · `text-lg` (18px) · `text-xl` (20px) · `text-2xl` … When an existing value uses an arbitrary size, replace it with the nearest standard step — almost always `text-xs` for anything sub-12px.

## Architecture

Vue 3 + TypeScript + Vite. Components use Pug templates and the class-based `vue-facing-decorator` API.

### DI container

The app uses a custom DI container (`src/util/container/`) instead of Vue's provide/inject. At startup, `bootstrap.ts` loads every `*.builder.ts` file in `src/features/` via `import.meta.glob`. Each builder receives typed `provide`, `option`, and `configure` tools:

- `provide(Name, factory)` — registers a singleton by typed token (`Name<T>`)
- `option(OptionName, factory)` — contributes one item to a multi-value list (used for routes, apps, API clients)
- `configure(fn)` — runs a side-effect after all providers are built (used to register global components, set up directives)

Typed tokens live in `src/features/core/container/index.ts` (e.g. `ROUTES`, `APPS`, `APP`, `ROUTER`, `STORE`).

### Feature modules

Each feature lives under `src/features/<name>/` and follows this layout:

```
component.ts              lazy loader for Vue components in this feature
container/
  app.builder.ts          registers the feature in the APPS option (sidebar nav entry)
  routes.builder.ts       registers routes in the ROUTES option
  global-components.builder.ts  registers *.global.vue as async global components
views/                    page-level components
components/               sub-components used only within this feature
```

Features: `core`, `ui`, `app-auth`, `app-model`, `app-router`, `app-chat`, `app-playground`, `app-analytics`, `app-home`.

### Global component registration

Any `*.global.vue` file is auto-registered as a global Vue component. The component name is derived by kebab-casing the filename (minus `.global.vue`) and prepending the feature prefix:

- `core` feature: prefix `core-`, eagerly loaded
- Other features: prefix `app-<feature>-`, lazily loaded (async components)

Example: `app-router/components/create-router-modal/CreateRouterModal.global.vue` → `<app-router-create-router-modal>`

### API client

`src/__generated__/hyperstrate-api/` is generated from `../server/docs/swagger.json` using the OpenAPI Generator (`typescript-axios`). After changing server DTOs or routes: run `make swagger` in the server repo, then `npm run codegen` here. Never edit generated files by hand.

### Vuex store

Vuex store lives in `src/features/core/store/`. Modules use `vuex-facing-decorator` for class-based module definitions. The store is provided via the DI container under the `STORE` token.

### Vue Router

Routes are collected from all `routes.builder.ts` files via the `ROUTES` option. Route `meta.app` ties a route to a named app for sidebar highlighting. Route `meta.key` is a function that returns a stable string key used for component caching (`<keep-alive>`).

### Environment

```
VITE_API_BASE_URL    Backend base URL (defaults to empty string = same origin)
```

Copy `.env.dist` to `.env.local` to override locally.

## Form system (`ui-form` / `ui-form-field`)

**Hard rule: every input inside a `ui-form` must be bound through a `ui-form-field`. Never use bare `v-model` on `ui-input-*` or `ui-input-key-value` (or any other input component) alongside a form — if the field is part of the form's data, it must go through `ui-form-field path="..."`.** There are no exceptions for "unvalidated" or "optional" fields; put them in the form class with `@IsOptional()` instead of side-stepping the form.

All modals and forms use `ui-form` + `ui-form-field`. The form context is provided by `ui-form` and injected automatically by every `ui-form-field` descendant — this works across component boundaries, so sub-components rendered inside a `ui-form` can contain `ui-form-field`s without any wiring.

### Core props

### Slot forwarding in `ui-form-field`

`ui-form-field` forwards two families of slots:

- **Slots _not_ prefixed with `input`** (e.g. `#label`) are forwarded to the outer `ui-input-field` wrapper. Use `#label` to replace the default label row — handy for adding an inline action button next to the label:

  ```pug
  ui-form-field(ref="fieldsFormField" input="ui-input-key-value" path="fields" ...)
    template(#label)
      div(class="flex items-center justify-between mb-1")
        ui-label Input fields
        ui-button(type="button" :size="Size.SM" :variant="Variant.Gray" @click="addField")
          ui-icon(icon="plus" :size="11")
          | Field
  ```

- **Slots prefixed with `input`** (camelCase, e.g. `#inputActions`) are stripped of the prefix and forwarded to the inner input component (e.g. `#actions` on `ui-input-key-value`). The slot props come from the inner component as-is:

  ```pug
  template(#inputActions="slotProps")
    ui-icon-button(icon="close" :variant="Variant.Gray" :size="Size.SM" :icon-size="12" @click="slotProps['on-remove']()")
  ```

To call a method on the inner input (e.g. `addPair()` on `ui-input-key-value`), hold a `@Ref()` to the `ui-form-field` and access `$refs.input`:

```ts
@Ref()
public readonly fieldsFormField!: unknown

public addField(): void {
  ;(this.fieldsFormField as any)?.$refs?.input?.addPair?.()
}
```

### Core props
- **`input`** — string name of the input component rendered inside the field (e.g. `"ui-input-text"`, `"domain-ui-input-combobox-model"`).
- **`transformer`** — lodash dot-path applied to the resolved value before writing to `formData`. Use `transformer="value.id"` on comboboxes to reduce `Option<T>` to an ID string. Use `transformer="value"` on selects to unwrap `Option<string>` to a plain string.
- **`default-value`** — fallback when the field is empty.
- **`#inputLabel` slot** — forwarded as `#label` to the underlying input (e.g. `ui-input-checkbox`). Lets you put rich card content inside a checkbox label.
- **`:field-props="{ class: 'contents' }"`** — makes `ui-input-field`'s wrapper `display: contents`, removing it from layout when the surrounding card provides all visual structure.

### Rules for modals

1. **All data binding via `ui-form-field` paths** — no `v-model` on raw inputs, no custom data-sync events.
2. **Validation in the FormData class** via `class-validator` decorators (`@IsNotEmpty()`, `@IsNumberString()`, `@IsJSON()`, `@ValidateNested({ each: true })`). Fields that are conditionally visible (inside `v-if`) return `null` when empty, so `@IsOptional()` skips validators for them — handle their required check in `isFormReadyFor(formData)` instead.
3. **No array state in the parent modal** — components that own a repeatable list (`InterceptorABTest`, `InterceptorTeamBudget`, `FeatureCostAwareRouting`) manage their own ID array and add/remove methods internally. The modal does not track array lengths or emit add/remove events.
4. **No manual `busy` flag** — `ui-form`'s `:action` async function handles loading; `busy` comes from the form slot.
5. **All config construction in `doSubmit(formData)`** — read from `formData`, not component state. Component state is limited to structural control (e.g. the active feature/interceptor type).
6. **Submit guard** — `!validated || !isFormReadyFor(formData) || busy`.

### Transformer cheat-sheet

| Input component | Transformer | `formData` type |
|---|---|---|
| `domain-ui-input-combobox-model` | `transformer="value.id"` | `string` |
| `domain-ui-input-combobox-embedding-model` | `transformer="value.id"` | `string` |
| `domain-ui-input-combobox-team` | `transformer="value.id"` | `string` |
| `ui-input-select` | `transformer="value"` | `string` |

### Array item sub-components

Pass the computed path string as a `path` prop: `:path="'abVariants[' + idx + ']'"`. Inside the item component, prefix every `ui-form-field` with `:path="path + '.fieldName'"`.
