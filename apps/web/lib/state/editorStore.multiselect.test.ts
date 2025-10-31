import { describe, it, expect } from 'vitest';
import { act } from '@testing-library/react';
import { useEditorStore } from './editorStore';

describe('editorStore multi-select & groups', () => {
  it('can multi-select and group/ungroup', () => {
    // reset store
    const resetLayers = [
      { id: 'a', name: 'A', visible: true, opacity: 1 },
      { id: 'b', name: 'B', visible: true, opacity: 1 },
      { id: 'c', name: 'C', visible: true, opacity: 1 }
    ];
    act(() => {
      useEditorStore.setState({ layers: resetLayers as any, selectedLayerId: null, selectedLayerIds: [] });
    });

    act(() => {
      useEditorStore.getState().selectLayer('a');
      (useEditorStore.getState() as any).toggleSelectLayer('b');
    });

    const sel1 = (useEditorStore.getState() as any).selectedLayerIds as string[];
    expect(sel1.sort()).toEqual(['a','b']);

    act(() => {
      (useEditorStore.getState() as any).groupSelection();
    });

    const layersAfterGroup = useEditorStore.getState().layers;
    const gids = layersAfterGroup.map((l) => l.groupId || null);
    // a and b share a non-empty groupId; c has none
    expect(gids.filter(Boolean).length).toBe(2);
    const gidA = (layersAfterGroup.find(l => l.id==='a') as any).groupId;
    const gidB = (layersAfterGroup.find(l => l.id==='b') as any).groupId;
    expect(gidA && gidB && gidA === gidB).toBe(true);
    expect((layersAfterGroup.find(l => l.id==='c') as any).groupId).toBeUndefined();

    act(() => {
      (useEditorStore.getState() as any).ungroupSelection();
    });

    const layersAfterUngroup = useEditorStore.getState().layers;
    expect((layersAfterUngroup.find(l => l.id==='a') as any).groupId).toBeUndefined();
    expect((layersAfterUngroup.find(l => l.id==='b') as any).groupId).toBeUndefined();
  });
});
