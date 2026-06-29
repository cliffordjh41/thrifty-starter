import { Link } from "react-router"
import { Palette, Columns3, Bot, Terminal } from "lucide-react"

// Intro panel — the default center-body view. Plain content in the host's
// body; the shell (Layout) owns the surrounding chrome. Orients a new user
// to what the starter ships and where to look next.
export function Home() {
  return (
    <div className="h-full overflow-y-auto px-6 py-8 md:px-10 md:py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-3">
          <h1 className="text-xl font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing)">
            thrifty-ui starter
          </h1>
          <p className="text-sm text-mute-fg leading-relaxed">
            A three-column app shell built on{" "}
            <a
              href="https://github.com/cliffordjh41/thrifty-ui"
              className="text-foreground underline underline-offset-2 hover:text-foreground/80"
            >
              thrifty-ui
            </a>
            : a left nav, a center body, and a right column that slides between a
            news feed and a chat panel. Everything you see styles from theme
            tokens, so it re-colors live when you edit the theme.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/studio"
            className="group rounded-lg border border-line p-4 hover:bg-mute/40 transition-colors"
          >
            <Palette className="size-5 text-mute-fg group-hover:text-foreground transition-colors mb-2" />
            <h2 className="text-xs font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing)">
              studio
            </h2>
            <p className="text-[11px] text-mute-fg mt-1 leading-relaxed">
              The design studio — live theming (color, type, effects) with
              copy-to-CSS, over a panel preview.
            </p>
          </Link>

          <Link
            to="/columns"
            className="group rounded-lg border border-line p-4 hover:bg-mute/40 transition-colors"
          >
            <Columns3 className="size-5 text-mute-fg group-hover:text-foreground transition-colors mb-2" />
            <h2 className="text-xs font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing)">
              columns
            </h2>
            <p className="text-[11px] text-mute-fg mt-1 leading-relaxed">
              Slidable tool columns over a zoomable canvas, with a bottom
              toolbar that hides them off-edge.
            </p>
          </Link>
        </div>

        <div className="space-y-3 border-t border-line pt-6">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-mute-fg" />
            <h2 className="text-xs font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing)">
              the chat panel
            </h2>
          </div>
          <p className="text-[11px] text-mute-fg leading-relaxed">
            Open the right column's <span className="text-foreground">assistant</span>{" "}
            tab. Its input row hoists into the column footer via{" "}
            <code className="text-foreground">usePanelChrome</code> — the same panel
            renders self-contained when mounted in a bare host. No model is wired;
            give <code className="text-foreground">useChat</code> a sender to make it real.
          </p>
        </div>

        <div className="space-y-3 border-t border-line pt-6">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-mute-fg" />
            <h2 className="text-xs font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing)">
              build with claude code
            </h2>
          </div>
          <p className="text-[11px] text-mute-fg leading-relaxed">
            This template ships a <code className="text-foreground">.claude/</code>{" "}
            stack — rules that teach the agent the kit's contracts, plus a{" "}
            <code className="text-foreground">panel-from-template</code> skill that
            scaffolds new panels against <code className="text-foreground">usePanelChrome</code>.
            If you use Claude Code, ask it to add a panel and drop it into a route.
          </p>
        </div>
      </div>
    </div>
  )
}
