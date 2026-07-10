import { expect, test } from "@playwright/test";

test("home page loads with hero title", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /build products/i }),
  ).toBeVisible();
});
