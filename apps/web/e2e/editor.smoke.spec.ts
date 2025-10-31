import { test, expect } from "@playwright/test";

test("editor page renders shell", async ({ page }) => {
  await page.goto("/editor");
  await expect(page.getByText("Phase 1 Shell", { exact: true })).toBeVisible();
});
