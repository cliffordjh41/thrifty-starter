import { useState } from "react"
import { useNavigate } from "react-router"
import {
  SlidableColumn,
  SlidableColumnHeader,
  SlidableColumnContent,
  SlidableColumnHandles,
  ColumnToolBar,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  useAnchoredZoom,
  useIsMobile,
  cx,
} from "thrifty-ui"
import {
  MousePointer2,
  PenTool,
  Square,
  Circle,
  Type,
  Ruler,
  Hand,
  Spline,
  Eraser,
  Grid3x3,
  Eye,
  ArrowLeft,
  Layers,
  PencilRuler,
} from "lucide-react"
import { Blueprint } from "../lib/Blueprint"

// `/columns` — the design-tool host demo, full-viewport (sibling to the Layout
// shell). Tool palettes ride in slidable columns that the bottom toolbar slides
// off-edge to reclaim the canvas; the canvas zooms cursor-anchored via
// useAnchoredZoom, with the Blueprint mock behind it.
//
// Mobile mirrors studio: the columns hide and their content moves into bottom
// sheets opened from a mobile bar (Tools · Back · Layers). Wheel zoom is
// desktop-only (no touch pinch), so the zoom readout hides on mobile.

const TOOLBAR_PX = 32 // desktop ColumnToolBar height (h-8)
const MOBILE_BAR_PX = 48 // mobile bar height (h-12)

const TOOLS = [
  { icon: MousePointer2, label: "Select" },
  { icon: Hand, label: "Pan" },
  { icon: PenTool, label: "Pen" },
  { icon: Spline, label: "Curve" },
  { icon: Square, label: "Rectangle" },
  { icon: Circle, label: "Ellipse" },
  { icon: Type, label: "Text" },
  { icon: Ruler, label: "Dimension" },
  { icon: Eraser, label: "Erase" },
  { icon: Grid3x3, label: "Snap to grid" },
]

const LAYERS = ["Grid", "Part A — plate", "Part B — rotor", "Dimensions", "Title block"]

function barBtnClass(active: boolean) {
  return cx(
    "flex items-center gap-1.5 px-6 text-[10px] uppercase tracking-(--theme-letter-spacing) transition-colors",
    active ? "bg-mute text-foreground" : "text-mute-fg hover:text-foreground hover:bg-mute/50"
  )
}

