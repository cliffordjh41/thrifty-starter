import { create } from "zustand"
import { DEFAULT_THEME, type Theme } from "thrifty-ui"

// Content panel identifiers — the pre-built panels reachable from the
// studio's panel-assignment slots. Aligned with the keep-list (the 15
// mature panels plus SubstrateLattice2D); legacy "notes" / "links" /
// "resume" entries dropped after their *Preview files were archived
// at .archive/2026-05-17-preview-naming-strip/.
export type ContentPanelId = "music" | "ai-chat"

// Column config — two fixed instances (left + right)
export interface ColumnConfig {
  side: "left" | "right"
  hidden: boolean
  zIndex: number
  showHandles: boolean
  showHeader: boolean
  showFooter: boolean
  showDrawer: boolean
  panelCount: number
  panelLabels: string[]
}

// Popup config — 2 fixed instances (Popup 1 + Popup 2)
export interface PopupConfig {
  id: string
  name: string
  modal: boolean
  size: "sm" | "md" | "lg" | "xl" | "full"
  showCloseButton: boolean
  showHeader: boolean
  showFooter: boolean
  panelCount: number
  panelLabels: string[]
  panels: ContentPanelId[]
}

// Sliding panel assignment for a container
export interface PanelAssignment {
  containerId: string // "column-left", "column-right", or popup id
  panels: ContentPanelId[]
}

interface StudioState {
  // Theme config
  theme: Theme

  // Column configs (fixed — always left + right)
  leftColumn: ColumnConfig
  rightColumn: ColumnConfig

  // Popup instances (fixed — always Popup 1 + Popup 2)
  popups: PopupConfig[]

  // Panel assignments per container
  panelAssignments: PanelAssignment[]

  // Actions — theme
  setTheme: (theme: Theme) => void

  // Actions — columns
  updateLeftColumn: (updates: Partial<ColumnConfig>) => void
  updateRightColumn: (updates: Partial<ColumnConfig>) => void

  // Actions — popups
  updatePopup: (id: string, updates: Partial<PopupConfig>) => void

  // Actions — panel assignments
  setPanelAssignment: (containerId: string, panels: ContentPanelId[]) => void
}

export const useStudioStore = create<StudioState>((set) => ({
  // Theme
  theme: DEFAULT_THEME,

  // Columns — defaults
  leftColumn: {
    side: "left",
    hidden: false,
    zIndex: 10,
    showHandles: true,
    showHeader: true,
    showFooter: false,
    showDrawer: false,
    panelCount: 1,
    panelLabels: [],
  },
  rightColumn: {
    side: "right",
    hidden: false,
    zIndex: 10,
    showHandles: true,
    showHeader: true,
    showFooter: false,
    showDrawer: false,
    panelCount: 1,
    panelLabels: [],
  },

  // Popups — 2 fixed instances
  popups: [
    {
      id: "popup-1",
      name: "Popup 1",
      modal: true,
      size: "md",
      showCloseButton: true,
      showHeader: true,
      showFooter: false,
      panelCount: 1,
      panelLabels: [],
      panels: [],
    },
    {
      id: "popup-2",
      name: "Popup 2",
      modal: true,
      size: "md",
      showCloseButton: true,
      showHeader: true,
      showFooter: false,
      panelCount: 1,
      panelLabels: [],
      panels: [],
    },
  ],

  // Panel assignments — empty
  panelAssignments: [],

  // Actions — theme
  setTheme: (theme) => set({ theme }),

  // Actions — columns
  updateLeftColumn: (updates) =>
    set((s) => ({ leftColumn: { ...s.leftColumn, ...updates } })),
  updateRightColumn: (updates) =>
    set((s) => ({ rightColumn: { ...s.rightColumn, ...updates } })),

  // Actions — popups
  updatePopup: (id, updates) =>
    set((s) => ({
      popups: s.popups.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),

  // Actions — panel assignments
  setPanelAssignment: (containerId, panels) =>
    set((s) => {
      const existing = s.panelAssignments.findIndex(
        (a) => a.containerId === containerId
      )
      if (existing >= 0) {
        const updated = [...s.panelAssignments]
        updated[existing] = { containerId, panels }
        return { panelAssignments: updated }
      }
      return {
        panelAssignments: [...s.panelAssignments, { containerId, panels }],
      }
    }),
}))
