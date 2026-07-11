import { expect, test } from "@playwright/test";

test("homepage supports skip navigation and product search", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Sacred artistry for modern Indian homes.",
    })
  ).toBeVisible();

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const mobileMenu = page.getByLabel("Open navigation menu");
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click();
  }
  await page.locator("button:visible").filter({ hasText: "Search" }).click();
  await expect(
    page.getByRole("dialog", { name: "Search products" })
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search products" }).fill("Ganpati");
  await expect(page.getByText(/matching products/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Search products" })
  ).toBeHidden();
});

test("customer can filter collections and add a product to cart", async ({
  page,
}) => {
  await page.goto("/collections");
  await expect(
    page.locator("#main-content").getByText("43 products found")
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Ganapati Murti", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Ganapati Murti", exact: true })
  ).toHaveAttribute("aria-pressed", "true");

  await page.goto("/products/premium-ganpati-murti-4-inch");
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem("shubharambh-cart"))
    )
    .toContain("smp-001");
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "Ganpati Bappa" })
  ).toBeVisible();
});

test("buy now opens checkout with only the selected product", async ({
  page,
}) => {
  await page.goto("/products/premium-ganpati-murti-4-inch");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Buy Now" }).click();

  await expect(page).toHaveURL(/\/checkout\?productId=smp-001&quantity=2/);
  await expect(
    page.getByRole("heading", { name: "Complete your order" })
  ).toBeVisible();
  await expect(page.getByText("Qty: 2")).toBeVisible();
  await expect(page.getByRole("button", { name: /Pay ₹/ })).toBeVisible();
});

test("successful COD order shows the confirmation modal", async ({ page }) => {
  await page.route("**/api/orders", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        internalOrderId: "test-order-123",
        accessToken: "test-access-token",
        paymentMethod: "cash_on_delivery",
        status: "cod_pending",
        totalAmount: 999,
        estimatedDeliveryDate: "2026-06-19",
      }),
    });
  });

  await page.goto("/checkout?productId=smp-001&quantity=1&giftBox=false");
  await page.getByLabel("Full Name").fill("Test Customer");
  await page.getByLabel("Mobile Number").fill("7796675304");
  await page.getByLabel("Email").fill("customer@example.com");
  await page.getByLabel("House / Flat").fill("12");
  await page.getByLabel("Area / Street").fill("Market Road");
  await page.getByLabel("City").fill("Akole");
  await page
    .getByRole("textbox", { name: "PIN Code", exact: true })
    .fill("422601");
  await page.getByText("Cash on Delivery", { exact: true }).click();
  await page.getByRole("button", { name: "Place COD Order" }).click();

  const dialog = page.getByRole("dialog", { name: "Order Confirmed!" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("test-order-123")).toBeVisible();
  await expect(dialog.getByText("₹999")).toBeVisible();
  await expect(dialog.getByText("Cash on Delivery")).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Track Order" })
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Download Invoice" })
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Continue Shopping" })
  ).toBeVisible();
});
