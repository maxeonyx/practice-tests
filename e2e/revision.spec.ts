import { test, expect, type Page } from "@playwright/test";

const reviewUrl = "/?review=1";
const reviewDatabase = "kira-revision-review";

async function begin(page: Page) {
  await page.goto(reviewUrl);
  await page.getByRole("button", { name: "10 min", exact: true }).click();
  await expect(page.locator("#question-prompt")).toBeVisible();
}

async function readProgress(page: Page, name = reviewDatabase) {
  return page.evaluate(async (databaseName) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseName);
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
  }, name);
}

async function findTeachBackQuestion(page: Page) {
  await page.goto("/?review=1&question=medicine-teach-back");
  await expect(page.locator("#question-prompt")).toContainText(
    "nods during your medicine explanation",
  );
}

test("an unknown fact reveals its answer and learning image, then Next continues immediately", async ({
  page,
}) => {
  await begin(page);
  await expect(page.locator("#question-prompt")).toContainText("six-week");
  await expect(page.locator("#question-answer")).toHaveCount(0);
  await expect(page.locator("main img")).toHaveCount(0);
  const question = await page.locator("#question-prompt").innerText();
  await page.getByRole("button", { name: "I don’t know", exact: true }).click();
  await expect(page.locator("#question-answer")).toContainText("Rotarix");
  const image = page.locator("main img");
  await expect(image).toBeVisible();
  await page.screenshot({
    path: `artifacts/${test.info().project.name}-answer.png`,
    fullPage: true,
  });
  await expect(image).toHaveJSProperty("complete", true);
  expect(
    await image.evaluate(
      (element) => (element as HTMLImageElement).naturalWidth,
    ),
  ).toBeGreaterThan(0);
  await expect(
    page.getByRole("button", { name: "Easy", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("#question-prompt")).not.toHaveText(question);
  await expect(
    page.getByRole("button", { name: "I know", exact: true }),
  ).toBeVisible();
  const progress = await readProgress(page);
  expect(progress.attempts).toHaveLength(1);
  expect(progress.attempts[0]).toMatchObject({
    rating: "again",
    independent: true,
  });
});

test("known answers receive difficulty feedback and immediately advance with independent evidence", async ({
  page,
}) => {
  await begin(page);
  const question = await page.locator("#question-prompt").innerText();
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await expect(page.locator("#question-answer")).toContainText("Rotarix");
  await expect(
    page.getByRole("button", { name: "Hard", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Medium", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "I was wrong", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Easy", exact: true }).click();
  await expect(page.locator("#question-prompt")).not.toHaveText(question);
  await expect(
    page.getByRole("button", { name: "I know", exact: true }),
  ).toBeVisible();
  const progress = await readProgress(page);
  expect(progress.attempts).toHaveLength(1);
  expect(progress.reviews).toHaveLength(1);
  expect(progress.attempts[0]).toMatchObject({
    rating: "easy",
    independent: true,
  });
});

test("unknown prerequisite questions step back without the parent answer and return even after missed supports", async ({
  page,
}) => {
  await begin(page);
  await findTeachBackQuestion(page);
  const parent = await page.locator("#question-prompt").innerText();
  const parentId = await page.locator("main").getAttribute("data-root-id");
  await expect(
    page.getByLabel("Supporting knowledge", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Supporting knowledge", { exact: true }).locator("text"),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "I don’t know", exact: true }).click();
  await expect(page.locator("#question-prompt")).not.toHaveText(parent);
  await expect(page.locator("#question-answer")).toHaveCount(0);
  await page.screenshot({
    path: `artifacts/${test.info().project.name}-prerequisite.png`,
    fullPage: true,
  });
  const missedParentReview = (await readProgress(page)).reviews.find(
    (value) => (value as { questionId: string }).questionId === parentId,
  );
  let returned = false;
  const supportPrompts: string[] = [];
  for (let count = 0; count < 40; count++) {
    const prompt = await page.locator("#question-prompt").innerText();
    if (prompt === parent) {
      returned = true;
      break;
    }
    supportPrompts.push(prompt);
    await page
      .getByRole("button", { name: "I don’t know", exact: true })
      .click();
    await expect(page.locator(".answer-controls button:disabled")).toHaveCount(
      0,
    );
    if (
      await page.getByRole("button", { name: "Next", exact: true }).isVisible()
    ) {
      await page.getByRole("button", { name: "Next", exact: true }).click();
    }
    await expect(
      page.getByRole("button", { name: "I know", exact: true }),
    ).toBeVisible();
  }
  expect(
    returned,
    "The full question should return despite missed supporting answers.",
  ).toBe(true);
  expect(supportPrompts.length).toBeGreaterThan(1);
  expect(
    supportPrompts.filter(
      (prompt) => prompt === "How does the course define health literacy?",
    ),
  ).toHaveLength(1);
  await expect(page.locator("#question-answer")).toHaveCount(0);
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await page.getByRole("button", { name: "Easy", exact: true }).click();
  await expect(page.locator("#question-answer")).toHaveCount(0);
  if (await page.locator("#question-prompt").isVisible()) {
    await expect(page.locator("#question-prompt")).not.toHaveText(parent);
  } else {
    await expect(
      page.getByRole("heading", { name: "How much time do you have?" }),
    ).toBeVisible();
  }
  const progress = await readProgress(page);
  const parentRecall = progress.attempts.find((value) => {
    const attempt = value as { questionId: string; rating: string };
    return attempt.questionId === parentId && attempt.rating === "easy";
  });
  expect(parentRecall).toMatchObject({ rating: "easy", independent: false });
  expect(
    progress.reviews.find(
      (value) => (value as { questionId: string }).questionId === parentId,
    ),
  ).toEqual(missedParentReview);
});

test("correcting a false claim records a miss and continues from a standalone fact", async ({
  page,
}) => {
  await begin(page);
  const question = await page.locator("#question-prompt").innerText();
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await page.getByRole("button", { name: "I was wrong", exact: true }).click();
  await expect(page.locator("#question-prompt")).not.toHaveText(question);
  const progress = await readProgress(page);
  expect(progress.attempts).toHaveLength(1);
  expect(progress.attempts[0]).toMatchObject({
    rating: "again",
    independent: true,
  });
});

test("a quick reopen preserves the revealed answer without another setup step", async ({
  page,
}) => {
  await begin(page);
  const question = await page.locator("#question-prompt").innerText();
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await expect(page.locator("#question-answer")).toBeVisible();
  await page.reload();
  await expect(page.locator("#question-prompt")).toHaveText(question);
  await expect(page.locator("#question-answer")).toContainText("Rotarix");
  await expect(
    page.getByRole("button", { name: "Medium", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "How much time do you have?" }),
  ).toHaveCount(0);
});

for (const [name, start, finish] of [
  [
    "a new New Zealand day",
    "2026-10-04T23:50:00+13:00",
    "2026-10-05T00:10:00+13:00",
  ],
  [
    "three hours away",
    "2026-10-04T18:00:00+13:00",
    "2026-10-04T21:01:00+13:00",
  ],
]) {
  test(`${name} starts fresh while retaining previous recall evidence`, async ({
    page,
  }) => {
    await page.clock.install({ time: new Date(start) });
    await begin(page);
    await page.getByRole("button", { name: "I know", exact: true }).click();
    await page.getByRole("button", { name: "Easy", exact: true }).click();
    const pausedQuestion = await page.locator("#question-prompt").innerText();
    await page
      .getByRole("button", { name: "I don’t know", exact: true })
      .click();
    await expect(page.locator(".answer-controls button:disabled")).toHaveCount(
      0,
    );
    await page.clock.setSystemTime(new Date(finish));
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "How much time do you have?" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "5 min", exact: true }).click();
    await expect(page.locator("#question-prompt")).not.toHaveText(
      pausedQuestion,
    );
    await expect(
      page.getByRole("button", { name: "I know", exact: true }),
    ).toBeVisible();
    expect((await readProgress(page)).attempts.length).toBeGreaterThanOrEqual(
      2,
    );
  });
}

test("an offline reopening retains question, image and new saved progress", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await begin(page);
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await expect(page.locator("#question-answer")).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(page.locator("#question-answer")).toContainText("Rotarix");
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#question-answer")).toContainText("Rotarix");
  expect(
    await page
      .locator("main img")
      .evaluate((element) => (element as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Medium", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "I know", exact: true }),
  ).toBeVisible();
  await page.reload();
  expect((await readProgress(page)).attempts).toHaveLength(1);
  expect(errors).toEqual([]);
});

test("a stale home screen starts a five-minute session without requiring a reload or losing saved answers", async ({
  page,
  context,
}) => {
  await page.goto(reviewUrl);
  const other = await context.newPage();
  await other.goto(reviewUrl);
  await expect(
    other.getByRole("button", { name: "5 min", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "10 min", exact: true }).click();
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await page.getByRole("button", { name: "Easy", exact: true }).click();
  await expect(page.locator(".answer-controls button:disabled")).toHaveCount(0);
  await other.getByRole("button", { name: "5 min", exact: true }).click();
  await expect(other.locator("#question-prompt")).toBeVisible();
  await expect(other.getByRole("alert")).toBeHidden();
  expect((await readProgress(other)).attempts).toHaveLength(1);
});

test("the review link keeps normal learner progress separate", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "10 min", exact: true }).click();
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await page.getByRole("button", { name: "Easy", exact: true }).click();
  expect((await readProgress(page, "kira-revision")).attempts).toHaveLength(1);
  await page.goto(reviewUrl);
  await expect(
    page.getByRole("heading", { name: "How much time do you have?" }),
  ).toBeVisible();
  expect((await readProgress(page)).attempts).toHaveLength(0);
  expect((await readProgress(page, "kira-revision")).attempts).toHaveLength(1);
});

test("version-one preferences survive migration and ordinary revision works", async ({
  page,
}) => {
  await page.goto("/CNAME");
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("kira-revision", 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("preferences");
        request.result.createObjectStore("attempts", { keyPath: "id" });
        request.result.createObjectStore("reviews", { keyPath: "questionId" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("preferences", "readwrite");
      transaction
        .objectStore("preferences")
        .put({ schemaVersion: 1, availableMinutes: 20 }, "learner");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  });
  await page.goto("/");
  const preference = await page.evaluate(async () => {
    const request = indexedDB.open("kira-revision");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const result = await new Promise<{
      schemaVersion: number;
      availableMinutes: number;
    }>((resolve, reject) => {
      const request = db
        .transaction("preferences")
        .objectStore("preferences")
        .get("learner");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return result;
  });
  expect(preference).toMatchObject({ schemaVersion: 1, availableMinutes: 20 });
  await page.getByRole("button", { name: "10 min", exact: true }).click();
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await page.getByRole("button", { name: "Easy", exact: true }).click();
  expect((await readProgress(page, "kira-revision")).attempts).toHaveLength(1);
});

test("after Integrated Care ends, a paused question cannot override Pharmacology", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-28T12:00:00+13:00") });
  await begin(page);
  const pausedQuestion = await page.locator("#question-prompt").innerText();
  await page.clock.setSystemTime(new Date("2026-10-30T12:00:00+13:00"));
  await page.reload();
  await page.getByRole("button", { name: "10 min", exact: true }).click();
  await expect(page.locator("#question-prompt")).not.toHaveText(pausedQuestion);
  await expect(page.locator("main[data-course='pharmacology']")).toBeVisible();
});

test("question provenance appears only when requested and closes back to the same question", async ({
  page,
}) => {
  await begin(page);
  const question = await page.locator("#question-prompt").innerText();
  await expect(page.getByText("Question sources", { exact: true })).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "Question information", exact: true })
    .click();
  const information = page.getByRole("dialog");
  await expect(
    information.getByRole("heading", { name: "Question sources", exact: true }),
  ).toBeVisible();
  await expect(information).toContainText("Page");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(information).not.toBeVisible();
  await expect(page.locator("#question-prompt")).toHaveText(question);
  await expect(page.locator("#question-answer")).toHaveCount(0);
});

test("iPhone installation help is available on demand with the requested button name", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/140.0.7339.0 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();
  await page.goto(reviewUrl);
  await page.getByRole("button", { name: "Install app", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "tap Share, then Add to Home Screen",
  );
  await expect(page.getByRole("dialog")).toContainText("Safari");
  await context.close();
});

test("supporting recall after correcting a revealed parent is recorded as cued learning", async ({
  page,
}) => {
  await begin(page);
  await findTeachBackQuestion(page);
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await expect(page.locator("#question-answer")).toBeVisible();
  await page.getByRole("button", { name: "I was wrong", exact: true }).click();
  await expect(page.locator("#question-prompt")).toHaveText(
    "Why use teach-back after a medicine explanation?",
  );
  const supportId = await page.locator("main").getAttribute("data-question-id");
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await expect(page.locator("#question-answer")).toBeVisible();
  await page.getByRole("button", { name: "Easy", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "I know", exact: true }),
  ).toBeEnabled();
  const progress = await readProgress(page);
  const recall = progress.attempts.find((value) => {
    const attempt = value as { questionId: string; rating: string };
    return attempt.questionId === supportId && attempt.rating === "easy";
  });
  expect(recall).toMatchObject({ independent: false });
  const review = progress.reviews.find(
    (value) => (value as { questionId: string }).questionId === supportId,
  ) as { card: { due: string } };
  expect(new Date(review.card.due).getTime()).toBeLessThan(
    (await page.evaluate(() => Date.now())) + 24 * 60 * 60 * 1000,
  );
});
