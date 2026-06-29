import { Link } from "react-router"

// Single-screen entry. Name/title centered, an "enter" link into the shell.
// Styled entirely from theme tokens (bg-background, text-foreground, …) so it
// re-colors live with whatever theme the studio route produces.
export function Landing() {
  return (
    <div className="h-dvh w-full bg-background text-foreground flex flex-col items-center justify-center gap-6 select-none">
      <h1 className="text-2xl font-(--theme-font-weight) uppercase tracking-[0.3em]">
        thrifty starter
      </h1>
      <p className="text-[11px] uppercase tracking-(--theme-letter-spacing) text-mute-fg">
        a thrifty-ui app shell
      </p>
      <Link
        to="/home"
        className="mt-2 px-6 py-2 rounded border border-line text-xs uppercase tracking-(--theme-letter-spacing) text-mute-fg hover:text-foreground hover:bg-mute/50 transition-colors"
      >
        enter
      </Link>
    </div>
  )
}
