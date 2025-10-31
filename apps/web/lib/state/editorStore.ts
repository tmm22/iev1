import { create } from "zustand";
import { nanoid } from "nanoid";

export type EditorAsset = {
  id: string;
  name: string;
  url: string;
  source: "mock" | "upload" | "ai";
};

export type AiQuality = "standard" | "high";
export type AiJobStatus = "queued" | "generating" | "succeeded" | "failed";
export type AiPreview = { id: string; url: string };
export type AiProvider = "auto" | "gemini" | "openai";
export type AiJob = {
  id: string;
  prompt: string;
  provider: AiProvider;
  size: { width: number; height: number };
  quality: AiQuality;
  status: AiJobStatus;
  previews: AiPreview[];
  createdAt: number;
  error?: string;
};

export type EditorTool =
  | "select"
  | "hand"
  | "brush"
  | "eraser"
  | "text"
  | "shape"
  | "zoom";

export type EditorLayer = {
  id: string;
  name: string;
  visible: boolean;
  opacity: number; // 0..1
  kind?: "image" | "group" | "shape" | "text" | "drawing";
  imageUrl?: string; // when kind === 'image'
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number; // degrees
  groupId?: string; // optional logical group membership
};

type EditorHistoryState = {
  history: string[];
  historyIndex: number;
};

type EditorActions = {
  pushState: (snapshot: string) => void;
  undo: () => void;
  redo: () => void;
  addAsset: (asset: EditorAsset) => void;
  removeAsset: (assetId: string) => void;
  setActiveTool: (tool: EditorTool) => void;
  addLayer: (name?: string) => void;
  removeLayer: (layerId: string) => void;
  // Selection (single/multi)
  selectLayer: (layerId: string | null) => void; // replaces selection
  toggleSelectLayer: (layerId: string) => void; // add/remove from selection
  clearSelection: () => void;
  setSelection: (ids: string[]) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  toggleLayerVisibility: (layerId: string) => void;
  renameLayer: (layerId: string, name: string) => void;
  moveLayer: (fromIndex: number, toIndex: number) => void;
  moveLayerUp: (layerId: string) => void;
  moveLayerDown: (layerId: string) => void;
  duplicateLayer: (layerId: string) => void;
  setLayerTransform: (
    layerId: string,
    patch: Partial<Pick<EditorLayer, "x" | "y" | "width" | "height" | "rotation">>
  ) => void;
  nudgeLayer: (layerId: string, dx: number, dy: number) => void;
  // Multi-selection helpers
  nudgeSelected: (dx: number, dy: number) => void;
  removeSelected: () => void;
  groupSelection: () => void; // assign a shared groupId to selected items
  ungroupSelection: () => void; // clear groupId on selected items
  setBrushSize: (size: number) => void;
  setPrimaryColor: (hex: string) => void;
  queueInsertAssetUrl: (url: string) => void;
  clearPendingInsert: () => void;
  createAiJob: (job: AiJob) => void;
  updateAiJob: (id: string, patch: Partial<AiJob>) => void;
  addAiPreview: (id: string, preview: AiPreview) => void;
};

type EditorStore = EditorHistoryState &
  EditorActions & {
    assets: EditorAsset[];
    activeTool: EditorTool;
    layers: EditorLayer[];
    selectedLayerId: string | null; // primary (last) selected for single-target actions
    selectedLayerIds: string[]; // full multi-selection set
    pendingInsertAssetUrl: string | null;
    aiJobs: AiJob[];
    toolProps: {
      brushSize: number; // px
      primaryColor: string; // #RRGGBB
    };
  };

const initialHistory: EditorHistoryState = {
  history: ["Initial placeholder state"],
  historyIndex: 0
};

const MAX_HISTORY = 20;

