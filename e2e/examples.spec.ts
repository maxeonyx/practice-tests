import { expect, test, type Page } from "@playwright/test";

const launches = {
  flashcard: "Ordinary flashcard",
  multipleChoice: "Multiple choice",
  trueFalse: "True or false",
  diagram: "Diagram question",
  openAnswer: "Open answer",
} as const;

async function openExample(page: Page, kind: keyof typeof launches) {
  await page.goto("/examples.html#menu");
  await page.getByRole("button", { name: launches[kind], exact: true }).click();
  await expect(page.locator("#question-prompt")).toBeVisible();
}

async function verifySource(
  page: Page,
  title: string,
  pageNumber: number,
  excerpt: RegExp,
) {
  await page
    .getByRole("button", { name: "Question information", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(title);
  await expect(dialog).toContainText(`PDF page ${pageNumber}`);
  await expect(dialog).toContainText(excerpt);
  await page.getByRole("button", { name: "Close", exact: true }).click();
}

async function continuePastSupports(page: Page, parentPrompt: string) {
  const prompts: string[] = [];
  for (let step = 0; step < 8; step++) {
    const prompt = await page.locator("#question-prompt").innerText();
    if (prompt === parentPrompt) return prompts;

    prompts.push(prompt);
    await page.getByRole("button", { name: "I know", exact: true }).click();
    await expect(page.locator("#question-answer")).toBeVisible();
    await page.getByRole("button", { name: "Easy", exact: true }).click();
    await expect(page.locator("#question-prompt")).not.toHaveText(prompt);
  }

  throw new Error(`The example did not return to its parent: ${parentPrompt}`);
}

test("an ordinary flashcard reveals the source-grounded answer and accepts a self-rating", async ({
  page,
}) => {
  await openExample(page, "flashcard");
  await verifySource(
    page,
    "Health literacy & digital empathy",
    14,
    /Use teach back to ensure patients have understood any health messages\/information/,
  );
  await expect(page.locator("#question-prompt")).toContainText(
    "person nods during your medicine explanation",
  );
  await expect(page.locator("#question-answer")).toHaveCount(0);

  await page.getByRole("button", { name: "I know", exact: true }).click();
  await expect(page.locator("#question-answer")).toContainText(
    "Explain again in plain language, then use teach-back",
  );
  for (const rating of ["Hard", "Medium", "Easy"])
    await expect(
      page.getByRole("button", { name: rating, exact: true }),
    ).toBeVisible();
  await page.getByRole("button", { name: "Medium", exact: true }).click();
  await expect(
    page.getByRole("button", { name: launches.flashcard, exact: true }),
  ).toBeVisible();
});

test("browser Back during the ordinary-card flip returns to Examples without an error", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await openExample(page, "flashcard");

  await page.getByRole("button", { name: "I know", exact: true }).click();
  await page.goBack();
  await expect(
    page.getByRole("button", { name: launches.flashcard, exact: true }),
  ).toBeVisible();
  await expect(page.locator("#question-prompt")).toHaveCount(0);
  await page.waitForTimeout(500);

  await expect(page.locator("#example-error")).toBeHidden();
  expect(pageErrors).toEqual([]);
});

test("a wrong multiple-choice selection gives a correction, teaches its supports and returns to the choices", async ({
  page,
}) => {
  await openExample(page, "multipleChoice");
  const parent = await page.locator("#question-prompt").innerText();
  await expect(page.locator("#question-prompt")).toContainText(/six.?week/i);
  await verifySource(
    page,
    "National Immunisation Schedule",
    1,
    /Rotarix® \(oral\)/,
  );
  for (const choice of ["Infanrix hexa", "Rotarix", "Prevenar 13", "Bexsero"])
    await expect(
      page.getByRole("button", { name: choice, exact: true }),
    ).toBeVisible();

  await page
    .getByRole("button", { name: "Infanrix hexa", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Infanrix hexa is injected.",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const supports = await continuePastSupports(page, parent);
  expect(supports.length).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Rotarix", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Correct");
  await expect(page.locator("#question-answer")).toContainText(
    "oral rotavirus",
  );
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    page.getByRole("button", { name: launches.multipleChoice, exact: true }),
  ).toBeVisible();
});

test("not knowing a multiple-choice answer steps back and returns without marking an option", async ({
  page,
}) => {
  await openExample(page, "multipleChoice");
  const parent = await page.locator("#question-prompt").innerText();
  await page.getByRole("button", { name: "I don’t know", exact: true }).click();
  await expect(page.locator("#question-prompt")).not.toHaveText(parent);
  await expect(page.getByRole("status")).toHaveCount(0);

  const supports = await continuePastSupports(page, parent);
  expect(supports.length).toBeGreaterThan(0);
  await expect(
    page.getByRole("button", { name: "Rotarix", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Rotarix", exact: true }).click();
  await expect(page.locator("#question-answer")).toContainText(
    "oral rotavirus",
  );
});

test("a false teach-back claim is corrected only after the supporting concept", async ({
  page,
}) => {
  await openExample(page, "trueFalse");
  const parent = await page.locator("#question-prompt").innerText();
  await expect(page.locator("#question-prompt")).toContainText(
    "patient’s nod confirms",
  );
  await verifySource(
    page,
    "Health literacy & digital empathy",
    14,
    /Use teach back to ensure patients have understood any health messages\/information/,
  );

  await page.getByRole("button", { name: "True", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Nodding does not show what the person has understood.",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const supports = await continuePastSupports(page, parent);
  expect(supports.length).toBeGreaterThan(0);

  await page.getByRole("button", { name: "False", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Correct");
  await expect(page.locator("#question-answer")).toContainText(/teach-back/i);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    page.getByRole("button", { name: launches.trueFalse, exact: true }),
  ).toBeVisible();
});

test("the diagram identifies the enzyme gap and reveals how ACE changes the pathway", async ({
  page,
}) => {
  await openExample(page, "diagram");
  await expect(page.locator("#question-prompt")).toContainText("angiotensin I");
  await verifySource(
    page,
    "Pharmacology Study Guide 2026",
    243,
    /convert angiotensin I into angiotensin II/,
  );
  await expect(
    page.getByRole("img", {
      name: /angiotensin I is converted to angiotensin II.*enzyme gap/i,
    }),
  ).toBeVisible();
  await expect(page.locator("svg text").filter({ hasText: "?" })).toBeVisible();

  await page.getByRole("button", { name: "I know", exact: true }).click();
  await expect(page.locator("#question-answer")).toContainText("ACE");
  await expect(page.locator("#question-answer")).toContainText(
    "angiotensin II",
  );
  await expect(
    page.getByRole("button", { name: "Medium", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Medium", exact: true }).click();
  await expect(
    page.getByRole("button", { name: launches.diagram, exact: true }),
  ).toBeVisible();
});

test("the full answer waits for three successful supports, keeps typed dictation and lets the learner self-mark", async ({
  page,
}) => {
  await openExample(page, "openAnswer");
  const parent = await page.locator("#question-prompt").innerText();
  await verifySource(
    page,
    "Health literacy & digital empathy",
    14,
    /Use teach back to ensure patients have understood any health messages\/information/,
  );
  await expect(page.locator("#question-answer")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Break it down", exact: true })
    .click();

  const supportPrompts: string[] = [];
  for (let step = 0; step < 3; step++) {
    const prompt = await page.locator("#question-prompt").innerText();
    supportPrompts.push(prompt);
    await page.getByRole("button", { name: "I know", exact: true }).click();
    await expect(page.locator("#question-answer")).toBeVisible();
    await page.getByRole("button", { name: "Easy", exact: true }).click();
    await expect(page.locator("#question-prompt")).not.toHaveText(prompt);
  }
  expect(new Set(supportPrompts).size).toBe(3);
  await expect(page.locator("#question-prompt")).toHaveText(parent);

  const response = page.getByRole("textbox", {
    name: "Your answer",
    exact: true,
  });
  await expect(response).toBeVisible();
  const showModel = page.getByRole("button", {
    name: "Show model answer",
    exact: true,
  });
  await expect(showModel).toBeDisabled();
  await page.getByRole("button", { name: "Dictate", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "microphone on your phone’s keyboard",
  );
  await page.getByRole("button", { name: "Close", exact: true }).click();

  const learnerAnswer =
    "I would acknowledge the difficulty, explain again in plain language a little at a time, and ask the person to explain the plan in their own words. I would clarify any gaps and check their understanding again.";
  await response.pressSequentially(learnerAnswer);
  await expect(showModel).toBeEnabled();
  await showModel.click();

  await expect(page.locator("#model-answer")).toBeVisible();
  await expect(page.locator("#model-answer")).toContainText("teach-back");
  await expect(response).toHaveValue(learnerAnswer);
  await expect(page.getByText(/AI grade|automatically graded/i)).toHaveCount(0);
  await page.getByRole("button", { name: "Medium", exact: true }).click();
  await expect(
    page.getByRole("button", { name: launches.openAnswer, exact: true }),
  ).toBeVisible();
});

test("missing a supporting idea returns to Examples without demanding the full answer", async ({
  page,
}) => {
  await openExample(page, "openAnswer");
  await page
    .getByRole("button", { name: "Break it down", exact: true })
    .click();

  const first = await page.locator("#question-prompt").innerText();
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await page.getByRole("button", { name: "Easy", exact: true }).click();
  await expect(page.locator("#question-prompt")).not.toHaveText(first);
  const missed = await page.locator("#question-prompt").innerText();
  expect(missed).not.toBe(first);
  await page.getByRole("button", { name: "I don’t know", exact: true }).click();
  await expect(page.locator("#question-answer")).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("#question-prompt")).not.toHaveText(missed);

  const last = await page.locator("#question-prompt").innerText();
  expect(last).not.toBe(first);
  expect(last).not.toBe(missed);
  await page.getByRole("button", { name: "I know", exact: true }).click();
  await page.getByRole("button", { name: "Easy", exact: true }).click();

  await expect(
    page.getByRole("button", { name: launches.openAnswer, exact: true }),
  ).toBeVisible();
  await expect(page.locator("#question-prompt")).toHaveCount(0);
  await expect(
    page.getByRole("textbox", { name: "Your answer", exact: true }),
  ).toHaveCount(0);
});

test("the review query opens Examples online and offline without creating learner progress", async ({
  page,
}) => {
  await page.goto("/examples.html?review=1");
  await page.evaluate(() =>
    navigator.serviceWorker.ready.then(() => undefined),
  );
  await page.reload();
  await expect(page).toHaveTitle("Question examples · Recall");
  await page.context().setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: launches.multipleChoice, exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => indexedDB.databases())).toEqual([]);
});
