import { describe, it } from "node:test";
import assert from "node:assert/strict";

interface TargetDoc {
  likesCount: number;
  dislikesCount: number;
  commentCount: number;
  rankScore: number;
}

type ReactionType = "like" | "dislike";

interface ReactionState {
  currentReaction: ReactionType | null;
  target: TargetDoc;
}

function applyReaction(
  state: ReactionState,
  newReaction: ReactionType
): { finalReaction: ReactionType | null; target: TargetDoc } {
  const { currentReaction, target } = state;
  let deltaLikes = 0;
  let deltaDislikes = 0;
  let finalReaction: ReactionType | null = null;

  if (currentReaction === newReaction) {
    // Toggle OFF
    if (newReaction === "like") deltaLikes = -1;
    else deltaDislikes = -1;
    finalReaction = null;
  } else if (currentReaction) {
    // Flip
    if (newReaction === "like") {
      deltaLikes = 1;
      deltaDislikes = -1;
    } else {
      deltaLikes = -1;
      deltaDislikes = 1;
    }
    finalReaction = newReaction;
  } else {
    // Add new
    if (newReaction === "like") deltaLikes = 1;
    else deltaDislikes = 1;
    finalReaction = newReaction;
  }

  const updatedTarget: TargetDoc = {
    likesCount: Math.max(0, target.likesCount + deltaLikes),
    dislikesCount: Math.max(0, target.dislikesCount + deltaDislikes),
    commentCount: target.commentCount,
    rankScore:
      Math.max(0, target.likesCount + deltaLikes) -
      Math.max(0, target.dislikesCount + deltaDislikes) +
      target.commentCount * 2,
  };

  return { finalReaction, target: updatedTarget };
}

describe("Reaction State Machine & Ranking Transitions", () => {
  it("should add a like when no prior reaction exists", () => {
    const initial: ReactionState = {
      currentReaction: null,
      target: { likesCount: 0, dislikesCount: 0, commentCount: 2, rankScore: 4 },
    };

    const result = applyReaction(initial, "like");
    assert.equal(result.finalReaction, "like");
    assert.equal(result.target.likesCount, 1);
    assert.equal(result.target.dislikesCount, 0);
    assert.equal(result.target.rankScore, 5); // (1 - 0) + (2 * 2) = 5
  });

  it("should flip from like to dislike and adjust counters and rankScore accordingly", () => {
    const stateWithLike: ReactionState = {
      currentReaction: "like",
      target: { likesCount: 1, dislikesCount: 0, commentCount: 2, rankScore: 5 },
    };

    const result = applyReaction(stateWithLike, "dislike");
    assert.equal(result.finalReaction, "dislike");
    assert.equal(result.target.likesCount, 0);
    assert.equal(result.target.dislikesCount, 1);
    assert.equal(result.target.rankScore, 3); // (0 - 1) + (2 * 2) = 3
  });

  it("should remove reaction when active reaction is clicked again", () => {
    const stateWithDislike: ReactionState = {
      currentReaction: "dislike",
      target: { likesCount: 0, dislikesCount: 1, commentCount: 2, rankScore: 3 },
    };

    const result = applyReaction(stateWithDislike, "dislike");
    assert.equal(result.finalReaction, null);
    assert.equal(result.target.likesCount, 0);
    assert.equal(result.target.dislikesCount, 0);
    assert.equal(result.target.rankScore, 4); // (0 - 0) + (2 * 2) = 4
  });
});
