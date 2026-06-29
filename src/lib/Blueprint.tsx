// Static blueprint scene for the /artboard demo. Pure SVG, no state — its
// only job is to carry fine linework, small holes, and tiny title-block text
// that stay crisp and become legible as the anchored zoom scales in, so the
// zoom has something worth zooming into. viewBox is the drawing's own mm-ish
// coordinate space; the consumer scales the whole <svg> via a CSS transform.

const W = 1600
const H = 1000

const INK = "#cfe6fb" // light cyan-white ink (linework)
const INK_DIM = "#7fb1da"
const GRID_MINOR = "#163a5f"
const GRID_MAJOR = "#23527e"
const PAPER = "#0b2545"
const ACCENT = "#5fa8e6"

const MINOR = 25
const MAJOR = 100

function gridLines() {
  const lines: React.ReactNode[] = []
  for (let x = 0; x <= W; x += MINOR) {
    const major = x % MAJOR === 0
    lines.push(
      <line
        key={`vx${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={H}
        stroke={major ? GRID_MAJOR : GRID_MINOR}
        strokeWidth={major ? 0.8 : 0.4}
      />
    )
  }
  for (let y = 0; y <= H; y += MINOR) {
    const major = y % MAJOR === 0
    lines.push(
      <line
        key={`hy${y}`}
        x1={0}
        y1={y}
        x2={W}
        y2={y}
        stroke={major ? GRID_MAJOR : GRID_MINOR}
        strokeWidth={major ? 0.8 : 0.4}
      />
    )
  }
  return lines
}

// Horizontal dimension line with end ticks + centered label above.
function DimH({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g stroke={INK_DIM} strokeWidth={0.6} fill="none">
      <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} />
      <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} />
      <line x1={x1} y1={y} x2={x2} y2={y} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text
        x={(x1 + x2) / 2}
        y={y - 5}
        fill={INK_DIM}
        stroke="none"
        fontSize={11}
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
      >
        {label}
      </text>
    </g>
  )
}

function DimV({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  return (
    <g stroke={INK_DIM} strokeWidth={0.6} fill="none">
      <line x1={x - 6} y1={y1} x2={x + 6} y2={y1} />
      <line x1={x - 6} y1={y2} x2={x + 6} y2={y2} />
      <line x1={x} y1={y1} x2={x} y2={y2} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text
        x={x - 8}
        y={(y1 + y2) / 2}
        fill={INK_DIM}
        stroke="none"
        fontSize={11}
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
        transform={`rotate(-90 ${x - 8} ${(y1 + y2) / 2})`}
      >
        {label}
      </text>
    </g>
  )
}

// Leader callout: a dot on the feature, a kinked leader, and small text.
function Callout({ x, y, tx, ty, text }: { x: number; y: number; tx: number; ty: number; text: string }) {
  return (
    <g stroke={ACCENT} strokeWidth={0.6}>
      <circle cx={x} cy={y} r={2} fill={ACCENT} stroke="none" />
      <line x1={x} y1={y} x2={tx} y2={ty} />
      <line x1={tx} y1={ty} x2={tx + 70} y2={ty} />
      <text
        x={tx + 4}
        y={ty - 3}
        fill={INK}
        stroke="none"
        fontSize={9}
        fontFamily="ui-monospace, monospace"
      >
        {text}
      </text>
    </g>
  )
}

export function Blueprint() {
  // Bolt-hole pattern for the plate.
  const plate = { x: 220, y: 300, w: 520, h: 360 }
  const inset = 40
  const holes = [
    [plate.x + inset, plate.y + inset],
    [plate.x + plate.w - inset, plate.y + inset],
    [plate.x + inset, plate.y + plate.h - inset],
    [plate.x + plate.w - inset, plate.y + plate.h - inset],
  ]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      style={{ display: "block", background: PAPER }}
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={INK_DIM} />
        </marker>
      </defs>

      {gridLines()}

      {/* Sheet border + inner margin */}
      <rect x={12} y={12} width={W - 24} height={H - 24} fill="none" stroke={INK_DIM} strokeWidth={1} />
      <rect x={28} y={28} width={W - 56} height={H - 56} fill="none" stroke={GRID_MAJOR} strokeWidth={0.6} />

      {/* ── Part A: flanged plate with bore + bolt circle ── */}
      <g fill="none" stroke={INK} strokeWidth={1.4}>
        <rect x={plate.x} y={plate.y} width={plate.w} height={plate.h} rx={14} />
        <circle cx={plate.x + plate.w / 2} cy={plate.y + plate.h / 2} r={86} />
        <circle cx={plate.x + plate.w / 2} cy={plate.y + plate.h / 2} r={56} stroke={INK_DIM} strokeWidth={0.8} />
        {/* centre cross */}
        <line x1={plate.x + plate.w / 2 - 100} y1={plate.y + plate.h / 2} x2={plate.x + plate.w / 2 + 100} y2={plate.y + plate.h / 2} stroke={ACCENT} strokeWidth={0.5} strokeDasharray="8 4 2 4" />
        <line x1={plate.x + plate.w / 2} y1={plate.y + plate.h / 2 - 100} x2={plate.x + plate.w / 2} y2={plate.y + plate.h / 2 + 100} stroke={ACCENT} strokeWidth={0.5} strokeDasharray="8 4 2 4" />
        {holes.map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={13} />
            <line x1={cx - 18} y1={cy} x2={cx + 18} y2={cy} stroke={ACCENT} strokeWidth={0.4} />
            <line x1={cx} y1={cy - 18} x2={cx} y2={cy + 18} stroke={ACCENT} strokeWidth={0.4} />
          </g>
        ))}
      </g>
      <DimH x1={plate.x} x2={plate.x + plate.w} y={plate.y - 22} label="520.0" />
      <DimV x={plate.x - 22} y1={plate.y} y2={plate.y + plate.h} label="360.0" />
      <Callout x={holes[1][0]} y={holes[1][1]} tx={plate.x + plate.w + 40} ty={plate.y + 30} text="Ø13 THRU ×4" />
      <Callout x={plate.x + plate.w / 2 + 86} y={plate.y + plate.h / 2} tx={plate.x + plate.w + 40} ty={plate.y + plate.h / 2 + 30} text="BORE Ø172 H7" />

      {/* ── Part B: rotor blank, concentric + radial ticks ── */}
      <g fill="none" stroke={INK} strokeWidth={1.4}>
        <circle cx={1140} cy={560} r={190} />
        <circle cx={1140} cy={560} r={150} stroke={INK_DIM} strokeWidth={0.8} />
        <circle cx={1140} cy={560} r={40} />
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * Math.PI) / 12
          const r0 = 150
          const r1 = i % 2 === 0 ? 190 : 172
          return (
            <line
              key={i}
              x1={1140 + r0 * Math.cos(a)}
              y1={560 + r0 * Math.sin(a)}
              x2={1140 + r1 * Math.cos(a)}
              y2={560 + r1 * Math.sin(a)}
              stroke={INK_DIM}
              strokeWidth={0.6}
            />
          )
        })}
        <line x1={950} y1={560} x2={1330} y2={560} stroke={ACCENT} strokeWidth={0.5} strokeDasharray="8 4 2 4" />
        <line x1={1140} y1={370} x2={1140} y2={750} stroke={ACCENT} strokeWidth={0.5} strokeDasharray="8 4 2 4" />
      </g>
      <Callout x={1140 + 190} y={560} tx={1140 + 210} ty={460} text="R190.0" />
      <Callout x={1140} y={560 + 40} tx={1140 - 250} ty={760} text="HUB Ø80 ×2 KEYWAY" />

      {/* ── Title block, lower-right. Tiny text — legible only zoomed in ── */}
      <g transform={`translate(${W - 28 - 360} ${H - 28 - 150})`}>
        <rect x={0} y={0} width={360} height={150} fill="none" stroke={INK} strokeWidth={1} />
        <line x1={0} y1={40} x2={360} y2={40} stroke={INK} strokeWidth={0.6} />
        <line x1={0} y1={100} x2={360} y2={100} stroke={INK} strokeWidth={0.6} />
        <line x1={230} y1={40} x2={230} y2={150} stroke={INK} strokeWidth={0.6} />
        <line x1={0} y1={125} x2={230} y2={125} stroke={INK_DIM} strokeWidth={0.4} />
        <g fill={INK} stroke="none" fontFamily="ui-monospace, monospace">
          <text x={10} y={26} fontSize={15} letterSpacing={1}>THRIFTY · ARTBOARD</text>
          <text x={10} y={60} fontSize={9} fill={INK_DIM}>DRAWN</text>
          <text x={10} y={75} fontSize={11}>C. HEENAN</text>
          <text x={10} y={94} fontSize={9} fill={INK_DIM}>units</text>
          <text x={10} y={119} fontSize={9} fill={INK_DIM}>SCALE</text>
          <text x={120} y={119} fontSize={9} fill={INK_DIM}>PROJ</text>
          <text x={10} y={143} fontSize={11}>1 : 1</text>
          <text x={120} y={143} fontSize={11}>TU-01</text>
          <text x={240} y={60} fontSize={9} fill={INK_DIM}>SHEET</text>
          <text x={240} y={78} fontSize={13}>01 / 01</text>
          <text x={240} y={118} fontSize={9} fill={INK_DIM}>REV</text>
          <text x={240} y={140} fontSize={13} fill={ACCENT}>A</text>
        </g>
      </g>

      {/* Revision note + datum flag, small */}
      <g fontFamily="ui-monospace, monospace">
        <text x={60} y={H - 60} fill={INK_DIM} fontSize={9}>REV A — initial release · wheel to zoom toward cursor · slide the tool columns off-edge</text>
        <rect x={plate.x - 4} y={plate.y + plate.h + 14} width={20} height={16} fill="none" stroke={ACCENT} strokeWidth={0.8} />
        <text x={plate.x + 6} y={plate.y + plate.h + 27} fill={ACCENT} fontSize={11} textAnchor="middle">A</text>
      </g>
    </svg>
  )
}
