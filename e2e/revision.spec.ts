import { test, expect } from "@playwright/test";

test("a written answer resumes offline, then an unknown question teaches its visual pieces and returns to the whole", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start studying", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Your answer" }),
  ).toBeVisible();
  const whole = await page.locator("#question-prompt").textContent();
  await page
    .getByRole("textbox", { name: "Your answer" })
    .fill("My recalled explanation, before seeing the guide.");
  await expect(
    page.getByText("Answer saved on this device.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Resume studying", exact: true })
    .click();
  await expect(page.getByRole("textbox", { name: "Your answer" })).toHaveValue(
    "My recalled explanation, before seeing the guide.",
  );
  await page
    .getByRole("button", { name: "I don’t know it", exact: true })
    .click();
  await expect(
    page.getByText("Build the understanding", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".diagram .current")).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("button", { name: "Resume studying", exact: true })
    .click();
  for (let piece = 0; piece < 30; piece++) {
    if (
      await page
        .getByText("Return to the whole question", { exact: true })
        .isVisible()
    )
      break;
    await page
      .getByRole("button", { name: "I don’t know it", exact: true })
      .click();
    const previous = await page.locator("#question-prompt").textContent();
    await page
      .getByRole("button", { name: /^(Continue|Work through the pieces)$/ })
      .click();
    await expect(page.locator("#question-prompt")).not.toHaveText(previous!);
  }
  await expect(page.locator("#question-prompt")).toHaveText(whole!);
  await expect(page.getByRole("textbox", { name: "Your answer" })).toHaveValue(
    "",
  );
  await page.getByRole("button", { name: "I know it", exact: true }).click();
  await page.getByRole("button", { name: /^Good/ }).click();
  await expect(
    page.getByText("Practised with help", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Courses", exact: true }).click();
  await expect(
    page.getByText("0 independent answers", { exact: false }).first(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("self correction and an independent written answer produce different readiness evidence", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start studying", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Your answer" })
    .fill("A complete answer recalled without help.");
  await page.getByRole("button", { name: "I know it", exact: true }).click();
  await expect(page.getByRole("button", { name: /^Easy/ })).toBeVisible();
  await page.getByRole("button", { name: "I missed it", exact: true }).click();
  await expect(
    page.getByText("Build the understanding", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await page.getByRole("link", { name: "Courses", exact: true }).click();
  await expect(
    page.getByText("0 independent answers", { exact: false }).first(),
  ).toBeVisible();
});

test("an independently recalled response persists with its scheduled review and readiness evidence", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start studying", exact: true })
    .click();
  const answer =
    "Mechanism, effects and nursing implications recalled before revealing the guide.";
  await page.getByRole("textbox", { name: "Your answer" }).fill(answer);
  await page.getByRole("button", { name: "I know it", exact: true }).click();
  await page.getByRole("button", { name: /^Easy/ }).click();
  await expect(
    page.getByText("Recalled independently", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("link", { name: "Courses", exact: true }).click();
  await expect(
    page.getByText("1 independent answer", { exact: false }),
  ).toBeVisible();
  const data = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("kira-revision");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const read = (store: string) =>
      new Promise<unknown[]>((resolve, reject) => {
        const r = db.transaction(store).objectStore(store).getAll();
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
    const attempts = await read("attempts");
    const reviews = await read("reviews");
    db.close();
    return { attempts, reviews };
  });
  expect(data.attempts).toHaveLength(1);
  expect(data.reviews).toHaveLength(1);
  expect(data.attempts[0]).toMatchObject({
    answer,
    rating: "easy",
    independent: true,
  });
});

test("version-one preferences migrate intact into actual study", async ({
  page,
}) => {
  await page.goto("/CNAME");
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("kira-revision", 1);
      r.onupgradeneeded = () => {
        r.result.createObjectStore("preferences");
        r.result.createObjectStore("attempts", { keyPath: "id" });
        r.result.createObjectStore("reviews", { keyPath: "questionId" });
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("preferences", "readwrite");
      tx.objectStore("preferences").put(
        { schemaVersion: 1, availableMinutes: 20 },
        "learner",
      );
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "20 min", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Start studying", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Your answer" })
    .fill("Migration preserved my preference and lets me study.");
  await expect(
    page.getByText("Answer saved on this device.", { exact: true }),
  ).toBeVisible();
});

test("a stale tab cannot overwrite another tab’s saved session", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const other = await context.newPage();
  await other.goto("/");
  await expect(
    other.getByRole("button", { name: "Start studying", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start studying", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Your answer" })
    .fill("This answer belongs to the active tab.");
  await expect(
    page.getByText("Answer saved on this device.", { exact: true }),
  ).toBeVisible();
  await other
    .getByRole("button", { name: "Start studying", exact: true })
    .click();
  await expect(other.getByRole("alert")).toContainText("Another tab changed");
  await other.reload();
  await other
    .getByRole("button", { name: "Resume studying", exact: true })
    .click();
  await expect(other.getByRole("textbox", { name: "Your answer" })).toHaveValue(
    "This answer belongs to the active tab.",
  );
});

test("after the first assessment, new work comes from the remaining course", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-30T12:00:00+13:00") });
  await page.goto("/");
  await expect(page.locator(".assessment-chip")).toContainText("Pharmacology");
  await expect(page.locator(".assessment-chip")).toContainText("50%");
  await page
    .getByRole("button", { name: "Start studying", exact: true })
    .click();
  await expect(page.locator(".study-top")).toContainText("Pharmacology");
});

test("a paused question from the completed first exam does not override the remaining exam", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-28T12:00:00+13:00") });
  await page.goto("/");
  await expect(page.locator(".assessment-chip")).toContainText(
    "Integrated Care",
  );
  await page
    .getByRole("button", { name: "Start studying", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Your answer" })
    .fill("A saved answer before the first test.");
  await expect(
    page.getByText("Answer saved on this device.", { exact: true }),
  ).toBeVisible();
  await page.clock.setSystemTime(new Date("2026-10-30T12:00:00+13:00"));
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page.locator(".assessment-chip")).toContainText("Pharmacology");
  await page
    .getByRole("button", { name: "Start studying", exact: true })
    .click();
  await expect(page.locator(".study-top")).toContainText("Pharmacology");
});

test("a final input during a transition cannot become the next question’s draft", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start studying", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Your answer" })
    .fill("My whole-question attempt.");
  await expect(
    page.getByText("Answer saved on this device.", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    const answer = document.querySelector<HTMLTextAreaElement>("#answer")!;
    const next = [
      ...document.querySelectorAll<HTMLButtonElement>("button"),
    ].find((b) => b.textContent === "I don’t know it")!;
    next.click();
    answer.value = "A late whole-question input.";
    answer.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(
    page.getByText("Build the understanding", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Your answer" })).toHaveValue(
    "",
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Resume studying", exact: true })
    .click();
  await expect(page.getByRole("textbox", { name: "Your answer" })).toHaveValue(
    "",
  );
});
