import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/collections",
  "/products/premium-ganpati-murti-4-inch",
  "/cart",
  "/checkout?productId=smp-001&quantity=1&giftBox=false",
  "/login",
  "/admin/login"
];

const viewports = [
  { name: "mobile-320", width: 320, height: 740 },
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-375", width: 375, height: 812 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-412", width: 412, height: 915 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 }
];

const mobileMenuViewports = viewports.filter((viewport) => viewport.name.startsWith("mobile-"));

for (const viewport of viewports) {
  test.describe(`responsive ${viewport.name}`, () => {
    test.use({ viewport });

    for (const route of routes) {
      test(`${route} has no horizontal overflow`, async ({ page }) => {
        await page.goto(route);
        await expect(page.locator("body")).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(2);
      });
    }
  });
}

for (const viewport of mobileMenuViewports) {
  test.describe(`mobile menu ${viewport.name}`, () => {
    test.use({ viewport });

    test("closes on navigation, outside tap, and Escape", async ({ page }) => {
      await page.goto("/");
      const menuButton = page.getByTestId("mobile-menu-button");

      await menuButton.click();
      await expect(menuButton).toHaveAttribute("aria-expanded", "true");
      await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "About" }).click();
      await expect(page).toHaveURL(/\/about/);
      await expect(page.getByTestId("mobile-menu-button")).toHaveAttribute("aria-expanded", "false");

      await page.getByTestId("mobile-menu-button").click();
      await expect(page.getByTestId("mobile-menu-button")).toHaveAttribute("aria-expanded", "true");
      await page.mouse.click(16, 160);
      await expect(page.getByTestId("mobile-menu-button")).toHaveAttribute("aria-expanded", "false");

      await page.getByTestId("mobile-menu-button").click();
      await expect(page.getByTestId("mobile-menu-button")).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("mobile-menu-button")).toHaveAttribute("aria-expanded", "false");
    });
  });
}
