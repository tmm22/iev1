import { describe, it, expect } from "vitest";
import { useEditorStore as originalStore } from "./editorStore";

// Create an isolated store for tests by reusing the store's initializer if exported.
// Fallback: lightly exercise actions via the real store instance (acceptable for unit smoke tests).

describe("editorStore", () => {
  it("adds, duplicates, reorders and removes layers", () => {
    const store = originalStore;
    // add a base layer
    store.getState().addLayer("Layer 1");

    expect(store.getState().layers.length).toBeGreaterThan(0);

    const firstId = store.getState().layers[0].id;
    store.getState().duplicateLayer(firstId);
    // initial base layer + added + duplicate = 3
    expect(store.getState().layers.length).toBe(3);

    // Move duplicated layer
    const secondId = store.getState().layers[1].id;
    store.getState().moveLayerUp(secondId);

    // Remove
    store.getState().removeLayer(firstId);
    expect(store.getState().layers.length).toBe(2);

    // cleanup
    store.setState({ layers: [], selectedLayerId: null });
  });
});
