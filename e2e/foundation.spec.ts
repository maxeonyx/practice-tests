import { test, expect } from "@playwright/test";

test("a time choice goes straight to a clear mental-recall question", async ({
  page,
}) => {
  await page.goto("/?review=1");
  await expect(
    page.getByRole("heading", { name: "How much time do you have?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "10 min", exact: true }).click();
  await expect(page.locator("#question-prompt")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "I know it", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "I don’t know it", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Start studying", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Courses", exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("manifest icons and the static domain are published", async ({
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
