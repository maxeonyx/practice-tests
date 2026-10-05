import { test, expect, type Page } from "@playwright/test";

async function openQuestion(page: Page, id: string) {
  await page.goto(`/?review=1&question=${encodeURIComponent(id)}`);
  await expect(page.locator("#question-prompt")).toBeVisible();
}
async function progress(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("kira-revision-review");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const read = (store: string) =>
      new Promise<unknown[]>((resolve, reject) => {
        const request = db.transaction(store).objectStore(store).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    const attempts = await read("attempts");
    const reviews = await read("reviews");
    db.close();
    return { attempts, reviews };
  });
}
async function supports(page: Page, parent: string, know: boolean) {
  await expect(page.locator("#question-prompt")).not.toHaveText(parent);
  for (let count = 0; count < 30; count++) {
    const prompt = await page.locator("#question-prompt").innerText();
    if (prompt === parent) return;
    await page
      .getByRole("button", {
        name: know ? "I know" : "I don’t know",
        exact: true,
      })
      .click();
    if (know) {
      await page.getByRole("button", { name: "Medium", exact: true }).click();
      await expect(page.locator("#question-prompt")).not.toHaveText(prompt);
    } else {
      await expect(
        page.locator(".answer-controls button:disabled"),
      ).toHaveCount(0);
      if (
        await page
          .getByRole("button", { name: "Next", exact: true })
          .isVisible()
      ) {
        await page.getByRole("button", { name: "Next", exact: true }).click();
        await expect(page.locator("#question-prompt")).not.toHaveText(prompt);
      }
    }
  }
  throw new Error(
    "The full question did not return after thirty supporting answers.",
  );
}

test("a correct exam-style choice records objective recall once and survives reload", async ({
  page,
}) => {
  await openQuestion(page, "penicillin-wall");
  await page
    .getByRole("button", {
      name: "It inhibits peptidoglycan cross-linking, weakening the bacterial cell wall.",
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toHaveText("Correct");
  await expect(page.locator("#question-answer")).toContainText("wall");
  await page.reload();
  await expect(page.getByRole("status")).toHaveText("Correct");
  const saved = await progress(page);
  expect(saved.attempts).toHaveLength(1);
  expect(saved.attempts[0]).toMatchObject({
    questionId: "penicillin-wall",
    rating: "good",
    independent: true,
  });
  await page.getByRole("button", { name: "Next", exact: true }).click();
  expect((await progress(page)).attempts).toHaveLength(1);
});

test("a wrong choice teaches supporting cards and preserves the missed review after a correct retry", async ({
  page,
}) => {
  await openQuestion(page, "application-crying-safety");
  const parent = await page.locator("#question-prompt").innerText();
  await page
    .getByRole("button", {
      name: "Shake the baby gently to interrupt the crying.",
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toContainText("Never shake");
  const missed = (await progress(page)).reviews[0];
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("#question-prompt")).not.toHaveText(parent);
  await expect(page.locator("#question-answer")).toHaveCount(0);
  await supports(page, parent, true);
  await page
    .getByRole("button", {
      name: "Put the baby in a safe place, take a break and wait until calm before picking the baby up; never shake the baby.",
      exact: true,
    })
    .click();
  const saved = await progress(page);
  const parentAttempts = saved.attempts.filter(
    (a) =>
      (a as { questionId: string }).questionId === "application-crying-safety",
  );
  expect(parentAttempts).toHaveLength(2);
  expect(parentAttempts).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ rating: "again", independent: true }),
      expect.objectContaining({ rating: "good", independent: false }),
    ]),
  );
  expect(
    saved.reviews.find(
      (r) =>
        (r as { questionId: string }).questionId ===
        "application-crying-safety",
    ),
  ).toEqual(missed);
});

test("an unknown true/false statement steps back without exposing the answer", async ({
  page,
}) => {
  await openQuestion(page, "application-pregnancy-signs");
  const parent = await page.locator("#question-prompt").innerText();
  await expect(
    page.getByRole("button", { name: "False", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "I don’t know", exact: true }).click();
  await expect(page.locator("#question-prompt")).not.toHaveText(parent);
  await expect(page.locator("#question-answer")).toHaveCount(0);
  await supports(page, parent, true);
  await page.getByRole("button", { name: "False", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Correct");
});

test("the pathway question has a clear prompt and reveals the missing enzyme", async ({
  page,
}) => {
  await openQuestion(page, "raas-conversion-enzyme");
  await expect(page.locator("#question-prompt")).toContainText("enzyme");
  await expect(page.locator(".raas-diagram")).toBeVisible();
  await expect(page.locator(".raas-diagram")).toContainText("?");
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await expect(page.locator(".raas-diagram")).toContainText("ACE");
  await page.getByRole("button", { name: "Hard", exact: true }).click();
  expect((await progress(page)).attempts[0]).toMatchObject({
    questionId: "raas-conversion-enzyme",
    rating: "hard",
  });
});

test("missed open-answer supports return to the complete model without a writing demand", async ({
  page,
}) => {
  await openQuestion(page, "exam-reference-phc-access");
  const parent = await page.locator("#question-prompt").innerText();
  await page
    .getByRole("button", { name: "Break it down", exact: true })
    .click();
  await supports(page, parent, false);
  await expect(page.locator("#model-answer")).toContainText("partnership");
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await page.reload();
  await expect(page.locator("#model-answer")).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  expect((await progress(page)).attempts).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        questionId: "exam-reference-phc-access",
        rating: "again",
        independent: false,
      }),
    ]),
  );
});

test("successful supports lead to a durable written answer and honest model comparison", async ({
  page,
}) => {
  await openQuestion(page, "exam-reference-phc-access");
  const parent = await page.locator("#question-prompt").innerText();
  await page
    .getByRole("button", { name: "Break it down", exact: true })
    .click();
  await supports(page, parent, true);
  await page
    .getByRole("textbox", { name: "Your answer" })
    .fill(
      "Ask what matters to the whānau. Address transport, explain the letters together, and make a plan in partnership.",
    );
  await expect(
    page.getByRole("button", { name: "Show model answer", exact: true }),
  ).toBeEnabled();
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Your answer" }),
  ).toContainText("transport");
  await page
    .getByRole("button", { name: "Show model answer", exact: true })
    .click();
  await expect(page.locator("#model-answer")).toContainText("partnership");
  await page.getByRole("button", { name: "Medium", exact: true }).click();
  const saved = await progress(page);
  expect(saved.attempts).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        questionId: "exam-reference-phc-access",
        rating: "good",
        independent: false,
        answer: expect.stringContaining("transport"),
      }),
    ]),
  );
  const names = await page.evaluate(async () =>
    (await indexedDB.databases()).map((db) => db.name),
  );
  expect(names).not.toContain("kira-revision");
});
