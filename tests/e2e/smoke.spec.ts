import { expect, test } from "@playwright/test";

test("la page d'accueil charge le marqueur bootstrap Phase 0", async ({ page }) => {
  await page.goto("/");

  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveText("Ship Stability Simulator");

  const marker = page.getByTestId("bootstrap-marker");
  await expect(marker).toBeVisible();
  await expect(marker).toContainText("Phase 0");
});