export const useEditorStore = create<EditorStore>((set) => ({
  ...initialHistory,
  assets: [],
  activeTool: "select",
  layers: [
    {
      id: nanoid(),
      name: "Base Layer",
      visible: true,
      opacity: 1
    }
  ],
  selectedLayerId: null,
  selectedLayerIds: [],
  pendingInsertAssetUrl: null,
  aiJobs: [],
  toolProps: {
    brushSize: 16,
    primaryColor: "#8b5cf6" // violet-500
  },
  pushState: (snapshot) =>
    set((state) => {
      const truncatedHistory = state.history
        .slice(0, state.historyIndex + 1)
        .concat(snapshot)
        .slice(-MAX_HISTORY);
      return {
        history: truncatedHistory,
        historyIndex: truncatedHistory.length - 1
      };
    }),
  undo: () =>
    set((state) => ({
      historyIndex: Math.max(0, state.historyIndex - 1)
    })),
  redo: () =>
    set((state) => ({
      historyIndex: Math.min(state.history.length - 1, state.historyIndex + 1)
    })),
  addAsset: (asset) =>
    set((state) => ({
      assets: state.assets.concat(asset)
    })),
  removeAsset: (assetId) =>
    set((state) => ({
      assets: state.assets.filter((entry) => entry.id !== assetId)
    })),
  // Signal to canvas that an asset should be inserted
  queueInsertAssetUrl: (url: string) => set(() => ({ pendingInsertAssetUrl: url })),
  clearPendingInsert: () => set(() => ({ pendingInsertAssetUrl: null })),
  createAiJob: (job) =>
    set((state) => ({ aiJobs: [job, ...state.aiJobs].slice(0, 50) })),
  updateAiJob: (id, patch) =>
    set((state) => ({
      aiJobs: state.aiJobs.map((j) => (j.id === id ? { ...j, ...patch } : j))
    })),
  addAiPreview: (id, preview) =>
    set((state) => ({
      aiJobs: state.aiJobs.map((j) =>
        j.id === id ? { ...j, previews: [...j.previews, preview] } : j
      )
    })),
  setActiveTool: (tool) => set(() => ({ activeTool: tool })),
  addLayer: (name) =>
    set((state) => ({
      layers: state.layers.concat({
        id: nanoid(),
        name: name ?? `Layer ${state.layers.length + 1}`,
        visible: true,
        opacity: 1
      })
    })),
  removeLayer: (layerId) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== layerId),
      selectedLayerId:
        state.selectedLayerId === layerId ? null : state.selectedLayerId,
      selectedLayerIds: state.selectedLayerIds.filter((id) => id !== layerId)
    })),
  selectLayer: (layerId) =>
    set(() => ({
      selectedLayerId: layerId,
      selectedLayerIds: layerId ? [layerId] : []
    })),
  toggleSelectLayer: (layerId) =>
    set((state) => {
      const exists = state.selectedLayerIds.includes(layerId);
      const next = exists
        ? state.selectedLayerIds.filter((id) => id !== layerId)
        : [...state.selectedLayerIds, layerId];
      return {
        selectedLayerIds: next,
        selectedLayerId: next.length > 0 ? next[next.length - 1] : null
      };
    }),
  clearSelection: () => set(() => ({ selectedLayerId: null, selectedLayerIds: [] })),
  setSelection: (ids) => set(() => ({ selectedLayerIds: ids.slice(), selectedLayerId: ids[ids.length - 1] ?? null })),
  setLayerOpacity: (layerId, opacity) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, opacity: Math.max(0, Math.min(1, opacity)) } : l
      )
    })),
  toggleLayerVisibility: (layerId) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, visible: !l.visible } : l
      )
    })),
  renameLayer: (layerId, name) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, name } : l))
    })),
  moveLayer: (fromIndex, toIndex) =>
    set((state) => {
      const layers = state.layers.slice();
      const clampedFrom = Math.max(0, Math.min(layers.length - 1, fromIndex));
      const clampedTo = Math.max(0, Math.min(layers.length - 1, toIndex));
      if (clampedFrom === clampedTo) return {} as any;
      const [moved] = layers.splice(clampedFrom, 1);
      layers.splice(clampedTo, 0, moved);
      return { layers };
    }),
  moveLayerUp: (layerId) =>
    set((state) => {
      const idx = state.layers.findIndex((l) => l.id === layerId);
      if (idx <= 0) return {} as any;
      const layers = state.layers.slice();
      const [m] = layers.splice(idx, 1);
      layers.splice(idx - 1, 0, m);
      return { layers };
    }),
  moveLayerDown: (layerId) =>
    set((state) => {
      const idx = state.layers.findIndex((l) => l.id === layerId);
      if (idx < 0 || idx >= state.layers.length - 1) return {} as any;
      const layers = state.layers.slice();
      const [m] = layers.splice(idx, 1);
      layers.splice(idx + 1, 0, m);
      return { layers };
    }),
  duplicateLayer: (layerId) =>
    set((state) => {
      const idx = state.layers.findIndex((l) => l.id === layerId);
      if (idx < 0) return {} as any;
      const layers = state.layers.slice();
      const orig = layers[idx];
      const dup = { ...orig, id: nanoid(), name: `${orig.name} copy` };
      layers.splice(idx + 1, 0, dup);
      return { layers, selectedLayerId: dup.id };
    }),
  setLayerTransform: (layerId, patch) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, ...patch } : l))
    })),
  nudgeLayer: (layerId, dx, dy) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId
          ? { ...l, x: Math.round((l.x ?? 0) + dx), y: Math.round((l.y ?? 0) + dy) }
          : l
      )
    })),
  nudgeSelected: (dx, dy) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        state.selectedLayerIds.includes(l.id)
          ? { ...l, x: Math.round((l.x ?? 0) + dx), y: Math.round((l.y ?? 0) + dy) }
          : l
      )
    })),
  removeSelected: () =>
    set((state) => ({
      layers: state.layers.filter((l) => !state.selectedLayerIds.includes(l.id)),
      selectedLayerId: null,
      selectedLayerIds: []
    })),
  groupSelection: () =>
    set((state) => {
      if (state.selectedLayerIds.length < 2) return {} as any;
      const gid = nanoid();
      return {
        layers: state.layers.map((l) =>
          state.selectedLayerIds.includes(l.id) ? { ...l, groupId: gid } : l
        )
      };
    }),
  ungroupSelection: () =>
    set((state) => ({
      layers: state.layers.map((l) =>
        state.selectedLayerIds.includes(l.id) ? { ...l, groupId: undefined } : l
      )
    })),
  setBrushSize: (size) =>
    set((state) => ({
      toolProps: { ...state.toolProps, brushSize: Math.max(1, Math.min(256, size)) }
    })),
  setPrimaryColor: (hex) =>
    set((state) => ({ toolProps: { ...state.toolProps, primaryColor: hex } }))
}));
