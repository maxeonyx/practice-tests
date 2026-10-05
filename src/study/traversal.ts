import { question, type Question } from "../content/curriculum";
import type { Session, AnswerRating } from "./state";
export function canStepBack(s: Session, q: Question): boolean {
  return (
    q.prerequisiteQuestionIds.some((id) => !s.seenIds.includes(id)) &&
    !s.decomposedIds.includes(q.id)
  );
}
function move(s: Session, id: string): Session {
  return {
    ...s,
    questionId: id,
    phase: "answer",
    claim: null,
    selectedChoice: undefined,
  };
}
export function decompose(s: Session, q: Question): Session {
  const children = q.prerequisiteQuestionIds.filter(
    (id) => !s.seenIds.includes(id),
  );
  if (children.length === 0)
    throw new Error(
      `Cannot step back from ${q.id}: all its supporting cards have already been visited. Reveal the answer or continue instead.`,
    );
  return move(
    {
      ...s,
      frames: [
        ...s.frames,
        { parentId: q.id, childIds: children, remainingIds: children.slice(1) },
      ],
      decomposedIds: [...s.decomposedIds, q.id],
    },
    children[0],
  );
}
export function advance(s: Session, rating: AnswerRating): Session {
  const frame = s.frames.at(-1);
  if (frame === undefined)
    return { ...s, phase: "complete", completedRating: rating };
  if (frame.remainingIds.length > 0) {
    const nextId = frame.remainingIds[0];
    return move(
      {
        ...s,
        frames: [
          ...s.frames.slice(0, -1),
          { ...frame, remainingIds: frame.remainingIds.slice(1) },
        ],
      },
      nextId,
    );
  }
  let next = move({ ...s, frames: s.frames.slice(0, -1) }, frame.parentId);
  const response = s.openResponses?.[frame.parentId];
  if (
    question(frame.parentId).interaction?.type === "open-answer" &&
    response?.stage === "supports"
  ) {
    const ready = question(frame.parentId).prerequisiteQuestionIds.every((id) =>
      (s.recalledIds ?? []).includes(id),
    );
    next = {
      ...next,
      phase: ready ? "answer" : "feedback",
      claim: ready ? null : "unknown",
      openResponses: {
        ...s.openResponses,
        [frame.parentId]: { ...response, stage: ready ? "write" : "model" },
      },
    };
  }
  return next;
}
