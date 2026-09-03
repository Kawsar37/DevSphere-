import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Post Ranking Business Logic", () => {
  // Authoritative ranking formula: score = (likes - dislikes) + (commentCount * 2)
  const calculateScore = (likes: number, dislikes: number, comments: number): number => {
    return (likes - dislikes) + (comments * 2);
  };

  it("should calculate score correctly for positive likes and comments", () => {
    // 10 likes, 2 dislikes, 5 comments -> (10 - 2) + (5 * 2) = 8 + 10 = 18
    const score = calculateScore(10, 2, 5);
    assert.equal(score, 18);
  });

  it("should calculate score correctly with 0 engagement", () => {
    const score = calculateScore(0, 0, 0);
    assert.equal(score, 0);
  });

  it("should prioritize high discussion volume even with negative vote delta", () => {
    // 2 likes, 5 dislikes, 10 comments -> (2 - 5) + (10 * 2) = -3 + 20 = 17
    const controversialWithDiscussion = calculateScore(2, 5, 10);
    // 5 likes, 0 dislikes, 1 comment -> (5 - 0) + (1 * 2) = 7
    const likedWithoutDiscussion = calculateScore(5, 0, 1);

    assert.ok(
      controversialWithDiscussion > likedWithoutDiscussion,
      "High-discussion posts should be elevated by the 2x multiplier"
    );
  });

  it("should rank posts deterministically with tie-breaker by createdAt descending", () => {
    const posts = [
      { id: "p1", likes: 5, dislikes: 1, comments: 2, createdAt: new Date("2026-01-01T10:00:00Z") },
      { id: "p2", likes: 8, dislikes: 0, comments: 0, createdAt: new Date("2026-01-02T10:00:00Z") },
      { id: "p3", likes: 5, dislikes: 1, comments: 2, createdAt: new Date("2026-01-03T10:00:00Z") },
    ];

    // p1 score: (5 - 1) + 4 = 8
    // p2 score: (8 - 0) + 0 = 8
    // p3 score: (5 - 1) + 4 = 8
    // All have identical score 8. Tie breaker: newer createdAt comes first.
    const sorted = [...posts].sort((a, b) => {
      const scoreA = calculateScore(a.likes, a.dislikes, a.comments);
      const scoreB = calculateScore(b.likes, b.dislikes, b.comments);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    assert.equal(sorted[0].id, "p3", "Newest tied post should rank first");
    assert.equal(sorted[1].id, "p2", "Second newest tied post should rank second");
    assert.equal(sorted[2].id, "p1", "Oldest tied post should rank last");
  });
});
