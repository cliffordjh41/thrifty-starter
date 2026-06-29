import { useEffect, useState, type ReactNode } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router"
import { ArrowLeft, Menu, Newspaper, MessageSquare } from "lucide-react"
import {
  COLUMN_WIDTH,
  SlidableColumn,
  SlidableColumnHeader,
  SlidableColumnContent,
  SlidableColumnFooter,
  SlidingPanels,
  SlidingPanel,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Popup,
  SkipLink,
  VisuallyHidden,
  useFocusOnChange,
  useIsMobile,
  cx,
} from "thrifty-ui"
import { FeedPanel } from "../panels/FeedPanel"
import { AIChatPanel } from "../panels/AIChatPanel"

// Site shell. Wraps the three nav routes under /home. The chrome — left/right
// SlidableColumns, the center header/body/footer, the mobile bar and its sheets
// — is identical across routes; only the center body (the active route via
// <Outlet />) changes. Column header/footer heights (h-11 / h-12) match the
// center column so the three share one box model.

const MOBILE_BAR_HEIGHT = 48

const ROUTES = [
  { to: "/home", label: "home" },
  { to: "/studio", label: "studio" },
  { to: "/columns", label: "columns" },
] as const

function activeRouteLabel(pathname: string): string {
  const hit = ROUTES.find((r) => pathname === r.to || pathname.startsWith(r.to + "/"))
  return hit?.label ?? "home"
}

const NAV_LINK_CLS =
  "block py-2 px-3 rounded text-xs uppercase tracking-(--theme-letter-spacing) transition-colors text-left w-full"

