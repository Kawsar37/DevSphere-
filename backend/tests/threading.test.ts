import { describe, it } from "node:test";
import assert from "node:assert/strict";

interface RawComment {
  id: string;
  parentId: string | null;
  body: string;
}

interface ThreadNode extends RawComment {
  replies: ThreadNode[];
}

function buildTree(comments: RawComment[]): ThreadNode[] {
  const map = new Map<string, ThreadNode>();
  const roots: ThreadNode[] = [];

  comments.forEach((c) => {
    map.set(c.id, { ...c, replies: [] });
  });

  comments.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

describe("Threaded Discussion Hierarchy Logic", () => {
  it("should assemble flat comments into correct multi-level recursive tree", () => {
    const flatList: RawComment[] = [
      { id: "c1", parentId: null, body: "Root Comment 1" },
      { id: "c2", parentId: "c1", body: "Reply to C1" },
      { id: "c3", parentId: "c2", body: "Reply to Reply C2 (nested grandchild)" },
      { id: "c4", parentId: null, body: "Root Comment 2" },
      { id: "c5", parentId: "c4", body: "Reply to C4" },
    ];

    const tree = buildTree(flatList);

    // Root comments verification
    assert.equal(tree.length, 2, "There should be exactly 2 root comments");
    assert.equal(tree[0].id, "c1");
    assert.equal(tree[1].id, "c4");

    // Nested reply verification
    assert.equal(tree[0].replies.length, 1, "C1 should have 1 direct reply");
    assert.equal(tree[0].replies[0].id, "c2");

    // Grandchild nested reply verification
    assert.equal(tree[0].replies[0].replies.length, 1, "C2 should have 1 nested reply");
    assert.equal(tree[0].replies[0].replies[0].id, "c3");

    // C4 replies verification
    assert.equal(tree[1].replies.length, 1, "C4 should have 1 reply");
    assert.equal(tree[1].replies[0].id, "c5");
  });

  it("should handle empty discussion gracefully", () => {
    const tree = buildTree([]);
    assert.deepEqual(tree, []);
  });

  it("should treat orphaned comments as root if parent does not exist in tree", () => {
    const flatList: RawComment[] = [
      { id: "c1", parentId: "missing_parent", body: "Orphaned comment" },
    ];
    const tree = buildTree(flatList);
    assert.equal(tree.length, 1, "Orphaned comment should be preserved as root");
  });
});
