import { test, expect } from "@playwright/test";

test.skip("editor page renders shell", async ({ page }) => {
  await page.goto("/editor");
  await expect(page.locator("text=Phase 1 Shell")).toBeVisible();
});
