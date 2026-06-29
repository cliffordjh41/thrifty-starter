---
name: panel-from-template
description: Scaffold a new thrifty-ui panel against the kit's anatomy — a typed config, usePanelChrome wiring for any header/footer, CSS-variable styling, and a public export. Use when adding a panel to a project that consumes thrifty-ui (or to the kit itself).
---

# panel-from-template

Scaffold a panel that obeys the kit's chrome contract so it renders correctly
in any host (column / sheet / dialog / drawer) with no per-host branching.
Read `.claude/rules/authoring-panels.md` first.

## Steps

1. **Ask (or infer) the panel's shape**: its name (e.g. `WeatherPanel`), the
   data it renders (becomes the typed config), and whether it needs a header,
   a footer, both, or neither.
2. **Write the config type** — the shape of `panelData` for this panel.
3. **Build the component** from the template below: declare header/footer as
   *content only*, wire them through `usePanelChrome`, render the body, and
   style everything with CSS-variable tokens (no hardcoded colors).
4. **Export it** from the project's public surface (or the kit's `src/index.ts`
   if authoring the kit) — never leave it reachable only by deep import.
5. **Verify**: typecheck, then check keyboard nav + roles (axe-core, tab
   order, screen-reader announcement). Don't claim it works until it's been
   run.

## Template

```tsx
import { useMemo } from "react"
import { usePanelChrome } from "thrifty-ui"
import type { PanelProps } from "thrifty-ui"

export interface ExampleConfig {
  title: string
  items: string[]
}

export function ExamplePanel({ panelData, onHeader, onFooter }: PanelProps) {
  const config = (panelData as unknown as ExampleConfig | undefined) ?? {
    title: "Example",
    items: [],
  }

  // Header/footer are CONTENT ONLY — no slot border/height. Memoize so the
  // hoist effect only re-pushes on real changes.
  const header = useMemo(
    () => (
      <span className="text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg">
        {config.title}
      </span>
    ),
    [config.title]
  )

  const { header: headerEl, footer: footerEl } = usePanelChrome({
    onHeader,
    header,
    // onFooter, footer  // add if this panel has a footer
  })

  return (
    <div className="flex h-full w-full flex-col overflow-hidden text-foreground">
      {headerEl}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {config.items.map((item) => (
          <div
            key={item}
            className="rounded border border-line px-2 py-1.5 text-[11px] text-foreground/80"
          >
            {item}
          </div>
        ))}
      </div>
      {footerEl}
    </div>
  )
}
```

## Rules that bind this skill

- **No `isMobile` / media queries inside the panel.** The host adapts; the
  panel ships one code path.
- **CSS-variable tokens only** (`bg-background`, `text-foreground`,
  `border-line`, `text-mute-fg`, …) — never hardcoded hex.
- **Public export**, not a deep import of `src/` internals.
- Pass **memoized** chrome nodes; let the host own the slots.