function NavList({
  onNavigate,
  onOpenAbout,
}: {
  onNavigate?: () => void
  onOpenAbout: () => void
}) {
  return (
    <div className="flex flex-col h-full gap-1.5 p-3">
      {ROUTES.map((r) => (
        <NavLink
          key={r.to}
          to={r.to}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            cx(
              NAV_LINK_CLS,
              isActive
                ? "bg-mute text-foreground"
                : "text-mute-fg hover:text-foreground hover:bg-mute/50",
            )
          }
        >
          {r.label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={() => {
          onOpenAbout()
          onNavigate?.()
        }}
        className={cx(NAV_LINK_CLS, "text-mute-fg hover:text-foreground hover:bg-mute/50")}
      >
        about
      </button>
    </div>
  )
}

// About dialog — a single panel rendered in the Popup host (the "panel in a
// dialog" variation). Triggered from the nav.
function AboutDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Popup open={open} onOpenChange={onOpenChange} name="About" description="About this starter" size="md">
      <div className="flex flex-col gap-4 px-6 py-6">
        <h2 className="text-sm font-(--theme-font-weight) uppercase tracking-[0.3em] text-center">
          thrifty starter
        </h2>
        <p className="text-[11px] text-mute-fg leading-relaxed text-center">
          A starting point built on thrifty-ui — a small Radix + Tailwind React
          UI foundation. This dialog is itself a panel rendered in the Popup
          host; the same content would render in a column, sheet, or drawer
          unchanged.
        </p>
        <a
          href="https://github.com/cliffordjh41/thrifty-ui"
          className="text-center text-xs text-foreground underline underline-offset-2 hover:text-foreground/80"
        >
          github.com/cliffordjh41/thrifty-ui
        </a>
      </div>
    </Popup>
  )
}

const RIGHT_TABS = ["news", "assistant"] as const

function RightColumnTabs({
  active,
  onChange,
}: {
  active: number
  onChange: (index: number) => void
}) {
  return (
    <div className="h-11 flex items-stretch">
      {RIGHT_TABS.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(i)}
          aria-pressed={active === i}
          className={cx(
            "flex-1 flex items-center justify-center text-[10px] uppercase tracking-(--theme-letter-spacing) transition-colors",
            active === i ? "text-foreground" : "text-mute-fg hover:text-foreground hover:bg-mute/50",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

type MobileSheet = "left" | "right" | null

export function Layout() {
  const { pathname } = useLocation()
  const label = activeRouteLabel(pathname)
  const isMobile = useIsMobile()
  const [mobileSheet, setMobileSheet] = useState<MobileSheet>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [chatFooter, setChatFooter] = useState<ReactNode>(null)
  const [mobileChatFooter, setMobileChatFooter] = useState<ReactNode>(null)
  // Right column view: 0 = news, 1 = assistant.
  const [rightView, setRightView] = useState(0)

  // Move focus to the main route container on navigation — keyboard users land
  // in the new content; screen readers announce it.
  const mainRef = useFocusOnChange<HTMLElement>(pathname)

  // Tapping the bar slot for the open view closes; a different view swaps.
  const openRightOnView = (view: 0 | 1) => {
    if (mobileSheet === "right" && rightView === view) {
      setMobileSheet(null)
    } else {
      setRightView(view)
      setMobileSheet("right")
    }
  }

  useEffect(() => {
    if (!isMobile) setMobileSheet(null)
  }, [isMobile])

  const openAbout = () => {
    setAboutOpen(true)
    setMobileSheet(null)
  }

  // Right-column content — shared between desktop column and mobile sheet.
  const rightPanels = (onChatFooter: (n: ReactNode) => void) => (
    <SlidingPanels activeIndex={rightView} onIndexChange={setRightView} className="h-full">
      <SlidingPanel>
        <FeedPanel />
      </SlidingPanel>
      <SlidingPanel>
        <AIChatPanel onFooter={onChatFooter} />
      </SlidingPanel>
    </SlidingPanels>
  )

  return (
    <div className="h-dvh w-full bg-background text-foreground overflow-hidden relative">
      <SkipLink href="#main">Skip to main content</SkipLink>

      {/* Left column — nav */}
      <SlidableColumn
        side="left"
        offset={0}
        onOffsetChange={() => {}}
        hidden={isMobile}
        bottomOffset={0}
        className="border-r"
      >
        <SlidableColumnHeader className="!p-0">
          <div className="h-11 flex items-center justify-start pl-2">
            <Link
              to="/"
              title="Back to landing"
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3" />
              back
            </Link>
          </div>
        </SlidableColumnHeader>
        <SlidableColumnContent className="!p-0">
          <NavList onOpenAbout={openAbout} />
        </SlidableColumnContent>
        <SlidableColumnFooter className="!p-0">
          <div className="h-12 flex items-center justify-center text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg">
            thrifty-ui
          </div>
        </SlidableColumnFooter>
      </SlidableColumn>

      {/* Right column — news / assistant */}
      <SlidableColumn
        side="right"
        offset={0}
        onOffsetChange={() => {}}
        hidden={isMobile}
        bottomOffset={0}
        className="border-l"
      >
        <SlidableColumnHeader className="!p-0">
          <RightColumnTabs active={rightView} onChange={setRightView} />
        </SlidableColumnHeader>
        <SlidableColumnContent className="!p-0">
          {rightPanels(setChatFooter)}
        </SlidableColumnContent>
        <SlidableColumnFooter className="!p-0">
          <div className="h-12 flex items-stretch">
            {rightView === 1 ? (
              chatFooter ?? (
                <div className="flex-1 flex items-center px-3 text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg">
                  chat
                </div>
              )
            ) : (
              <div className="flex-1 flex items-center px-3 text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg">
                news
              </div>
            )}
          </div>
        </SlidableColumnFooter>
      </SlidableColumn>

      {/* Center — header / body / footer. Insets by COLUMN_WIDTH on desktop;
          full width above the mobile bar on mobile. */}
      <div
        className="absolute top-0 flex flex-col bg-background overflow-hidden"
        style={{
          left: isMobile ? 0 : COLUMN_WIDTH,
          right: isMobile ? 0 : COLUMN_WIDTH,
          bottom: isMobile
            ? `calc(${MOBILE_BAR_HEIGHT}px + env(safe-area-inset-bottom))`
            : 0,
          transition: "left 200ms ease-out, right 200ms ease-out, bottom 200ms ease-out",
        }}
      >
        <div className="flex-shrink-0 border-b border-line">
          <div className="h-11 flex items-center px-4 md:px-6 text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg">
            {label}
          </div>
        </div>

        <section id="main" ref={mainRef} tabIndex={-1} className="flex-1 min-h-0 relative outline-none">
          <Outlet />
        </section>

        {!isMobile && (
          <div className="flex-shrink-0 border-t border-line">
            <div className="h-12" />
          </div>
        )}
      </div>

      {/* Tap-capture scrim — swallows taps behind an open sheet and closes it.
          Under the sheet (z-50) and bar (z-60), both stay interactive. */}
      {isMobile && mobileSheet && (
        <div aria-hidden onClick={() => setMobileSheet(null)} className="absolute inset-0 z-40" />
      )}

      {/* Mobile bar — Menu · News · Chat. */}
      {isMobile && (
        <div
          data-mobile-bar
          className="absolute bottom-0 left-0 right-0 bg-background text-foreground border-t border-line z-[60]"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="h-12 flex items-stretch">
            <button
              type="button"
              onClick={() => setMobileSheet((c) => (c === "left" ? null : "left"))}
              className={cx(
                "flex-1 flex items-center justify-center transition-colors",
                mobileSheet === "left"
                  ? "bg-mute text-foreground"
                  : "text-mute-fg hover:text-foreground hover:bg-mute/50",
              )}
              title="Menu"
            >
              <Menu className="h-4 w-4" />
              <VisuallyHidden>Menu</VisuallyHidden>
            </button>
            <div className="w-px self-center h-5 bg-line flex-shrink-0" />
            <button
              type="button"
              onClick={() => openRightOnView(0)}
              className={cx(
                "flex-1 flex items-center justify-center transition-colors",
                mobileSheet === "right" && rightView === 0
                  ? "bg-mute text-foreground"
                  : "text-mute-fg hover:text-foreground hover:bg-mute/50",
              )}
              title="News"
            >
              <Newspaper className="h-4 w-4" />
              <VisuallyHidden>News</VisuallyHidden>
            </button>
            <div className="w-px self-center h-5 bg-line flex-shrink-0" />
            <button
              type="button"
              onClick={() => openRightOnView(1)}
              className={cx(
                "flex-1 flex items-center justify-center transition-colors",
                mobileSheet === "right" && rightView === 1
                  ? "bg-mute text-foreground"
                  : "text-mute-fg hover:text-foreground hover:bg-mute/50",
              )}
              title="Chat"
            >
              <MessageSquare className="h-4 w-4" />
              <VisuallyHidden>Chat</VisuallyHidden>
            </button>
          </div>
        </div>
      )}

      {/* Mobile left sheet — nav. Non-modal so the bar stays live. */}
      <Sheet
        modal={false}
        open={mobileSheet === "left"}
        onOpenChange={(open) => {
          if (!open) setMobileSheet((c) => (c === "left" ? null : c))
        }}
      >
        <SheetContent
          side="left"
          showCloseButton={false}
          showOverlay={false}
          onFocusOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => {
            const t = e.detail.originalEvent.target as Element | null
            if (t?.closest("[data-mobile-bar]")) e.preventDefault()
          }}
          style={{ width: COLUMN_WIDTH }}
          className="bg-background text-foreground p-0 pb-[calc(3rem+env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="border-b border-line pl-2 pr-4 py-3">
            <VisuallyHidden asChild>
              <SheetTitle>Navigation</SheetTitle>
            </VisuallyHidden>
            <div className="flex items-center justify-start">
              <Link
                to="/"
                onClick={() => setMobileSheet(null)}
                title="Back to landing"
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3" />
                back
              </Link>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <NavList onNavigate={() => setMobileSheet(null)} onOpenAbout={openAbout} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile right sheet — news / assistant. */}
      <Sheet
        modal={false}
        open={mobileSheet === "right"}
        onOpenChange={(open) => {
          if (!open) setMobileSheet((c) => (c === "right" ? null : c))
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          showOverlay={false}
          onFocusOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => {
            const t = e.detail.originalEvent.target as Element | null
            if (t?.closest("[data-mobile-bar]")) e.preventDefault()
          }}
          className="bg-background text-foreground h-[85dvh] p-0 pb-12 flex flex-col"
        >
          <SheetHeader className="border-b border-line p-0">
            <VisuallyHidden asChild>
              <SheetTitle>Right column</SheetTitle>
            </VisuallyHidden>
            <RightColumnTabs active={rightView} onChange={setRightView} />
          </SheetHeader>
          <div className="flex-1 min-h-0 relative">{rightPanels(setMobileChatFooter)}</div>
          {rightView === 1 && mobileChatFooter && (
            <div className="shrink-0 border-t border-line flex items-stretch">{mobileChatFooter}</div>
          )}
        </SheetContent>
      </Sheet>

      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </div>
  )
}
