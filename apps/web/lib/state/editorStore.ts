import { create } from "zustand";
import { nanoid } from "nanoid";

export type EditorAsset = {
  id: string;
  name: string;
  url: string;
  source: "mock" | "upload" | "ai";
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
  selectLayer: (layerId: string | null) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  toggleLayerVisibility: (layerId: string) => void;
  renameLayer: (layerId: string, name: string) => void;
  setBrushSize: (size: number) => void;
  setPrimaryColor: (hex: string) => void;
};

type EditorStore = EditorHistoryState &
  EditorActions & {
    assets: EditorAsset[];
    activeTool: EditorTool;
    layers: EditorLayer[];
    selectedLayerId: string | null;
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
        state.selectedLayerId === layerId ? null : state.selectedLayerId
    })),
  selectLayer: (layerId) => set(() => ({ selectedLayerId: layerId })),
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
  setBrushSize: (size) =>
    set((state) => ({
      toolProps: { ...state.toolProps, brushSize: Math.max(1, Math.min(256, size)) }
    })),
  setPrimaryColor: (hex) =>
    set((state) => ({ toolProps: { ...state.toolProps, primaryColor: hex } }))
}));
