# thrifty-starter

A starter template for [**thrifty-ui**](https://github.com/cliffordjh41/thrifty-ui) — a small Radix + Tailwind v4 React UI foundation built around `usePanelChrome` ("one panel, four hosts").

It gives you a working app, not a blank page: a landing screen and a three-column shell (left nav · center body · right news/assistant column), with three routes that each show off a part of the kit. The Claude Code authoring stack is wired in, so you can extend it by asking the agent to scaffold new panels.

## Quickstart

```bash
# clone (or use this template on GitHub), then:
npm install
npm run dev
```

Open the dev server, click **enter**, and you're in.

> Requires Node 18+. React 19 and Tailwind v4 come pre-wired.

## What's inside

```
src/
  main.tsx          Router: / (landing) and /home shell with three routes
  theme-context.tsx App-wide theme state, applied to :root via useThemeRoot
  index.css         Tailwind entry + the thrifty-ui @source line (see below)
  routes/
    Landing.tsx     Single-screen entry
    Layout.tsx      The three-column shell (nav · body · news/assistant)
    Home.tsx        Intro panel — a plain body, no hoisted chrome
    Studio.tsx      Live theming picker (color / style / type / effects)
    Columns.tsx     Slidable columns + toolbar over a zoomable canvas
  panels/
    FeedPanel.tsx   Read-only feed — the simplest panel (body only)
    AIChatPanel.tsx Chat — its input row hoists into the host footer
.claude/            The Claude Code authoring stack (rules + a skill)
```

### Three host variations, on purpose

The kit's headline idea is that one panel renders correctly in any host. This template shows the range:

- **Body only** — the studio theming panels and the feed render as plain bodies.
- **Hoisted header/footer** — the chat panel's input row hoists into the right column's footer slot via `usePanelChrome`. Mount the same panel in a bare host and that footer renders inline instead.
- **Dialog host** — the **About** dialog (nav → about) is a panel rendered in a `Popup`.

## The one wiring detail that matters

thrifty-ui ships as **source**, so your Tailwind build compiles it. That means Tailwind has to *scan* the package, or its utility classes never get generated and panels render unstyled. This template already does it in `src/index.css`:

```css
@import "tailwindcss";
@source "../node_modules/thrifty-ui";
@import "thrifty-ui/styles.css";
```

Keep those three lines and you're set.

## Theming

Theme state lives in `src/theme-context.tsx` and is applied with `useThemeRoot`, which writes CSS variables to `:root` (reaching Radix portals — sheets, dialogs, popovers — that a scoped `ThemeScope` would miss). The **studio** route edits that theme live; everything re-colors because every component styles from the tokens.

## Build with Claude Code

This template ships a `.claude/` stack: rules that teach the agent the kit's contracts, plus a `panel-from-template` skill. With Claude Code, try:

> Add a "tasks" panel and mount it in the right column as a third tab.

The agent scaffolds against `usePanelChrome` so the new panel is host-agnostic from the start. If you don't use Claude Code, the `.claude/` directory is inert and harmless.

## License

MIT
