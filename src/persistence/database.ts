import { openDB, type DBSchema } from "idb";
import {
  initialPreferences,
  type Preferences,
  type StudyAttempt,
  type ReviewState,
} from "../study/state";
interface RevisionDB extends DBSchema {
  preferences: { key: string; value: Preferences };
  attempts: { key: string; value: StudyAttempt };
  reviews: { key: string; value: ReviewState };
}
const database = openDB<RevisionDB>("kira-revision", 1, {
  upgrade(db) {
    db.createObjectStore("preferences");
    db.createObjectStore("attempts", { keyPath: "id" });
    db.createObjectStore("reviews", { keyPath: "questionId" });
  },
  blocked() {
    window.dispatchEvent(new Event("storage-blocked"));
  },
  blocking(_old, _new, event) {
    (event.target as IDBDatabase).close();
  },
});
export async function loadPreferences(): Promise<Preferences> {
  const saved = await (await database).get("preferences", "learner");
  if (
    saved !== undefined &&
    (saved.schemaVersion !== 1 ||
      ![null, 5, 20, 60].includes(saved.availableMinutes))
  ) {
    throw new Error(
      "Saved revision preferences have an unsupported format. Do not clear storage; check the application schema migration.",
    );
  }
  return saved ?? { ...initialPreferences };
}
export async function savePreferences(preferences: Preferences): Promise<void> {
  await (await database).put("preferences", preferences, "learner");
}
