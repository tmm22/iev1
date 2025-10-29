import { create } from "zustand";

export type EditorAsset = {
  id: string;
  name: string;
  url: string;
  source: "mock" | "upload" | "ai";
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
};

type EditorStore = EditorHistoryState &
  EditorActions & {
    assets: EditorAsset[];
  };

const initialHistory: EditorHistoryState = {
  history: ["Initial placeholder state"],
  historyIndex: 0
};

const MAX_HISTORY = 20;

export const useEditorStore = create<EditorStore>((set) => ({
  ...initialHistory,
  assets: [],
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
    }))
}));
