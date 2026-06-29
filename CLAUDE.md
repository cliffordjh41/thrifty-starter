# thrifty-starter

A starter app built on `thrifty-ui`. This file orients an agent working in a
clone of this template. Read `.claude/rules/authoring-panels.md` before
building or editing any panel — it is the chrome contract.

## Stack

- React 19 + Vite + TypeScript strict + Tailwind v4
- `thrifty-ui` from npm (not a workspace link)
- `react-router` v7 (browser mode)

## Layout

- `/` — Landing (`src/routes/Landing.tsx`): name + "enter" into the shell.
- `/home` — wrapped by `Layout` (`src/routes/Layout.tsx`), the three-column
  shell: left nav, center body (`<Outlet />`), right `news | assistant` column.
  Three nav routes render into the center:
  - `home` (`Home.tsx`) — intro; a plain body.
  - `studio` (`Studio.tsx`) — the theming picker (ColorPanel / StylePanel /
    TypographyPanel / EffectsPanel). No ColumnToolBar here.
  - `columns` (`Columns.tsx`) — SlidableColumns + ColumnToolBar over a
    zoomable canvas. The only route with the toolbar.

## Rules

- Style with the kit's CSS-variable / Tailwind tokens (`bg-background`,
  `text-foreground`, `border-line`, `text-mute-fg`, `bg-mute`, …). Never
  hardcode hex; the theme drives the tokens.
- Import from the package root (`thrifty-ui`) or its subpath exports; do not
  deep-import the kit's `src/` internals.
- Keep the `@source "../node_modules/thrifty-ui"` line in `src/index.css` — it
  is what makes Tailwind generate the kit's utility classes.
- Theme state is in `src/theme-context.tsx`; read/write it via `useTheme()`.
- Optional working flow: keep `handoff.md` (where things stand) and `journal.md`
  (decisions, newest-first) current. See `.claude/rules/working-with-claude.md`.

## Adding a route

1. Add the component at `src/routes/<Name>.tsx`.
2. Add an entry to the `ROUTES` const in `src/routes/Layout.tsx` (drives the
   nav + the active-route label).
3. Register the `<Route>` under the `Layout` parent in `src/main.tsx`.

## Adding a panel

Use the `panel-from-template` skill. A panel is a presentational component
configured by `panelData`, wiring any header/footer through `usePanelChrome`,
styled from CSS variables. Mount it in a route, a column, a sheet, or a Popup.
