# Authoring panels & surfaces for thrifty-ui

Agent rules for building UI with `thrifty-ui`. Drop this `.claude/` directory
into a project that consumes the kit (or work in the kit's repo) and Claude
Code will scaffold against the kit's contracts correctly. Read this before
writing or editing a panel.

## The chrome contract (the core idea)

`usePanelChrome` is what makes a panel render correctly in any host (a
slidable column, a bottom sheet, a dialog, a drawer) **without the panel
knowing which host it's in**. Honor it:

- A panel declares its header/footer as **content only** — no slot border, no
  fixed height. The hook wraps it.
- The host passes `onHeader` / `onFooter` setters when it has slots; the hook
  **hoists** the panel's chrome into them. With no callback, the hook renders
  the chrome **inline** in a matching bordered slot, so the panel is
  self-contained in a bare body.
- **Never** branch on `useIsMobile`, write media queries, or fork layout
  *inside* a panel for desktop vs mobile. Portability comes from the primitive,
  not from per-host code. If you're reaching for `isMobile` in a panel, stop —
  the host handles it.
- Pass **memoized** chrome nodes (`useMemo` with real deps) so the hoist effect
  only re-pushes on real changes; hosts pass stable setters so it can't loop.

## What a panel is

- A **presentational React component** configured by a typed `panelData` prop
  (its config shape) plus an **optional** `theme`. Panels render from CSS
  variables, so `theme` is optional; they report changes via callbacks
  (`onData`, `onFooter`, etc.).
- **No `role` / consumer / provider / dashboard concept.** A panel is just a
  component. Don't invent a registry or a context provider for panel state.

## Public API — import from the package, not internals

- Import from the package root: `import { usePanelChrome, SlidableColumn } from "thrifty-ui"`.
- Subpath entry points exist: `thrifty-ui/panels/*`, `thrifty-ui/hooks/*`,
  `thrifty-ui/types/*`, `thrifty-ui/styles.css`.
- **The public API is the `package.json` `exports` paths — do not deep-import
  `src/` internals** that aren't exported. If something you need isn't
  exported, treat that as the boundary, not an invitation to reach past it.

## Styling & theming

- Style with the kit's **CSS-variable / Tailwind tokens** — `bg-background`,
  `text-foreground`, `border-line`, `text-mute-fg`, `bg-mute`, etc. **Never
  hardcode hex colors** in a panel; the theme drives the tokens.
- Apply a theme at the top level with `useThemeRoot(theme, mode)` (reaches
  Radix portals) or scope a subtree with `<ThemeScope theme=… mode=…>`.
- This is a **Tailwind v4** kit. New utility classes must be scannable in the
  consumer's Tailwind build (the kit ships source for exactly this reason).

## Accessibility & composition

- Components wrap Radix; **accessibility is inherited** when used correctly —
  don't reimplement what Radix gives, and don't strip its roles/labels.
- Mobile sheets that must stay non-modal (so a bottom bar stays live) use
  `onFocusOutside`/`onPointerDownOutside` guards — mirror an existing sheet
  rather than inventing the pattern.
- **Rule of three**: don't extract an abstraction until the same pattern
  appears in three concrete places. Prefer boring, established options.

## When scaffolding a new panel

Use the `panel-from-template` skill. The anatomy: a typed config, the
`usePanelChrome` wiring for any header/footer, CSS-variable styling, and a
public export. Verify accessibility before claiming it works.
