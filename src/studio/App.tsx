
import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react"
import { cx } from "thrifty-ui"
import { useIsMobile } from "thrifty-ui"
import { ToggleOption, TabNavigationFooter, SelectableRow } from "thrifty-ui"
import {
  SlidableColumn,
  SlidableColumnHandles,
  SlidableColumnHeader,
  SlidableColumnContent,
  SlidableColumnFooter,
} from "thrifty-ui"
import { ColorPanel, StylePanel, TypographyPanel, EffectsPanel } from "thrifty-ui"
import { MusicPlayerPanel } from "thrifty-ui/panels/MusicPlayerPanel"
import type { MusicConfigPlaylist, MusicConfigTrack } from "thrifty-ui"
import { ThemeScope, useThemeRoot, type ThemeMode } from "thrifty-ui"
import { ColumnToolBar } from "thrifty-ui"
import { themeToCss } from "thrifty-ui"
import { Sheet, SheetContent, SheetHeader, SheetTitle, VisuallyHidden } from "thrifty-ui"
import { TooltipProvider } from "thrifty-ui"
import { ThemeModeToggle } from "thrifty-ui"
import {
  SlidingPanels,
  SlidingPanel,
  SlidingPanelHeader,
  SlidingPanelContent,
} from "thrifty-ui"
import { ChevronLeft, ChevronRight, ArrowLeft, Frame, Box, Type, Sparkles, Palette } from "lucide-react"
import { useStudioStore, type ContentPanelId } from "./store/studio-store"

// Optional back-button hook: when set, studio's L column header (and
// mobile sheet header) renders a back-arrow to the left of the Copy
// CSS button that invokes this callback. A host app wires it to return
// to its own route without studio having to import react-router.
// Standalone studio leaves this undefined and renders no back-arrow.
interface AppProps {
  onBack?: () => void
  // When set, studio renders a floating "artboard" chip (top-right, mirror
  // of the back chip) that opens the host's artboard demo. A host wires it
  // to navigate to its artboard route; standalone studio leaves it undefined
  // and renders no chip.
  onOpenArtboard?: () => void
}

// The MusicPlayerPanel is controlled and presentational: the host owns playlist
// state and passes it in via panelData, wiring the edit callbacks below. No
// audio is bundled — the user builds playlists at runtime (onAddTrack opens a
// file picker, accept="audio/*"). Each affordance renders only when its handler
// is supplied; here we supply them all, so the panel is fully editable.
function useMusicLibrary() {
  const [playlists, setPlaylists] = useState<MusicConfigPlaylist[]>([])

  const panelData = useMemo(
    () => ({ playlists }) as unknown as Record<string, unknown>,
    [playlists],
  )

  const handlers = useMemo(
    () => ({
      onCreatePlaylist: (name: string) =>
        setPlaylists((ps) => [...ps, { id: crypto.randomUUID(), name, tracks: [] }]),
      onRenamePlaylist: (id: string, name: string) =>
        setPlaylists((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p))),
      onDeletePlaylist: (id: string) =>
        setPlaylists((ps) => ps.filter((p) => p.id !== id)),
      onReorderPlaylists: (next: MusicConfigPlaylist[]) => setPlaylists(next),
      onAddTrack: (playlistId: string, title: string, url: string) =>
        setPlaylists((ps) =>
          ps.map((p) =>
            p.id === playlistId
              ? { ...p, tracks: [...p.tracks, { id: crypto.randomUUID(), title, url }] }
              : p,
          ),
        ),
      onRemoveTrack: (playlistId: string, trackId: string) =>
        setPlaylists((ps) =>
          ps.map((p) =>
            p.id === playlistId
              ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) }
              : p,
          ),
        ),
      onReorderTracks: (playlistId: string, tracks: MusicConfigTrack[]) =>
        setPlaylists((ps) => ps.map((p) => (p.id === playlistId ? { ...p, tracks } : p))),
    }),
    [],
  )

  return { panelData, handlers }
}

