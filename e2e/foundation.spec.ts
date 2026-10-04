import { test, expect } from "@playwright/test";
test("preference survives reopening and offline reload without fabricated study content", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Integrated Care Nursing" }),
  ).toBeHidden();
  await page.getByRole("link", { name: "Courses", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Integrated Care Nursing" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Pharmacology Nursing" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(
    page.getByText("Waiting for course material", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "20 min", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Preference saved" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "20 min", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("Ready to open offline", { exact: true }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "20 min", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "5 min", exact: true }).click();
  await expect(
    page.getByText("Preference saved on this device.", { exact: true }),
  ).toBeVisible();
  const reopened = await context.newPage();
  await reopened.goto("/");
  await expect(
    reopened.getByRole("button", { name: "5 min", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator("body")).not.toContainText("Practice Tests");
  await page.screenshot({
    path: `artifacts/${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("manifest and domain are published with the static shell", async ({
  request,
}) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.display).toBe("standalone");
  for (const icon of manifest.icons)
    expect((await request.get(icon.src)).ok()).toBe(true);
  expect(await (await request.get("/CNAME")).text()).toBe(
    "practice-tests.maxeonyx.com\n",
  );
});
