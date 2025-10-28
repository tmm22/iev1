type Canvas = {
  id: string;
  title: string;
  updatedAt: string;
};

type Project = {
  id: string;
  name: string;
};

export async function fetchProjects(): Promise<Project[]> {
  return [
    { id: "proj_mock_1", name: "Launch Campaign" },
    { id: "proj_mock_2", name: "Brand Illustrations" }
  ];
}

export async function fetchCanvases(projectId: string): Promise<Canvas[]> {
  return [
    {
      id: `${projectId}_canvas_1`,
      title: "Hero exploration",
      updatedAt: new Date().toISOString()
    }
  ];
}

export async function persistCanvasSnapshot(_: {
  canvasId: string;
  snapshot: unknown;
}) {
  // No-op in Phase 0 mock mode.
  return { ok: true };
}
