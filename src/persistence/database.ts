import { openDB, type DBSchema } from "idb";
import {
  initialPreferences,
  type Preferences,
  type LearnerState,
  type ReviewState,
  type StudyAttempt,
  type Session,
} from "../study/state";
interface RevisionDB extends DBSchema {
  preferences: { key: string; value: Preferences };
  attempts: { key: string; value: StudyAttempt };
  reviews: { key: string; value: ReviewState };
  session: { key: string; value: Session | null };
  meta: { key: string; value: number };
}
const database = openDB<RevisionDB>("kira-revision", 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore("preferences");
      db.createObjectStore("attempts", { keyPath: "id" });
      db.createObjectStore("reviews", { keyPath: "questionId" });
    }
    if (oldVersion < 2) {
      db.createObjectStore("session");
      db.createObjectStore("meta");
    }
  },
  blocked() {
    window.dispatchEvent(new Event("storage-blocked"));
  },
  blocking(_old, _new, event) {
    (event.target as IDBDatabase).close();
    window.dispatchEvent(new Event("storage-blocked"));
  },
});
export async function loadState(): Promise<LearnerState> {
  const db = await database;
  const tx = db.transaction(
    ["preferences", "attempts", "reviews", "session", "meta"],
    "readonly",
  );
  const [saved, attempts, reviews, session, revision] = await Promise.all([
    tx.objectStore("preferences").get("learner"),
    tx.objectStore("attempts").getAll(),
    tx.objectStore("reviews").getAll(),
    tx.objectStore("session").get("current"),
    tx.objectStore("meta").get("revision"),
  ]);
  await tx.done;
  if (
    saved !== undefined &&
    (saved.schemaVersion !== 1 ||
      ![null, 5, 20, 60].includes(saved.availableMinutes))
  )
    throw new Error(
      "Cannot open saved revision preferences: unsupported format. Keep browser data and check the application migration.",
    );
  return {
    preferences: saved ?? { ...initialPreferences },
    attempts,
    reviews,
    session: session ?? null,
    revision: revision ?? 0,
  };
}
export async function persist(
  state: LearnerState,
  change: {
    session?: Session | null;
    preferences?: Preferences;
    attempt?: StudyAttempt;
    review?: ReviewState;
  },
): Promise<number> {
  const tx = (await database).transaction(
    ["preferences", "attempts", "reviews", "session", "meta"],
    "readwrite",
  );
  const stored = (await tx.objectStore("meta").get("revision")) ?? 0;
  if (stored !== state.revision) {
    tx.abort();
    await tx.done.catch(() => {});
    throw new Error(
      "Another tab changed your revision progress. Reload this tab to continue from the saved step. Your current answer is still on screen.",
    );
  }
  if ("session" in change)
    await tx.objectStore("session").put(change.session ?? null, "current");
  if (change.preferences !== undefined)
    await tx.objectStore("preferences").put(change.preferences, "learner");
  if (change.attempt !== undefined)
    await tx.objectStore("attempts").put(change.attempt);
  if (change.review !== undefined)
    await tx.objectStore("reviews").put(change.review);
  await tx.objectStore("meta").put(stored + 1, "revision");
  await tx.done;
  return stored + 1;
}
