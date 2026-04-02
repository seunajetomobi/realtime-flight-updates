import { expect, test } from "@playwright/test";

test("homepage loads and layout adapts", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=Swiftrafik")).toBeVisible();
  // check airport sidebar present
  await expect(page.locator("text=Airports")).toBeVisible();
  // check table headers
  await expect(page.locator("th", { hasText: "Callsign" })).toBeVisible();
});

// responsive checks
test.describe("responsive", () => {
  test("mobile layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.locator("text=Swiftrafik")).toBeVisible();
  });
});
