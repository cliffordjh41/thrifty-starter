import type { PanelProps } from "thrifty-ui"

// A read-only "news" feed panel. Presentational: it renders whatever entries
// it's handed via panelData (falling back to the sample set below), sorted
// newest-first. This is the simplest panel shape — a body with no hoisted
// header/footer — so it drops into any host (here, the right column) as-is.

export interface FeedEntry {
  id: string
  date: string // "YYYY-MM-DD"
  time?: string // optional "HH:MM" — rendered only when set
  title: string
  body: string
  tag?: string
}

export interface FeedConfig {
  entries: FeedEntry[]
}

const defaultConfig: FeedConfig = {
  entries: [
    {
      id: "sample-3",
      date: "2026-01-03",
      time: "10:00",
      title: "Edit a panel with Claude Code",
      body: "Run the panel-from-template skill (see .claude/) to scaffold a new panel against the usePanelChrome contract, then drop it into a route.",
      tag: "guide",
    },
    {
      id: "sample-2",
      date: "2026-01-02",
      title: "Theme it live",
      body: "Open the studio route and edit colors, type, and effects. Changes write to :root and re-color the whole app — including this panel.",
      tag: "guide",
    },
    {
      id: "sample-1",
      date: "2026-01-01",
      time: "09:00",
      title: "Welcome",
      body: "This is the thrifty-ui starter. A landing, a three-column shell, a theming studio, and a slidable-column demo — yours to extend.",
      tag: "start",
    },
  ],
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function formatStamp(date: string, time?: string): string {
  const [y, m, d] = date.split("-").map(Number)
  if (!y || !m || !d) return date
  const base = `${MONTHS[m - 1]} ${d}, ${y}`
  return time ? `${base} · ${time}` : base
}

// Reverse chronological. Date then time; entries without a time sort as if at
// 00:00 of their day.
function sortEntries(entries: FeedEntry[]): FeedEntry[] {
  return entries
    .slice()
    .sort((a, b) => `${b.date} ${b.time ?? ""}`.localeCompare(`${a.date} ${a.time ?? ""}`))
}

export function FeedPanel({ panelData }: PanelProps) {
  const config = (panelData as unknown as FeedConfig | undefined) ?? defaultConfig
  const entries = sortEntries(config.entries ?? defaultConfig.entries)

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div tabIndex={0} className="flex-1 min-h-0 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-[10px] text-mute-fg uppercase tracking-(--theme-letter-spacing)">
              No updates yet
            </span>
          </div>
        ) : (
          entries.map((e) => (
            <article
              key={e.id}
              className="border-b border-line/40 last:border-0 px-4 py-3 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-(--theme-letter-spacing) text-mute-fg">
                  {formatStamp(e.date, e.time)}
                </span>
                {e.tag && (
                  <span className="text-[9px] uppercase tracking-(--theme-letter-spacing) px-1.5 py-0.5 rounded border border-line text-mute-fg">
                    {e.tag}
                  </span>
                )}
              </div>
              <h3 className="text-xs font-(--theme-font-weight) text-foreground leading-snug">
                {e.title}
              </h3>
              <p className="text-[11px] text-mute-fg leading-relaxed whitespace-pre-line">
                {e.body}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