function App({ onBack, onOpenArtboard }: AppProps = {}) {
  // Store state
  const theme = useStudioStore((s) => s.theme)
  const setTheme = useStudioStore((s) => s.setTheme)
  const leftColumn = useStudioStore((s) => s.leftColumn)
  const rightColumn = useStudioStore((s) => s.rightColumn)

  const popups = useStudioStore((s) => s.popups)
  const updatePopup = useStudioStore((s) => s.updatePopup)
  const panelAssignments = useStudioStore((s) => s.panelAssignments)
  const setPanelAssignment = useStudioStore((s) => s.setPanelAssignment)

  // Host-owned music library — playlists + the panel's edit callbacks.
  const music = useMusicLibrary()

  // Content panel catalog — assignable panels for the studio's panel
  // assignment slots. Aligned with the trimmed ContentPanelId enum.
  const panelCatalog: { id: ContentPanelId; label: string }[] = [
    { id: "music", label: "Music Player" },
  ]

  // Right sidebar panel assignments (2 slots)
  const rightAssigned = panelAssignments.find((a) => a.containerId === "sidebar-right")?.panels ?? []
  const allAssigned = panelAssignments.flatMap((a) => a.panels)

  // Assign a content panel to a right sidebar slot (0 or 1)
  const assignToSlot = (slotIndex: number, panelId: ContentPanelId) => {
    const current = [...rightAssigned]
    current[slotIndex] = panelId
    setPanelAssignment("sidebar-right", current)
  }

  // Clear a right sidebar slot
  const clearSlot = (slotIndex: number) => {
    const current = [...rightAssigned]
    current.splice(slotIndex, 1, undefined as unknown as ContentPanelId)
    setPanelAssignment("sidebar-right", current.filter(Boolean))
  }

  // Panel picker dialog state — which slot (0 or 1) is being picked, null = closed
  const [pickerSlot, setPickerSlot] = useState<number | null>(null)

  // Outer sidebar state (studio chrome)
  const [leftOffset, setLeftOffset] = useState(0)
  const [rightOffset, setRightOffset] = useState(0)
  const [leftHidden] = useState(false)
  const [rightHidden] = useState(false)
  const [swapped] = useState(false)

  // Inner sidebar state (the app being built)
  const [innerLeftOffset, setInnerLeftOffset] = useState(256)
  const [innerRightOffset, setInnerRightOffset] = useState(-256)
  const [innerLeftHidden, setInnerLeftHidden] = useState(false)
  const [innerRightHidden, setInnerRightHidden] = useState(false)
  const [innerSwapped, setInnerSwapped] = useState(false)

  // Light/dark mode for color editing and preview
  const [colorMode, setColorMode] = useState<ThemeMode>("A")

  // Footer-region Drawer state — one per column
  const [styleDrawerOpen, setStyleDrawerOpen] = useState(false)
  const [typographyDrawerOpen, setTypographyDrawerOpen] = useState(false)

  // Copy-CSS lives in the STYLING (left) column header; ColorPanel's built-in
  // copy is suppressed there via showCopyCss={false}.
  const [cssCopied, setCssCopied] = useState(false)
  const copyThemeCss = async () => {
    try {
      await navigator.clipboard.writeText(themeToCss(theme))
      setCssCopied(true)
      setTimeout(() => setCssCopied(false), 1500)
    } catch {
      // Clipboard unavailable — no-op.
    }
  }

  // STYLING-header controls — a 3-col row [Back | Copy CSS | Artboard], shared
  // by the desktop L column header and the mobile left sheet header. Back +
  // Artboard render only when the host supplies their callbacks (host
  // embed); standalone studio shows just the centered Copy CSS.
  const stylingHeaderControls = (
    <div className="w-full grid grid-cols-3 items-center text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing)">
      <div className="flex justify-start">
        {onBack && (
          <button
            onClick={onBack}
            title="Back to home"
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3" />
            back
          </button>
        )}
      </div>
      <button
        onClick={copyThemeCss}
        title="Copy the theme as CSS to the clipboard"
        className="justify-self-center text-mute-fg hover:text-foreground transition-colors"
      >
        {cssCopied ? "Copied" : "Copy CSS"}
      </button>
      <div className="flex justify-end">
        {onOpenArtboard && (
          <button
            onClick={onOpenArtboard}
            title="Open artboard demo"
            className="inline-flex items-center gap-1 text-mute-fg hover:text-foreground transition-colors"
          >
            Artboard
            <Frame className="size-3" />
          </button>
        )}
      </div>
    </div>
  )


  // Studio mode — locked to themes for Drop 1. Dashboard mode disabled until kit drops.
  type StudioMode = "themes" | "dashboard"
  const studioMode: StudioMode = "themes"

  // Dashboard config tab — sidebars or popups
  type ConfigTab = "sidebars" | "popups"
  const [configTab, setConfigTab] = useState<ConfigTab>("sidebars")

  // Active editing popup — which popup is open in viewport for editing (null = editing sidebars)
  const [editingPopupId, setEditingPopupId] = useState<string | null>(null)

  // Per-popup sliding panel index (resets when switching popups)
  const [popupPanelIndex, setPopupPanelIndex] = useState(0)

  // Inner sidebar drawer state
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)

  // Per-sidebar sliding panel indexes
  const [rightPanelIndex, setRightPanelIndex] = useState(0)
  const [leftDrawerPanelIndex, setLeftDrawerPanelIndex] = useState(0)

  // Footer slot content — panels inject their footer via onFooter callback
  const [rightFooter0, setRightFooter0] = useState<ReactNode>(null)
  const [rightFooter1, setRightFooter1] = useState<ReactNode>(null)

  // Carousel preview footer slot — the active panel emits its footer
  // chrome (e.g. music-player track scrubber, AI-chat send/input) via
  // onFooter; the carousel frame renders it below the panel body so
  // mature panels show with full chrome.
  const [carouselFooter, setCarouselFooter] = useState<ReactNode>(null)

  // Delayed footer index — waits for slide animation (300ms) before swapping footer content
  const [committedRightIndex, setCommittedRightIndex] = useState(rightPanelIndex)
  useEffect(() => {
    const timer = setTimeout(() => setCommittedRightIndex(rightPanelIndex), 300)
    return () => clearTimeout(timer)
  }, [rightPanelIndex])

  // Single showcase panel surfaced in the preview frame — MusicPlayer.
  // (The multi-panel carousel was retired with the minimal-kit cull;
  //  the prior full App is archived under .archive/app-pre-minimal-2026-06-23.)

  // Mobile sheet dialogs — single-active model. One sheet open at a time;
  // clicking the same trigger again closes; clicking a different trigger
  // auto-closes the current and opens the new one.
  // Layout convention: "left" and "right" map to the left/right columns
  // (always-bookend icons in the mobile bar); other keys are app-specific
  // sub-sheets that still flow through the same single-active state.
  type MobileSheet = "left" | "right" | "left-footer" | "right-footer" | null
  const [mobileSheet, setMobileSheet] = useState<MobileSheet>(null)
  const toggleMobileSheet = (target: Exclude<MobileSheet, null>) =>
    setMobileSheet((current) => (current === target ? null : target))

  // Mobile breakpoint — hide sidebars below 768px
  const isMobile = useIsMobile()

  // Space the columns reserve at their bottom for the ColumnToolBar. The toolbar is
  // h-8 (2rem) on desktop / h-12 (3rem) on mobile, and base-size sets the root
  // font-size, so 1rem === baseFontSize px. A fixed px reservation only matched
  // the toolbar at base 16; below that the toolbar shrank but the columns kept
  // reserving 32px and floated above it. Track the rem height in px instead.
  const toolbarReservePx = (isMobile ? 3 : 2) * (theme.styling.baseFontSize ?? 16)

  // Close mobile sheet when crossing to desktop
  useEffect(() => {
    if (!isMobile) setMobileSheet(null)
  }, [isMobile])

  // Holo Track Mouse — rotate --holo-angle to the cursor's bearing from
  // screen center. atan2 returns (-π, π] which jumps 2π when the cursor
  // crosses the negative-x-axis from center; accumulate delta with
  // ±180° wrapping so the written angle is monotonic across cursor
  // motion (no full-rotation snap-back at quadrant boundaries).
  // Document-element-level so the cascade reaches every surface that
  // opts in via the .bg-holo overlay.
  useEffect(() => {
    if (!theme.styling.holoTrackMouse) {
      document.documentElement.style.removeProperty("--holo-angle")
      return
    }
    let lastRaw: number | null = null
    let accumulated = 0
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const raw = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90
      if (lastRaw === null) {
        lastRaw = raw
        accumulated = raw
      } else {
        let delta = raw - lastRaw
        if (delta > 180) delta -= 360
        else if (delta < -180) delta += 360
        accumulated += delta
        lastRaw = raw
      }
      document.documentElement.style.setProperty("--holo-angle", `${accumulated}deg`)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [theme.styling.holoTrackMouse])


  const handleSetLeftOffset = useCallback(
    (offset: number) => {
      if (!isMobile) setLeftOffset(offset)
    },
    [isMobile]
  )
  const handleSetRightOffset = useCallback(
    (offset: number) => {
      if (!isMobile) setRightOffset(offset)
    },
    [isMobile]
  )

  // Apply the studio's theme to :root so portaled content (Radix Portal
  // under Sheets / Dialogs / Popovers) inherits live picker updates the
  // same as in-tree content. A scoped ThemeScope wrapper would not reach
  // portaled content.
  useThemeRoot(theme, colorMode)

  return (
    <TooltipProvider>
      <div className="h-dvh w-full bg-background text-foreground overflow-hidden relative">
      {(colorMode === "B" ? theme.styling.backgroundHoloB : theme.styling.backgroundHoloA) && (
        <div className="absolute inset-0 pointer-events-none bg-holo" />
      )}

      {/* Center — mode-switched: carousel (THEMES) or viewport (DASHBOARD).
       *  Desktop carousel flanks the preview frame with prev/next chevrons.
       *  Mobile hides these in favor of the mobile-bar arrows; same
       *  prevPanel/nextPanel handlers reach the carousel via either entry. */}
      {studioMode === "themes" ? (
        <div role="main" className="absolute inset-0 flex items-center justify-center">
          <div className="w-[400px] h-[600px] border-2 border-line shadow-xl flex flex-col overflow-hidden rounded-lg">
            <div className="flex-1 min-h-0">
              <MusicPlayerPanel
                theme={theme}
                mode={colorMode}
                onFooter={setCarouselFooter}
                panelData={music.panelData}
                {...music.handlers}
              />
            </div>
            {/* Footer slot reserved unconditionally — keeps the body
                height constant across the panel's internal state changes. */}
            <div className="shrink-0 h-11 border-t border-line flex items-stretch">
              {carouselFooter}
            </div>
          </div>
        </div>
      ) : (
        <ThemeScope theme={theme} mode={colorMode} className={cx("absolute inset-0 bg-background text-foreground overflow-hidden isolate", isMobile ? "bottom-12" : "bottom-8")}>
          <div className="h-full w-full relative">
            {/* Inner left sidebar */}
            <SlidableColumn
              side="left"
              offset={innerLeftOffset}
              onOffsetChange={setInnerLeftOffset}
              hidden={innerLeftHidden || leftColumn.hidden}
              swapped={innerSwapped}
              className="bg-column text-column-foreground border-column-line border-r"
              bottomOffset={toolbarReservePx}
              zIndex={leftColumn.zIndex}
            >
              {leftColumn.showHandles && <SlidableColumnHandles />}
              {leftColumn.showHeader && (
                <SlidableColumnHeader>
                  <ThemeModeToggle
                    mode={colorMode}
                    labelA={theme.styling.labelA}
                    labelB={theme.styling.labelB}
                    className="w-full"
                  />
                </SlidableColumnHeader>
              )}
              <SlidableColumnContent className={cx("!p-0 relative flex flex-col", leftDrawerOpen && "!overflow-hidden")}>
                <div className="flex-1 flex items-center justify-center text-mute-fg text-xs uppercase tracking-(--theme-letter-spacing)">
                  Panel
                </div>
                {/* Drawer — slides up from bottom, fills to header */}
                <div
                  className={cx(
                    "absolute inset-0 bg-column transition-transform duration-200 ease-out flex flex-col z-10",
                    leftDrawerOpen ? "translate-y-0" : "translate-y-full"
                  )}
                  onWheel={(e) => e.stopPropagation()}
                >
                  {/* Drawer tab header */}
                  <div className="flex-shrink-0 border-b border-column-line p-2">
                    <div className="flex items-center gap-1 w-full">
                      {[0, 1].map((i) => (
                        <button
                          key={i}
                          className={cx(
                            "flex-1 h-7 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) transition-colors",
                            leftDrawerPanelIndex === i
                              ? "text-foreground"
                              : "text-mute-fg hover:text-foreground"
                          )}
                          onClick={() => setLeftDrawerPanelIndex(i)}
                        >
                          {leftColumn.panelLabels[i] || `Panel ${i + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Drawer sliding panels */}
                  <SlidingPanels activeIndex={leftDrawerPanelIndex} onIndexChange={setLeftDrawerPanelIndex}>
                    {/* Panel 1 — Dialog triggers */}
                    <SlidingPanel>
                      <SlidingPanelContent className="!p-0">
                        <div className="flex flex-col gap-1.5 p-3">
                          {popups.map((d) => (
                            <button
                              key={d.id}
                              className="w-full py-2.5 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) rounded-lg border border-column-line text-column-foreground hover:bg-column-highlight/50 transition-colors"
                              onClick={() => { setEditingPopupId(d.id); setPopupPanelIndex(0) }}
                            >
                              {d.name}
                            </button>
                          ))}
                        </div>
                      </SlidingPanelContent>
                    </SlidingPanel>
                    {/* Panel 2 — placeholder */}
                    <SlidingPanel>
                      <SlidingPanelContent className="!p-0">
                        <div className="flex-1 flex items-center justify-center text-mute-fg text-xs uppercase tracking-(--theme-letter-spacing)">
                          Panel 2
                        </div>
                      </SlidingPanelContent>
                    </SlidingPanel>
                  </SlidingPanels>
                </div>
              </SlidableColumnContent>
              <SlidableColumnFooter className="!p-0">
                <button
                  onClick={() => setLeftDrawerOpen(!leftDrawerOpen)}
                  className={cx(
                    "w-full py-3 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) transition-colors",
                    leftDrawerOpen
                      ? "bg-foreground text-background"
                      : "text-mute-fg hover:text-foreground hover:bg-mute/50"
                  )}
                >
                  Dialogs
                </button>
              </SlidableColumnFooter>
            </SlidableColumn>

            {/* Inner right sidebar */}
            <SlidableColumn
              side="right"
              offset={innerRightOffset}
              onOffsetChange={setInnerRightOffset}
              hidden={innerRightHidden || rightColumn.hidden}
              swapped={innerSwapped}
              className="bg-column text-column-foreground border-column-line border-l"
              bottomOffset={toolbarReservePx}
              zIndex={rightColumn.zIndex}
            >
              {rightColumn.showHandles && <SlidableColumnHandles />}
              <SlidableColumnHeader>
                <div className="flex items-center gap-1 w-full">
                  {[0, 1].map((i) => {
                    const label = rightAssigned[i]
                      ? panelCatalog.find((p) => p.id === rightAssigned[i])?.label ?? `Panel ${i + 1}`
                      : `Panel ${i + 1}`
                    return (
                      <button
                        key={i}
                        className={cx(
                          "flex-1 h-7 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) transition-colors",
                          rightPanelIndex === i
                            ? "text-foreground"
                            : "text-mute-fg hover:text-foreground"
                        )}
                        onClick={() => setRightPanelIndex(i)}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </SlidableColumnHeader>
              <SlidableColumnContent className="!p-0">
                <SlidingPanels activeIndex={rightPanelIndex} onIndexChange={setRightPanelIndex}>
                  {[0, 1].map((i) => {
                    const assignedId = rightAssigned[i]
                    const panelLabel = assignedId
                      ? panelCatalog.find((p) => p.id === assignedId)?.label ?? `Panel ${i + 1}`
                      : `Panel ${i + 1}`
                    const footerSetter = i === 0 ? setRightFooter0 : setRightFooter1
                    return (
                      <SlidingPanel key={i}>
                        <SlidingPanelContent className={assignedId ? "!p-0" : undefined}>
                          {assignedId === "music" ? (
                            <MusicPlayerPanel theme={theme} mode={colorMode} onFooter={footerSetter} panelData={music.panelData} {...music.handlers} />
                          ) : (
                            <div className="flex-1 flex items-center justify-center text-mute-fg text-xs uppercase tracking-(--theme-letter-spacing)">
                              {panelLabel}
                            </div>
                          )}
                        </SlidingPanelContent>
                      </SlidingPanel>
                    )
                  })}
                </SlidingPanels>
              </SlidableColumnContent>
              <SlidableColumnFooter className="!p-0 flex items-stretch">
                {(() => {
                  const activeFooter = committedRightIndex === 0 ? rightFooter0 : rightFooter1
                  if (activeFooter) return activeFooter
                  return (
                    <div className="w-full py-3 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) text-mute-fg text-center">
                      Footer
                    </div>
                  )
                })()}
              </SlidableColumnFooter>
            </SlidableColumn>

            {/* Dialog previews */}
            {popups.map((d) => (
              editingPopupId === d.id && (
                <div key={d.id} className="absolute inset-0 z-40 flex items-center justify-center">
                  {d.modal && <div className="absolute inset-0 bg-scrim/50" onClick={() => setEditingPopupId(null)} />}
                  <div className={cx(
                    "relative bg-background border rounded-lg shadow-lg overflow-hidden flex flex-col",
                    d.size === "sm" && "w-[360px] h-[480px]",
                    d.size === "md" && "w-[420px] h-[560px]",
                    d.size === "lg" && "w-[560px] h-[640px]",
                    d.size === "xl" && "w-[720px] h-[720px]",
                    d.size === "full" && "w-[calc(100%-2rem)] h-[calc(100%-2rem)]",
                  )}>
                    {d.showCloseButton && (
                      <button
                        className="absolute top-4 right-4 z-10 opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => setEditingPopupId(null)}
                      >
                        <span className="text-xs">✕</span>
                      </button>
                    )}
                    <SlidingPanels activeIndex={popupPanelIndex} onIndexChange={setPopupPanelIndex}>
                      {Array.from({ length: d.panelCount }, (_, i) => (
                        <SlidingPanel key={i}>
                          {d.showHeader && (
                            <SlidingPanelHeader>
                              <span className="text-sm font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing)">
                                {d.panelLabels[i] || d.name}
                              </span>
                            </SlidingPanelHeader>
                          )}
                          <SlidingPanelContent>
                            <div className="flex-1 flex items-center justify-center text-mute-fg text-xs uppercase tracking-(--theme-letter-spacing)">
                              Panel {i + 1}
                            </div>
                          </SlidingPanelContent>
                        </SlidingPanel>
                      ))}
                    </SlidingPanels>
                    {/* Footer: tab navigation or chevrons */}
                    {d.panelCount > 1 && (
                      d.showFooter ? (
                        <TabNavigationFooter
                          tabs={Array.from({ length: d.panelCount }, (_, i) => ({
                            id: String(i),
                            label: d.panelLabels[i] || `${i + 1}`,
                          }))}
                          activeTab={String(popupPanelIndex)}
                          onTabChange={(id) => setPopupPanelIndex(Number(id))}
                        />
                      ) : (
                        <div className="flex border-t border-line">
                          <button
                            className="flex-1 py-3 flex items-center justify-center text-mute-fg hover:text-foreground transition-colors disabled:opacity-30"
                            disabled={popupPanelIndex === 0}
                            onClick={() => setPopupPanelIndex(popupPanelIndex - 1)}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            className="flex-1 py-3 flex items-center justify-center text-mute-fg hover:text-foreground transition-colors disabled:opacity-30"
                            disabled={popupPanelIndex === d.panelCount - 1}
                            onClick={() => setPopupPanelIndex(popupPanelIndex + 1)}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            ))}

            {/* Inner toolbar — controls inner sidebars */}
            <ColumnToolBar
              isMobile={false}
              leftOffset={innerLeftOffset}
              rightOffset={innerRightOffset}
              setLeftOffset={setInnerLeftOffset}
              setRightOffset={setInnerRightOffset}
              swapped={innerSwapped}
              setSwapped={setInnerSwapped}
              leftHidden={innerLeftHidden}
              setLeftHidden={setInnerLeftHidden}
              rightHidden={innerRightHidden}
              setRightHidden={setInnerRightHidden}
            />
          </div>
        </ThemeScope>
      )}

      {/* Left Sidebar — Mode: Themes (export tree) or Dashboard (config flows) */}
      <SlidableColumn
        side="left"
        role="complementary"
        aria-label="Style controls"
        offset={isMobile ? 0 : leftOffset}
        onOffsetChange={handleSetLeftOffset}
        hidden={isMobile || leftHidden}
        swapped={swapped}
        className="border-r"
        bottomOffset={0}
      >
        {(colorMode === "B" ? theme.styling.columnHoloB : theme.styling.columnHoloA) && (
          <div className="absolute inset-0 pointer-events-none bg-holo" />
        )}
        <SlidableColumnHeader className="!p-0">
          <div className="h-11 flex items-center px-2">
            {stylingHeaderControls}
          </div>
        </SlidableColumnHeader>

        <SlidableColumnContent className="!p-0 relative !overflow-hidden">
          {studioMode === "themes" ? (
            /* THEMES mode — STYLING label + Style picker (radius + shape). */
            <>
              <div className="shrink-0 px-3 pt-3 pb-1 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) text-mute-fg">
                STYLING
              </div>
              <StylePanel theme={theme} onThemeChange={setTheme} />
            </>
          ) : (
            /* DASHBOARD mode — tabbed config panels (no accordion) */
            <div className="h-full flex flex-col">
              {/* Config tab header */}
              <div className="flex items-center gap-1 px-2 py-2 border-b border-line">
                <ToggleOption
                  className="flex-1"
                  active={configTab === "sidebars"}
                  onClick={() => setConfigTab("sidebars")}
                >
                  SIDEBARS
                </ToggleOption>
                <ToggleOption
                  className="flex-1"
                  active={configTab === "popups"}
                  onClick={() => setConfigTab("popups")}
                >
                  DIALOGS
                </ToggleOption>
              </div>

              {/* Sidebars config panel */}
              {configTab === "sidebars" && (
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  <div className="text-[10px] text-mute-fg uppercase tracking-(--theme-letter-spacing)">Left</div>
                  <div className="space-y-1">
                    <button
                      disabled
                      className={cx(
                        "w-full py-1.5 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) rounded-lg border transition-all",
                        leftColumn.showHandles
                          ? "border-action bg-action/5 text-foreground"
                          : "border-line text-mute-fg"
                      )}
                    >
                      Handles
                    </button>
                    <button
                      disabled
                      className={cx(
                        "w-full py-1.5 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) rounded-lg border transition-all",
                        leftColumn.showHeader
                          ? "border-action bg-action/5 text-foreground"
                          : "border-line text-mute-fg"
                      )}
                    >
                      Header
                    </button>
                  </div>

                  <div className="text-[10px] text-mute-fg uppercase tracking-(--theme-letter-spacing) mt-4">Right</div>
                  <div className="space-y-1">
                    <button
                      disabled
                      className={cx(
                        "w-full py-1.5 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) rounded-lg border transition-all",
                        rightColumn.showHandles
                          ? "border-action bg-action/5 text-foreground"
                          : "border-line text-mute-fg"
                      )}
                    >
                      Handles
                    </button>
                    <button
                      disabled
                      className={cx(
                        "w-full py-1.5 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) rounded-lg border transition-all",
                        rightColumn.showHeader
                          ? "border-action bg-action/5 text-foreground"
                          : "border-line text-mute-fg"
                      )}
                    >
                      Header
                    </button>
                  </div>
                  {/* Panel assignment — 2 slots */}
                  <div className="flex gap-2">
                    {[0, 1].map((slot) => {
                      const assigned = rightAssigned[slot]
                      const label = assigned
                        ? panelCatalog.find((p) => p.id === assigned)?.label ?? assigned
                        : `Panel ${slot + 1}`
                      return (
                        <button
                          key={slot}
                          className={cx(
                            "flex-1 py-1.5 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) rounded-lg border transition-all",
                            assigned
                              ? "border-action bg-action/5 text-foreground"
                              : "border-line text-mute-fg hover:border-action/50"
                          )}
                          onClick={() => setPickerSlot(slot)}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Dialogs config panel */}
              {configTab === "popups" && (
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {popups.map((d) => (
                    <div key={d.id} className="space-y-2">
                      <button
                        className={cx(
                          "text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) transition-colors",
                          editingPopupId === d.id ? "text-foreground" : "text-mute-fg hover:text-foreground"
                        )}
                        onClick={() => {
                          const next = editingPopupId === d.id ? null : d.id
                          setEditingPopupId(next)
                          if (next) setPopupPanelIndex(0)
                        }}
                      >
                        {d.name}
                      </button>
                      {editingPopupId === d.id && (
                        <div className="space-y-2">
                          {/* Config toggles */}
                          <div className="space-y-1">
                            <button
                              className={cx(
                                "w-full py-1.5 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) rounded-lg border transition-all",
                                d.modal
                                  ? "border-action bg-action/5 text-foreground"
                                  : "border-line text-mute-fg hover:border-action/50"
                              )}
                              onClick={() => updatePopup(d.id, { modal: !d.modal })}
                            >
                              Modal
                            </button>
                            <button
                              className={cx(
                                "w-full py-1.5 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) rounded-lg border transition-all",
                                d.showCloseButton
                                  ? "border-action bg-action/5 text-foreground"
                                  : "border-line text-mute-fg hover:border-action/50"
                              )}
                              onClick={() => updatePopup(d.id, { showCloseButton: !d.showCloseButton })}
                            >
                              Close
                            </button>
                            <button
                              className={cx(
                                "w-full py-1.5 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) rounded-lg border transition-all",
                                d.showHeader
                                  ? "border-action bg-action/5 text-foreground"
                                  : "border-line text-mute-fg hover:border-action/50"
                              )}
                              onClick={() => updatePopup(d.id, { showHeader: !d.showHeader })}
                            >
                              Header
                            </button>
                            <button
                              className={cx(
                                "w-full py-1.5 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) rounded-lg border transition-all",
                                d.showFooter
                                  ? "border-action bg-action/5 text-foreground"
                                  : "border-line text-mute-fg hover:border-action/50"
                              )}
                              onClick={() => updatePopup(d.id, { showFooter: !d.showFooter })}
                            >
                              Footer
                            </button>
                          </div>
                          {/* Size selector */}
                          <div className="flex gap-2">
                            {(["sm", "md", "lg", "xl", "full"] as const).map((size) => (
                              <button
                                key={size}
                                className={cx(
                                  "flex-1 py-1.5 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) rounded-lg border transition-all",
                                  d.size === size
                                    ? "border-action bg-action/5 text-foreground"
                                    : "border-line text-mute-fg hover:border-action/50"
                                )}
                                onClick={() => updatePopup(d.id, { size })}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                          {/* Panel count selector (max 4) */}
                          <div className="flex gap-2">
                            {[1, 2, 3, 4].map((count) => (
                              <button
                                key={count}
                                className={cx(
                                  "flex-1 py-1.5 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) rounded-lg border transition-all",
                                  d.panelCount === count
                                    ? "border-action bg-action/5 text-foreground"
                                    : "border-line text-mute-fg hover:border-action/50"
                                )}
                                onClick={() => {
                                  updatePopup(d.id, { panelCount: count })
                                  if (popupPanelIndex >= count) setPopupPanelIndex(count - 1)
                                }}
                              >
                                {count}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
          {/* Typography Drawer — slides up from bottom; opened via the
              footer button only. */}
          <div
            className={cx(
              "absolute inset-0 bg-background border-t border-line transition-transform duration-200 ease-out",
              typographyDrawerOpen ? "translate-y-0" : "translate-y-full"
            )}
            onWheel={(e) => e.stopPropagation()}
          >
            <TypographyPanel theme={theme} onThemeChange={setTheme} />
          </div>
        </SlidableColumnContent>

        {/* Footer: Typography toggle */}
        <SlidableColumnFooter className="!p-0">
          <button
            onClick={() => setTypographyDrawerOpen(!typographyDrawerOpen)}
            className={cx(
              "w-full py-3 text-xs font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) transition-colors",
              typographyDrawerOpen
                ? "bg-foreground text-background"
                : "text-mute-fg hover:text-foreground hover:bg-mute/50"
            )}
          >
            Typography
          </button>
        </SlidableColumnFooter>
      </SlidableColumn>

      {/* Right Sidebar */}
      <SlidableColumn
        side="right"
        role="complementary"
        aria-label="Color controls"
        offset={isMobile ? 0 : rightOffset}
        onOffsetChange={handleSetRightOffset}
        hidden={isMobile || rightHidden}
        swapped={swapped}
        className="border-l"
        bottomOffset={0}
      >
        {(colorMode === "B" ? theme.styling.columnHoloB : theme.styling.columnHoloA) && (
          <div className="absolute inset-0 pointer-events-none bg-holo" />
        )}
        {/* Header: A/B variant toggle. */}
        <SlidableColumnHeader>
          <ThemeModeToggle
            mode={colorMode}
            onModeChange={setColorMode}
            labelA={theme.styling.labelA}
            labelB={theme.styling.labelB}
          />
        </SlidableColumnHeader>
        {/* Content: ColorPanel + Style Drawer overlay. overflow-hidden is
            unconditional so the drawer's translateY-full offscreen
            position can never be revealed by parent scroll. ColorPanel
            handles its own internal scrolling on its variable list. */}
        <SlidableColumnContent className="!p-0 relative !overflow-hidden">
          <ColorPanel
            theme={theme}
            onThemeChange={setTheme}
            colorMode={colorMode}
            showCopyCss={false}
          />
          {/* Effects Drawer — slides up from bottom; opened via the
              footer button only. */}
          <div
            className={cx(
              "absolute inset-0 bg-background border-t border-line transition-transform duration-200 ease-out",
              styleDrawerOpen ? "translate-y-0" : "translate-y-full"
            )}
            onWheel={(e) => e.stopPropagation()}
          >
            <EffectsPanel theme={theme} onThemeChange={setTheme} mode={colorMode} />
          </div>
        </SlidableColumnContent>
        {/* Footer: Effects toggle */}
        <SlidableColumnFooter className="!p-0">
          <button
            onClick={() => setStyleDrawerOpen(!styleDrawerOpen)}
            className={cx(
              "w-full py-3 text-xs font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) transition-colors",
              styleDrawerOpen
                ? "bg-foreground text-background"
                : "text-mute-fg hover:text-foreground hover:bg-mute/50"
            )}
          >
            Effects
          </button>
        </SlidableColumnFooter>
      </SlidableColumn>

      {/* Mobile bar — opens the four panel sheets. Hand-rolled here because the
          template runs on the published kit (0.1.0); swap for thrifty-ui's
          BottomBar once the kit is republished. */}
      {isMobile && (
        <div
          data-mobile-bar
          className="absolute bottom-0 left-0 right-0 h-12 bg-background border-t border-line flex items-stretch z-[60]"
        >
          {([
            { label: "Style", Icon: Box, key: "left" },
            { label: "Type", Icon: Type, key: "left-footer" },
            { label: "Effects", Icon: Sparkles, key: "right-footer" },
            { label: "Color", Icon: Palette, key: "right" },
          ] as const).map(({ label, Icon, key }) => (
            <button
              key={key}
              onClick={() => toggleMobileSheet(key)}
              title={label}
              aria-label={label}
              aria-pressed={mobileSheet === key}
              className={cx(
                "flex-1 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-(--theme-letter-spacing) transition-colors",
                mobileSheet === key
                  ? "bg-mute text-foreground"
                  : "text-mute-fg hover:text-foreground hover:bg-mute/50",
              )}
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Panel Picker Dialog — assign content panel to right sidebar slot */}
      {pickerSlot !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-scrim/50" onClick={() => setPickerSlot(null)} />
          <div className="relative w-[320px] bg-background border rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-line flex items-center justify-between">
              <span className="text-xs font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing)">
                Panel {pickerSlot + 1}
              </span>
              <button
                className="text-mute-fg hover:text-foreground transition-colors text-xs"
                onClick={() => setPickerSlot(null)}
              >
                ✕
              </button>
            </div>
            <div>
              {panelCatalog.map((panel) => {
                const isAssigned = allAssigned.includes(panel.id)
                const isThisSlot = rightAssigned[pickerSlot] === panel.id
                return (
                  <SelectableRow
                    key={panel.id}
                    label={panel.label}
                    selected={isThisSlot}
                    disabled={isAssigned && !isThisSlot}
                    onSelect={() => {
                      if (isThisSlot) {
                        clearSlot(pickerSlot)
                      } else {
                        assignToSlot(pickerSlot, panel.id)
                      }
                      setPickerSlot(null)
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Left Column Sheet — convention: leftmost icon opens this.
       *  Mirrors the desktop L column body (Style picker in themes mode). */}
      <Sheet modal={false} open={mobileSheet === "left"} onOpenChange={(open) => { if (!open) setMobileSheet((c) => (c === "left" ? null : c)) }}>
        <SheetContent side="bottom" showCloseButton={false} className="h-[85dvh] p-0 pb-12" onFocusOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => { const t = e.detail.originalEvent.target as Element | null; if (t?.closest("[data-mobile-bar]")) e.preventDefault() }}>
          <SheetHeader className="border-b border-line px-4 py-3">
            <VisuallyHidden>
              <SheetTitle>Styling</SheetTitle>
            </VisuallyHidden>
            {stylingHeaderControls}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            {studioMode === "themes" ? (
              <>
                <div className="px-4 pt-3 pb-1 text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) text-mute-fg">
                  STYLING
                </div>
                <StylePanel theme={theme} onThemeChange={setTheme} />
              </>
            ) : (
              <div className="px-4 py-3 text-[10px] text-mute-fg uppercase tracking-(--theme-letter-spacing)">
                Dashboard config flows
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Right Column Sheet — convention: rightmost icon opens this. */}
      <Sheet modal={false} open={mobileSheet === "right"} onOpenChange={(open) => { if (!open) setMobileSheet((c) => (c === "right" ? null : c)) }}>
        <SheetContent side="bottom" showCloseButton={false} className="h-[85dvh] p-0 pb-12" onFocusOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => { const t = e.detail.originalEvent.target as Element | null; if (t?.closest("[data-mobile-bar]")) e.preventDefault() }}>
          <SheetHeader className="border-b border-line px-4 py-3 space-y-1.5">
            <SheetTitle className="text-xs font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing)">Color</SheetTitle>
            <ThemeModeToggle
              mode={colorMode}
              onModeChange={setColorMode}
              labelA={theme.styling.labelA}
              labelB={theme.styling.labelB}
            />
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <ColorPanel
              theme={theme}
              onThemeChange={setTheme}
              colorMode={colorMode}
              showCopyCss={false}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Typography Sheet — L column footer-region Drawer. */}
      <Sheet modal={false} open={mobileSheet === "left-footer"} onOpenChange={(open) => { if (!open) setMobileSheet((c) => (c === "left-footer" ? null : c)) }}>
        <SheetContent side="bottom" showCloseButton={false} className="h-[85dvh] p-0 pb-12" onFocusOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => { const t = e.detail.originalEvent.target as Element | null; if (t?.closest("[data-mobile-bar]")) e.preventDefault() }}>
          <SheetHeader className="border-b border-line px-4 py-3">
            <SheetTitle className="text-xs font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing)">Typography</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <TypographyPanel theme={theme} onThemeChange={setTheme} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Effects Sheet — R column footer-region Drawer. */}
      <Sheet modal={false} open={mobileSheet === "right-footer"} onOpenChange={(open) => { if (!open) setMobileSheet((c) => (c === "right-footer" ? null : c)) }}>
        <SheetContent side="bottom" showCloseButton={false} className="h-[85dvh] p-0 pb-12" onFocusOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => { const t = e.detail.originalEvent.target as Element | null; if (t?.closest("[data-mobile-bar]")) e.preventDefault() }}>
          <SheetHeader className="border-b border-line px-4 py-3">
            <SheetTitle className="text-xs font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing)">Effects</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <EffectsPanel theme={theme} onThemeChange={setTheme} mode={colorMode} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
    </TooltipProvider>
  )
}

export default App