export function Columns() {
  const [leftOffset, setLeftOffset] = useState(0)
  const [rightOffset, setRightOffset] = useState(0)
  const [leftHidden, setLeftHidden] = useState(false)
  const [rightHidden, setRightHidden] = useState(false)
  const [swapped, setSwapped] = useState(false)
  const [mobileSheet, setMobileSheet] = useState<"tools" | "layers" | null>(null)

  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const zoom = useAnchoredZoom({ min: 1, max: 8 })

  const barPx = isMobile ? MOBILE_BAR_PX : TOOLBAR_PX
  const toggleSheet = (t: "tools" | "layers") =>
    setMobileSheet((c) => (c === t ? null : t))

  // Shared bodies — rendered in the desktop columns and the mobile sheets.
  const toolsBody = (
    <div className="grid grid-cols-2 gap-1.5 content-start p-2">
      {TOOLS.map(({ icon: Icon, label }) => (
        <button
          key={label}
          title={label}
          className="flex items-center gap-2 rounded border border-line px-2 py-2 text-[11px] text-mute-fg hover:text-foreground hover:bg-mute/50 transition-colors"
        >
          <Icon className="size-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </button>
      ))}
    </div>
  )

  const layersBody = (
    <div className="space-y-3 p-2">
      <div className="space-y-1">
        {LAYERS.map((name) => (
          <div
            key={name}
            className="flex items-center justify-between rounded border border-line px-2 py-1.5 text-[11px] text-foreground/80"
          >
            <span className="truncate">{name}</span>
            <Eye className="size-3.5 shrink-0 text-mute-fg" />
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-line pt-3">
        <p className="text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg">
          Properties
        </p>
        {["Stroke", "Opacity", "Corner"].map((p) => (
          <div key={p} className="space-y-1">
            <div className="flex justify-between text-[10px] text-mute-fg">
              <span>{p}</span>
              <span className="text-foreground/70">—</span>
            </div>
            <div className="h-1 rounded bg-mute">
              <div className="h-full w-1/2 rounded bg-foreground/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background text-foreground select-none">
      {/* Canvas — clipping viewport above the bottom bar; columns overlay it,
          so hiding them reveals the full work surface. */}
      <div
        ref={zoom.containerRef}
        className="absolute left-0 right-0 top-0 overflow-hidden cursor-crosshair"
        style={{ bottom: barPx }}
      >
        <div
          className="absolute inset-0"
          style={{ transform: zoom.transform, transformOrigin: "0 0" }}
        >
          <Blueprint />
        </div>
      </div>

      {/* Zoom readout + reset — desktop only (no wheel zoom on touch). */}
      {!isMobile && (
        <div
          className="absolute left-3 z-20 flex items-center gap-2 rounded border border-line bg-background/80 px-2 py-1 text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg backdrop-blur-sm"
          style={{ bottom: barPx + 12 }}
        >
          <span>scale {zoom.scale.toFixed(2)}×</span>
          <button onClick={zoom.reset} className="text-foreground hover:underline">
            reset
          </button>
        </div>
      )}

      {/* Left column — Tools palette. Hidden on mobile (content moves to a sheet). */}
      <SlidableColumn
        side="left"
        offset={isMobile ? 0 : leftOffset}
        onOffsetChange={setLeftOffset}
        hidden={isMobile || leftHidden}
        swapped={swapped}
        bottomOffset={barPx}
      >
        <SlidableColumnHeader className="h-11 flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            title="Back to home"
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3" />
            back
          </button>
          <span className="text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg">
            Tools
          </span>
        </SlidableColumnHeader>
        <SlidableColumnContent className="!p-0">{toolsBody}</SlidableColumnContent>
        <SlidableColumnHandles />
      </SlidableColumn>

      {/* Right column — Layers / properties inspector. Hidden on mobile. */}
      <SlidableColumn
        side="right"
        offset={isMobile ? 0 : rightOffset}
        onOffsetChange={setRightOffset}
        hidden={isMobile || rightHidden}
        swapped={swapped}
        bottomOffset={barPx}
      >
        <SlidableColumnHeader className="h-11 flex items-center">
          <span className="text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg">
            Layers
          </span>
        </SlidableColumnHeader>
        <SlidableColumnContent className="!p-0">{layersBody}</SlidableColumnContent>
        <SlidableColumnHandles />
      </SlidableColumn>

      {/* Bottom bar — desktop: column controls; mobile: open Tools/Layers + back. */}
      {isMobile ? (
        <div
          data-mobile-bar
          className="absolute bottom-0 left-0 right-0 h-12 bg-background border-t border-line flex items-stretch justify-between z-[60]"
        >
          <button onClick={() => toggleSheet("tools")} className={barBtnClass(mobileSheet === "tools")}>
            <PencilRuler className="size-4" />
            <span>Tools</span>
          </button>
          <button onClick={() => toggleSheet("layers")} className={barBtnClass(mobileSheet === "layers")}>
            <Layers className="size-4" />
            <span>Layers</span>
          </button>
        </div>
      ) : (
        <ColumnToolBar
          isMobile={false}
          leftOffset={leftOffset}
          rightOffset={rightOffset}
          setLeftOffset={setLeftOffset}
          setRightOffset={setRightOffset}
          swapped={swapped}
          setSwapped={setSwapped}
          leftHidden={leftHidden}
          setLeftHidden={setLeftHidden}
          rightHidden={rightHidden}
          setRightHidden={setRightHidden}
        />
      )}

      {/* Mobile sheets — non-modal so the bar stays live to switch between them. */}
      <Sheet modal={false} open={mobileSheet === "tools"} onOpenChange={(o) => { if (!o) setMobileSheet((c) => (c === "tools" ? null : c)) }}>
        <SheetContent side="bottom" showCloseButton={false} className="h-[60dvh] p-0 pb-12" onFocusOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => { const t = e.detail.originalEvent.target as Element | null; if (t?.closest("[data-mobile-bar]")) e.preventDefault() }}>
          <SheetHeader className="border-b border-line px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/home")}
                title="Back to home"
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-(--theme-letter-spacing) text-mute-fg hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3" />
                back
              </button>
              <SheetTitle className="text-xs font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing)">Tools</SheetTitle>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">{toolsBody}</div>
        </SheetContent>
      </Sheet>

      <Sheet modal={false} open={mobileSheet === "layers"} onOpenChange={(o) => { if (!o) setMobileSheet((c) => (c === "layers" ? null : c)) }}>
        <SheetContent side="bottom" showCloseButton={false} className="h-[60dvh] p-0 pb-12" onFocusOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => { const t = e.detail.originalEvent.target as Element | null; if (t?.closest("[data-mobile-bar]")) e.preventDefault() }}>
          <SheetHeader className="border-b border-line px-4 py-3">
            <SheetTitle className="text-xs font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) text-center">Layers</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">{layersBody}</div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
